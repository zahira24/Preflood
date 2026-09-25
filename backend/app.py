import json
import math
import os
from dotenv import load_dotenv
import secrets
import sqlite3
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from flask import Flask, g, jsonify, request, send_from_directory, session
from backend.database.db import connect, init_db, utc_now
from backend.models.entities import row_dict, rows_dict
from backend.services.auth import create_user, load_user, login_user, require_auth, require_role
from backend.services.risk import current_risk
from ml.risk_engine import evaluate_risk


ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

def calculate_haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def decode_polyline(polyline_str):
    if not polyline_str:
        return []
    index, lat, lng = 0, 0, 0
    coordinates = []
    length = len(polyline_str)
    while index < length:
        byte, shift, result = 0, 0, 0
        while True:
            byte = ord(polyline_str[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat

        byte, shift, result = 0, 0, 0
        while True:
            byte = ord(polyline_str[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        dlng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += dlng

        coordinates.append([lng / 100000.0, lat / 100000.0])
    return coordinates


def create_app(test_config=None):
    app = Flask(__name__, static_folder=str(ROOT / "frontend"), static_url_path="/static")
    app.config.update(
        SECRET_KEY=os.getenv("SECRET_KEY") or secrets.token_urlsafe(32),
        PORT=int(os.getenv("PORT", "5000")),
        DEBUG=os.getenv("FLASK_DEBUG", "0") == "1",
        MAX_CONTENT_LENGTH=1024 * 1024,
        GOOGLE_MAPS_API_KEY=os.getenv("GOOGLE_MAPS_API_KEY", ""),
    )
    if test_config:
        app.config.update(test_config)
    with app.app_context():
        init_db()

    @app.before_request
    def before_request():
        g.db = connect()
        g.user = load_user(g.db)

    @app.teardown_request
    def teardown_request(_error):
        db = g.pop("db", None)
        if db:
            db.close()

    @app.errorhandler(sqlite3.IntegrityError)
    def integrity_error(_error):
        return jsonify(error="That value is already in use or violates a data rule"), 409

    @app.errorhandler(413)
    def too_large(_error):
        return jsonify(error="Request is too large"), 413

    def body():
        value = request.get_json(silent=True)
        return value if isinstance(value, dict) else {}

    def as_json(user):
        result = row_dict(user)
        result.pop("password_hash", None)
        return result

    def parse_coords(payload, required=False):
        lat, lng = payload.get("lat"), payload.get("lng")
        if lat in (None, "") and lng in (None, "") and not required:
            return None, None
        try:
            lat, lng = float(lat), float(lng)
        except (TypeError, ValueError):
            raise ValueError("Latitude and longitude must be numbers")
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            raise ValueError("Latitude or longitude is out of range")
        return lat, lng

    def reconcile_evacuations():
        now = datetime.now(timezone.utc)
        overdue = g.db.execute(
            "SELECT * FROM evacuations WHERE status = 'started' AND safe_deadline < ?", (utc_now(),)
        ).fetchall()
        for evacuation in overdue:
            g.db.execute(
                "UPDATE evacuations SET status = 'escalated', escalated_at = ? WHERE id = ?",
                (utc_now(), evacuation["id"]),
            )
            exists = g.db.execute(
                "SELECT 1 FROM rescue_requests WHERE user_id = ? AND status IN ('open', 'assigned')",
                (evacuation["user_id"],),
            ).fetchone()
            if not exists:
                user = g.db.execute("SELECT * FROM users WHERE id = ?", (evacuation["user_id"],)).fetchone()
                g.db.execute(
                    """INSERT INTO rescue_requests
                    (user_id, name, phone, lat, lng, address, people_count, emergency,
                     accessibility_json, status, notes, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, 'open', ?, ?)""",
                    (user["id"], user["name"], "Not provided", evacuation["lat"], evacuation["lng"],
                     user["home_label"] or "", user["accessibility_json"],
                     "Automatic escalation: no I AM SAFE confirmation within the safety window.", utc_now()),
                )
        if overdue:
            g.db.commit()
        return now

    @app.get("/")
    def index():
        return send_from_directory(ROOT / "frontend" / "pages", "index.html")

    @app.get("/offline.html")
    def offline_page():
        return send_from_directory(ROOT / "frontend" / "offline", "offline.html")

    @app.get("/css/<path:name>")
    def css(name):
        return send_from_directory(ROOT / "frontend" / "css", name)

    @app.get("/js/<path:name>")
    def js(name):
        return send_from_directory(ROOT / "frontend" / "js", name)

    @app.get("/service-worker.js")
    def service_worker():
        return send_from_directory(ROOT / "frontend" / "offline", "service-worker.js")

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", service="PreFlood API")

    @app.get("/api/config")
    def get_config():
        key = app.config.get("GOOGLE_MAPS_API_KEY", "")
        return jsonify(
            google_maps_api_key=key,
            has_google_maps=bool(key),
        )

    @app.post("/api/location")
    def update_user_location():
        payload = body()
        try:
            lat, lng = parse_coords(payload, required=True)
        except ValueError as error:
            return jsonify(error=str(error)), 400

        if g.user:
            g.db.execute(
                "UPDATE users SET home_lat = ?, home_lng = ? WHERE id = ?",
                (lat, lng, g.user["id"]),
            )
            g.db.commit()

        return jsonify(
            status="location_updated",
            lat=lat,
            lng=lng,
            user_id=g.user["id"] if g.user else None,
        )

    @app.post("/api/auth/register")
    def register():
        try:
            user = create_user(g.db, body())
            g.db.commit()
            session.clear()
            session["user_id"] = user["id"]
            return jsonify(user=as_json(user)), 201
        except ValueError as error:
            return jsonify(error=str(error)), 400

    @app.post("/api/auth/login")
    def login():
        payload = body()
        if not payload.get("email") or not payload.get("password"):
            return jsonify(error="Email and password are required"), 400
        user = login_user(g.db, payload["email"], payload["password"])
        if not user:
            return jsonify(error="Incorrect email or password"), 401
        return jsonify(user=as_json(user))

    @app.post("/api/auth/logout")
    def logout():
        session.clear()
        return jsonify(status="logged_out")

    @app.get("/api/auth/me")
    def me():
        return jsonify(user=as_json(g.user) if g.user else None)

    @app.patch("/api/profile")
    @require_auth
    def profile():
        payload = body()
        try:
            lat, lng = parse_coords(payload)
        except ValueError as error:
            return jsonify(error=str(error)), 400
        accessibility = payload.get("accessibility", [])
        if not isinstance(accessibility, list) or len(accessibility) > 20:
            return jsonify(error="Accessibility preferences must be a list"), 400
        language = str(payload.get("language", "en"))[:10]
        g.db.execute(
            """UPDATE users SET home_lat = COALESCE(?, home_lat), home_lng = COALESCE(?, home_lng),
            home_label = COALESCE(?, home_label), language = ?, accessibility_json = ? WHERE id = ?""",
            (lat, lng, payload.get("home_label"), language, json.dumps(accessibility), g.user["id"]),
        )
        g.db.commit()
        return jsonify(user=as_json(g.db.execute("SELECT * FROM users WHERE id = ?", (g.user["id"],)).fetchone()))

    @app.get("/api/risk/current")
    def risk_current():
        return jsonify(risk=current_risk(ROOT, db=g.db))

    @app.post("/api/risk/evaluate")
    @require_auth
    def risk_evaluate():
        risk = evaluate_risk(body())
        from backend.services.risk import sync_risk_alert
        sync_risk_alert(g.db, risk)
        return jsonify(risk=risk)

    @app.get("/api/alerts")
    def alerts():
        rows = g.db.execute("SELECT * FROM alerts WHERE active = 1 ORDER BY created_at DESC").fetchall()
        return jsonify(alerts=rows_dict(rows))

    @app.post("/api/alerts")
    @require_role("admin", "responder")
    def create_alert():
        payload = body()
        title, message, severity = (str(payload.get(k, "")).strip() for k in ("title", "message", "severity"))
        if not title or not message or severity not in ("LOW", "MODERATE", "HIGH", "CRITICAL"):
            return jsonify(error="Title, message, and a valid severity are required"), 400
        g.db.execute(
            "INSERT INTO alerts (title, message, severity, area, created_at) VALUES (?, ?, ?, ?, ?)",
            (title[:120], message[:1000], severity, str(payload.get("area", "Your registered area"))[:120], utc_now()),
        )
        g.db.commit()
        return jsonify(status="created"), 201

    @app.get("/api/shelters")
    def shelters():
        active_only = request.args.get("active", "1") != "0"
        only_available = request.args.get("available", "0") == "1"
        user_lat = request.args.get("lat")
        user_lng = request.args.get("lng")

        query = "SELECT * FROM shelters"
        conditions = []
        if active_only:
            conditions.append("active = 1")
        if only_available:
            conditions.append("occupancy < capacity")

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        rows = g.db.execute(query).fetchall()
        shelter_list = rows_dict(rows)

        if user_lat is not None and user_lng is not None:
            try:
                u_lat, u_lng = float(user_lat), float(user_lng)
                for s in shelter_list:
                    s["distance_km"] = round(calculate_haversine(u_lat, u_lng, s["lat"], s["lng"]), 2)
                shelter_list.sort(key=lambda x: x["distance_km"])
            except ValueError:
                shelter_list.sort(key=lambda x: x["name"])
        else:
            shelter_list.sort(key=lambda x: x["name"])

        return jsonify(shelters=shelter_list)

    @app.post("/api/shelters")
    @require_role("admin")
    def add_shelter():
        payload = body()
        try:
            lat, lng = parse_coords(payload, required=True)
            capacity = int(payload.get("capacity"))
        except (ValueError, TypeError):
            return jsonify(error="Valid latitude, longitude, and positive capacity are required"), 400
        name, address = str(payload.get("name", "")).strip(), str(payload.get("address", "")).strip()
        if not name or not address or capacity < 1:
            return jsonify(error="Name, address, and positive capacity are required"), 400
        g.db.execute(
            """INSERT INTO shelters (name, address, lat, lng, capacity, accessibility_json, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (name[:120], address[:240], lat, lng, capacity, json.dumps(payload.get("accessibility", [])),
             str(payload.get("notes", ""))[:500], utc_now()),
        )
        g.db.commit()
        return jsonify(status="created"), 201

    @app.patch("/api/shelters/<int:shelter_id>")
    @require_role("admin")
    def update_shelter(shelter_id):
        payload = body()
        shelter = g.db.execute("SELECT * FROM shelters WHERE id = ?", (shelter_id,)).fetchone()
        if not shelter:
            return jsonify(error="Shelter not found"), 404
        if "active" in payload:
            g.db.execute("UPDATE shelters SET active = ? WHERE id = ?", (1 if payload["active"] else 0, shelter_id))
        for field in ("name", "address", "notes"):
            if field in payload and str(payload[field]).strip():
                g.db.execute(f"UPDATE shelters SET {field} = ? WHERE id = ?", (str(payload[field]).strip()[:500], shelter_id))
        if "capacity" in payload:
            try:
                capacity = int(payload["capacity"])
            except (ValueError, TypeError):
                return jsonify(error="Capacity must be a whole number"), 400
            if capacity < shelter["occupancy"] or capacity < 1:
                return jsonify(error="Capacity cannot be below current occupancy"), 400
            g.db.execute("UPDATE shelters SET capacity = ? WHERE id = ?", (capacity, shelter_id))
        g.db.commit()
        return jsonify(shelter=row_dict(g.db.execute("SELECT * FROM shelters WHERE id = ?", (shelter_id,)).fetchone()))

    @app.delete("/api/shelters/<int:shelter_id>")
    @require_role("admin")
    def delete_shelter(shelter_id):
        shelter = g.db.execute("SELECT * FROM shelters WHERE id = ?", (shelter_id,)).fetchone()
        if not shelter:
            return jsonify(error="Shelter not found"), 404
        if shelter["occupancy"]:
            return jsonify(error="Deactivate a shelter with occupancy instead of removing it"), 409
        g.db.execute("DELETE FROM shelters WHERE id = ?", (shelter_id,))
        g.db.commit()
        return jsonify(status="removed")

    @app.post("/api/evacuations")
    @require_auth
    def start_evacuation():
        reconcile_evacuations()
        payload = body()
        try:
            lat, lng = parse_coords(payload)
        except ValueError as error:
            return jsonify(error=str(error)), 400
        existing = g.db.execute("SELECT * FROM evacuations WHERE user_id = ? AND status = 'started'", (g.user["id"],)).fetchone()
        if existing:
            return jsonify(evacuation=row_dict(existing))
        now = datetime.now(timezone.utc).replace(microsecond=0)
        deadline = now + timedelta(seconds=180)
        g.db.execute(
            """INSERT INTO evacuations (user_id, status, lat, lng, started_at, safe_deadline)
            VALUES (?, 'started', ?, ?, ?, ?)""",
            (g.user["id"], lat, lng, now.isoformat(), deadline.isoformat()),
        )
        g.db.commit()
        return jsonify(evacuation=row_dict(g.db.execute("SELECT * FROM evacuations WHERE id = last_insert_rowid()").fetchone())), 201

    @app.get("/api/evacuations")
    @require_auth
    def evacuations():
        reconcile_evacuations()
        rows = g.db.execute("SELECT * FROM evacuations WHERE user_id = ? ORDER BY started_at DESC", (g.user["id"],)).fetchall()
        return jsonify(evacuations=rows_dict(rows))

    @app.post("/api/evacuations/<int:evacuation_id>/safe")
    @require_auth
    def mark_safe(evacuation_id):
        row = g.db.execute("SELECT * FROM evacuations WHERE id = ? AND user_id = ?", (evacuation_id, g.user["id"])).fetchone()
        if not row:
            return jsonify(error="Evacuation not found"), 404
        g.db.execute("UPDATE evacuations SET status = 'safe', safe_at = ? WHERE id = ?", (utc_now(), evacuation_id))
        g.db.execute(
            "UPDATE rescue_requests SET status = 'resolved' WHERE user_id = ? AND status IN ('open', 'assigned') AND notes LIKE '%Automatic escalation%'",
            (g.user["id"],)
        )
        g.db.commit()
        return jsonify(status="safe")

    @app.post("/api/evacuations/<int:evacuation_id>/shelter")
    @require_auth
    def select_shelter(evacuation_id):
        payload = body()
        try:
            shelter_id = int(payload.get("shelter_id"))
        except (ValueError, TypeError):
            return jsonify(error="Shelter is required"), 400
        shelter = g.db.execute("SELECT * FROM shelters WHERE id = ? AND active = 1", (shelter_id,)).fetchone()
        evacuation = g.db.execute("SELECT * FROM evacuations WHERE id = ? AND user_id = ?", (evacuation_id, g.user["id"])).fetchone()
        if not shelter or not evacuation:
            return jsonify(error="Available shelter or evacuation not found"), 404
        if shelter["occupancy"] >= shelter["capacity"]:
            return jsonify(error="That shelter is full"), 409
        g.db.execute("UPDATE evacuations SET shelter_id = ? WHERE id = ?", (shelter_id, evacuation_id))
        g.db.commit()
        return jsonify(shelter=row_dict(shelter))

    @app.post("/api/shelters/allocate")
    @require_auth
    def allocate_shelters():
        payload = body()
        try:
            lat, lng = parse_coords(payload, required=True)
            headcount = int(payload.get("headcount", payload.get("total_people", 1)))
        except (ValueError, TypeError):
            return jsonify(error="Valid latitude, longitude, and headcount are required"), 400
        if headcount < 1 or headcount > 1000:
            return jsonify(error="Headcount must be between 1 and 1000"), 400

        rows = g.db.execute("SELECT * FROM shelters WHERE active = 1 AND occupancy < capacity").fetchall()
        shelters = rows_dict(rows)

        for s in shelters:
            s["distance_km"] = round(calculate_haversine(lat, lng, s["lat"], s["lng"]), 2)
            s["vacancies"] = max(0, s["capacity"] - s["occupancy"])

        shelters.sort(key=lambda x: x["distance_km"])

        allocations = []
        remaining = headcount

        for s in shelters:
            if remaining <= 0:
                break
            vacancies = s["vacancies"]
            if vacancies <= 0:
                continue
            take = min(remaining, vacancies)
            allocations.append({
                "shelter": s,
                "allocated_count": take,
                "distance_km": s["distance_km"],
                "is_primary": (len(allocations) == 0),
            })
            remaining -= take

        return jsonify(
            total_headcount=headcount,
            allocations=allocations,
            unallocated_count=remaining,
            fully_allocated=(remaining == 0),
            message="Group successfully allocated to active shelters." if remaining == 0 else f"Could only allocate {headcount - remaining} of {headcount} members to active shelters."
        )

    @app.get("/api/route")
    @require_auth
    def route():
        try:
            from_lat, from_lng = float(request.args["from_lat"]), float(request.args["from_lng"])
            shelter_id = int(request.args["shelter_id"])
            headcount = int(request.args.get("headcount", 1))
        except (KeyError, ValueError, TypeError):
            return jsonify(error="Origin and shelter are required"), 400

        rerouted = False
        original_shelter_id = None

        shelter = g.db.execute("SELECT * FROM shelters WHERE id = ? AND active = 1", (shelter_id,)).fetchone()

        if not shelter or shelter["occupancy"] >= shelter["capacity"] or (shelter["capacity"] - shelter["occupancy"]) < headcount:
            original_shelter_id = shelter_id
            available = g.db.execute(
                "SELECT * FROM shelters WHERE active = 1 AND (capacity - occupancy) >= ? ORDER BY name",
                (headcount,)
            ).fetchall()
            if not available:
                available = g.db.execute("SELECT * FROM shelters WHERE active = 1 AND occupancy < capacity ORDER BY name").fetchall()

            if available:
                avail_list = rows_dict(available)
                for s in avail_list:
                    s["dist"] = calculate_haversine(from_lat, from_lng, s["lat"], s["lng"])
                avail_list.sort(key=lambda x: x["dist"])
                best = avail_list[0]
                shelter = g.db.execute("SELECT * FROM shelters WHERE id = ?", (best["id"],)).fetchone()
                rerouted = True
            elif not shelter:
                return jsonify(error="Shelter not found or no active shelter available"), 404

        dist_km = calculate_haversine(from_lat, from_lng, shelter["lat"], shelter["lng"])
        duration_min = max(1, int(round((dist_km / 5.0) * 60)))

        steps = [
            {"step": 1, "key": "nav_start", "dist_m": int(round(dist_km * 300))},
            {"step": 2, "key": "nav_continue", "dist_m": int(round(dist_km * 500))},
            {"step": 3, "key": "nav_turn", "dist_m": int(round(dist_km * 200))},
            {"step": 4, "key": "nav_arrive", "dist_m": 0}
        ]

        geometry_coords = None
        provider = "osrm"

        google_key = app.config.get("GOOGLE_MAPS_API_KEY")
        if google_key:
            try:
                gmaps_url = f"https://maps.googleapis.com/maps/api/directions/json?origin={from_lat},{from_lng}&destination={shelter['lat']},{shelter['lng']}&key={google_key}"
                req = urllib.request.Request(gmaps_url, headers={"User-Agent": "PreFlood/1.0"})
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    data = json.loads(resp.read().decode())
                    if data.get("status") == "OK" and data.get("routes"):
                        route_data = data["routes"][0]
                        leg = route_data["legs"][0]
                        dist_km = leg["distance"]["value"] / 1000.0
                        duration_min = max(1, int(round(leg["duration"]["value"] / 60.0)))
                        polyline_str = route_data.get("overview_polyline", {}).get("points")
                        if polyline_str:
                            geometry_coords = decode_polyline(polyline_str)
                        provider = "google"
            except Exception:
                pass

        if provider == "osrm":
            try:
                osrm_url = f"https://router.project-osrm.org/route/v1/driving/{from_lng},{from_lat};{shelter['lng']},{shelter['lat']}?overview=full&geometries=geojson&steps=true"
                req = urllib.request.Request(osrm_url, headers={"User-Agent": "PreFlood/1.0"})
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    data = json.loads(resp.read().decode())
                    if data.get("code") == "Ok" and data.get("routes"):
                        route_data = data["routes"][0]
                        dist_km = route_data["distance"] / 1000.0
                        duration_min = max(1, int(round(route_data["duration"] / 60.0)))
                        geometry_coords = route_data.get("geometry", {}).get("coordinates")

                        # Use real OSRM turn-by-turn navigation steps
                        osrm_steps = []
                        for leg in route_data.get("legs", []):
                            for step_data in leg.get("steps", []):
                                maneuver = step_data.get("maneuver", {})
                                instruction = step_data.get("name") or "Continue on the current road"
                                maneuver_type = maneuver.get("type", "")
                                modifier = maneuver.get("modifier", "")

                                if maneuver_type == "depart":
                                    text = "Start your evacuation route"
                                elif maneuver_type == "arrive":
                                    text = f"Arrive at {shelter['name']}"
                                elif modifier:
                                    text = f"Turn {modifier} onto {instruction}"
                                else:
                                    text = instruction

                                osrm_steps.append({
                                    "step": len(osrm_steps) + 1,
                                    "instruction": text,
                                    "dist_m": int(round(step_data.get("distance", 0)))
                                })

                        if osrm_steps:
                            steps = osrm_steps
            except Exception:
                pass

        url = f"https://www.google.com/maps/dir/?api=1&origin={from_lat},{from_lng}&destination={shelter['lat']},{shelter['lng']}" if provider == "google" else f"https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route={from_lat}%2C{from_lng}%3B{shelter['lat']}%2C{shelter['lng']}"
        return jsonify(
            mode="navigation",
            provider=provider,
            rerouted=rerouted,
            original_shelter_id=original_shelter_id,
            distance_km=round(dist_km, 2),
            distance_text=f"{dist_km:.2f} km",
            duration_min=duration_min,
            duration_text=f"{duration_min} mins",
            instruction=f"Travel from {from_lat:.4f}, {from_lng:.4f} to {shelter['name']} ({shelter['address']}).",
            steps=steps,
            geometry_coords=geometry_coords,
            map_url=url,
            shelter=row_dict(shelter),
        )

    @app.post("/api/checkins")
    @require_auth
    def checkin():
        payload = body()
        try:
            shelter_id = int(payload.get("shelter_id"))
            with_user = int(payload.get("people_with_user", 0))
        except (TypeError, ValueError):
            return jsonify(error="Shelter and people count are required"), 400
        if with_user < 0 or with_user > 1000:
            return jsonify(error="People with you must be between 0 and 1000"), 400
        shelter = g.db.execute("SELECT * FROM shelters WHERE id = ? AND active = 1", (shelter_id,)).fetchone()
        if not shelter:
            return jsonify(error="Available shelter not found"), 404
        total = with_user + 1
        if shelter["occupancy"] + total > shelter["capacity"]:
            return jsonify(error="Not enough capacity for your group"), 409
        g.db.execute(
            """INSERT INTO checkins (user_id, shelter_id, people_with_user, total_people, approximate, checked_in_at)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (g.user["id"], shelter_id, with_user, total, 1 if payload.get("approximate", False) else 0, utc_now()),
        )
        g.db.execute("UPDATE shelters SET occupancy = occupancy + ? WHERE id = ?", (total, shelter_id))
        g.db.commit()
        return jsonify(status="checked_in", total_people=total, approximate=bool(payload.get("approximate", False))), 201

    @app.post("/api/checkins/<int:checkin_id>/undo")
    @app.post("/api/checkins/<int:checkin_id>/checkout")
    @require_auth
    def undo_checkin(checkin_id):
        checkin = g.db.execute("SELECT * FROM checkins WHERE id = ? AND user_id = ?", (checkin_id, g.user["id"])).fetchone()
        if not checkin or checkin["undone_at"]:
            return jsonify(error="Check-in not found or already undone"), 404
        g.db.execute("UPDATE checkins SET undone_at = ? WHERE id = ?", (utc_now(), checkin_id))
        g.db.execute("UPDATE shelters SET occupancy = MAX(0, occupancy - ?) WHERE id = ?", (checkin["total_people"], checkin["shelter_id"]))
        g.db.commit()
        return jsonify(status="checked_out" if request.path.endswith("checkout") else "undone")

    @app.get("/api/checkins")
    @require_auth
    def my_checkins():
        rows = g.db.execute(
            """SELECT c.*, s.name AS shelter_name FROM checkins c JOIN shelters s ON s.id = c.shelter_id
            WHERE c.user_id = ? ORDER BY c.checked_in_at DESC""", (g.user["id"],)
        ).fetchall()
        return jsonify(checkins=rows_dict(rows))

    @app.post("/api/rescue")
    @require_auth
    def request_rescue():
        payload = body()
        try:
            lat, lng = parse_coords(payload)
            people = int(payload.get("people_count", 1))
        except (ValueError, TypeError) as error:
            return jsonify(error=str(error)), 400
        name = str(payload.get("name", g.user["name"])).strip()
        phone = str(payload.get("phone", "")).strip()
        needs = payload.get("accessibility", [])
        if not name or not phone or people < 1 or people > 1000 or not isinstance(needs, list):
            return jsonify(error="Name, phone, valid people count, and assistance needs are required"), 400
        cursor = g.db.execute(
            """INSERT INTO rescue_requests
            (user_id, name, phone, lat, lng, address, people_count, emergency, accessibility_json, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (g.user["id"], name[:100], phone[:40], lat, lng, str(payload.get("address", ""))[:240], people,
             1 if payload.get("emergency", True) else 0, json.dumps(needs[:20]), str(payload.get("notes", ""))[:500], utc_now()),
        )
        req_id = cursor.lastrowid
        g.db.commit()
        created_row = g.db.execute("SELECT * FROM rescue_requests WHERE id = ?", (req_id,)).fetchone()
        return jsonify(status="rescue_requested", request=row_dict(created_row)), 201

    @app.get("/api/rescue")
    @require_role("admin", "responder")
    def rescue_list():
        rows = g.db.execute("SELECT * FROM rescue_requests ORDER BY emergency DESC, created_at DESC").fetchall()
        return jsonify(requests=rows_dict(rows))

    @app.get("/api/rescue/my-active")
    @require_auth
    def get_my_active_rescue():
        row = g.db.execute(
            "SELECT * FROM rescue_requests WHERE user_id = ? AND status IN ('open', 'assigned') ORDER BY created_at DESC LIMIT 1",
            (g.user["id"],)
        ).fetchone()
        return jsonify(request=row_dict(row) if row else None)

    @app.get("/api/rescue/<int:request_id>")
    @require_auth
    def get_rescue(request_id):
        row = g.db.execute("SELECT * FROM rescue_requests WHERE id = ?", (request_id,)).fetchone()
        if not row:
            return jsonify(error="Rescue request not found"), 404
        is_owner = row["user_id"] is not None and row["user_id"] == g.user["id"]
        is_staff = g.user["role"] in ("admin", "responder")
        if not (is_owner or is_staff):
            return jsonify(error="Forbidden: Access denied to rescue request"), 403
        return jsonify(request=row_dict(row))

    @app.post("/api/rescue/<int:request_id>/accept")
    @require_role("admin", "responder")
    def accept_rescue(request_id):
        row = g.db.execute("SELECT * FROM rescue_requests WHERE id = ?", (request_id,)).fetchone()
        if not row:
            return jsonify(error="Rescue request not found"), 404
        payload = body()
        try:
            lat, lng = parse_coords(payload)
        except ValueError as error:
            return jsonify(error=str(error)), 400
        now = utc_now()
        g.db.execute(
            """UPDATE rescue_requests
               SET status = 'assigned', responder_id = ?, responder_name = ?,
                   responder_lat = COALESCE(?, responder_lat),
                   responder_lng = COALESCE(?, responder_lng),
                   responder_updated_at = CASE WHEN ? IS NOT NULL THEN ? ELSE responder_updated_at END
               WHERE id = ?""",
            (g.user["id"], g.user["name"], lat, lng, lat, now, request_id)
        )
        g.db.commit()
        updated = g.db.execute("SELECT * FROM rescue_requests WHERE id = ?", (request_id,)).fetchone()
        return jsonify(status="accepted", request=row_dict(updated))

    @app.post("/api/rescue/<int:request_id>/responder-location")
    @require_role("admin", "responder")
    def update_responder_location(request_id):
        row = g.db.execute("SELECT * FROM rescue_requests WHERE id = ?", (request_id,)).fetchone()
        if not row:
            return jsonify(error="Rescue request not found"), 404
        if row["status"] != "assigned":
            return jsonify(error="Rescue request is not in assigned status"), 400
        if row["responder_id"] and row["responder_id"] != g.user["id"] and g.user["role"] != "admin":
            return jsonify(error="Forbidden: Only assigned responder can update location"), 403
        payload = body()
        try:
            lat, lng = parse_coords(payload, required=True)
        except ValueError as error:
            return jsonify(error=str(error)), 400
        now = utc_now()
        g.db.execute(
            "UPDATE rescue_requests SET responder_lat = ?, responder_lng = ?, responder_updated_at = ? WHERE id = ?",
            (lat, lng, now, request_id)
        )
        g.db.commit()
        return jsonify(status="updated", lat=lat, lng=lng, responder_updated_at=now)

    @app.patch("/api/rescue/<int:request_id>")
    @require_role("admin", "responder")
    def update_rescue(request_id):
        row = g.db.execute("SELECT * FROM rescue_requests WHERE id = ?", (request_id,)).fetchone()
        if not row:
            return jsonify(error="Rescue request not found"), 404
        status = str(body().get("status", "")).strip()
        if status not in ("open", "assigned", "resolved", "cancelled"):
            return jsonify(error="Invalid rescue status"), 400
        if status == "assigned":
            g.db.execute(
                """UPDATE rescue_requests
                   SET status = ?, responder_id = COALESCE(responder_id, ?), responder_name = COALESCE(responder_name, ?)
                   WHERE id = ?""",
                (status, g.user["id"], g.user["name"], request_id)
            )
        else:
            g.db.execute("UPDATE rescue_requests SET status = ? WHERE id = ?", (status, request_id))
        g.db.commit()
        return jsonify(status="updated")

    @app.get("/api/responder/dashboard")
    @require_role("admin", "responder")
    def responder_dashboard():
        reconcile_evacuations()
        return jsonify(
            alerts=rows_dict(g.db.execute("SELECT * FROM alerts WHERE active = 1 ORDER BY created_at DESC").fetchall()),
            rescue_requests=rows_dict(g.db.execute("SELECT * FROM rescue_requests WHERE status IN ('open', 'assigned') ORDER BY emergency DESC, created_at DESC").fetchall()),
            shelters=rows_dict(g.db.execute("SELECT * FROM shelters ORDER BY name").fetchall()),
            evacuations=rows_dict(g.db.execute("SELECT e.*, u.name AS user_name FROM evacuations e JOIN users u ON u.id = e.user_id WHERE e.status IN ('started', 'escalated') ORDER BY e.started_at DESC").fetchall()),
            checkins=rows_dict(g.db.execute("SELECT c.*, s.name AS shelter_name, u.name AS user_name FROM checkins c JOIN shelters s ON s.id = c.shelter_id JOIN users u ON u.id = c.user_id WHERE c.undone_at IS NULL ORDER BY c.checked_in_at DESC").fetchall()),
        )

    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))


