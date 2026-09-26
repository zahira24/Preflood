from datetime import datetime, timedelta, timezone

from backend.database.db import connect

from .conftest import register


def test_health_and_static_shell(client):
    assert client.get("/api/health").get_json()["status"] == "ok"
    page = client.get("/")
    assert page.status_code == 200
    assert b"Predict. Warn. Evacuate. Stay Safe." in page.data


def test_current_risk_api_uses_uploaded_weather_file(client):
    response = client.get("/api/risk/current")
    assert response.status_code == 200
    risk = response.get_json()["risk"]
    assert risk["level"] == "LOW"
    assert risk["observation"]["observation_timestamp"] == "2026-08-27T23:54:21Z"
    assert risk["context"]


def test_register_login_and_profile(client):
    response = register(client)
    assert response.status_code == 201
    assert response.get_json()["user"]["email"] == "person@example.com"
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").get_json()["user"] is None
    response = client.post("/api/auth/login", json={"email": "person@example.com", "password": "Password123"})
    assert response.status_code == 200
    response = client.patch("/api/profile", json={"lat": 40.7, "lng": -74.0, "home_label": "Riverside", "accessibility": ["wheelchair"], "language": "en"})
    assert response.status_code == 200
    assert response.get_json()["user"]["home_label"] == "Riverside"


def test_invalid_registration_and_risk_api(client):
    assert client.post("/api/auth/register", json={"name": "A", "email": "bad", "password": "short"}).status_code == 400
    assert client.post("/api/risk/evaluate", json={"rainfall_1h": 40}).status_code == 401
    register(client)
    response = client.post("/api/risk/evaluate", json={"rainfall_1h": 40, "river_level": 1, "river_bankfull": 1})
    assert response.status_code == 200
    assert response.get_json()["risk"]["level"] in {"HIGH", "CRITICAL"}


def test_evacuation_shelter_route_checkin_and_undo(client):
    register(client)
    shelters = client.get("/api/shelters").get_json()["shelters"]
    shelter = shelters[0]
    evacuation = client.post("/api/evacuations", json={"lat": 40.71, "lng": -74.01}).get_json()["evacuation"]
    assert evacuation["status"] == "started"
    assert client.post(f"/api/evacuations/{evacuation['id']}/shelter", json={"shelter_id": shelter["id"]}).status_code == 200
    route = client.get(f"/api/route?from_lat=40.71&from_lng=-74.01&shelter_id={shelter['id']}")
    assert route.status_code == 200 and route.get_json()["mode"] in ("navigation", "fallback")
    checkin = client.post("/api/checkins", json={"shelter_id": shelter["id"], "people_with_user": 3, "approximate": True})
    assert checkin.status_code == 201
    assert checkin.get_json()["total_people"] == 4
    checkins = client.get("/api/checkins").get_json()["checkins"]
    assert client.post(f"/api/checkins/{checkins[0]['id']}/checkout").get_json()["status"] == "checked_out"
    assert client.post(f"/api/checkins/{checkins[0]['id']}/undo").status_code == 404
    assert client.post(f"/api/evacuations/{evacuation['id']}/safe").status_code == 200


def test_rescue_request_and_responder_view(admin_client, client):
    register(client, "help@example.com", "Help Seeker")
    response = client.post("/api/rescue", json={"name": "Help Seeker", "phone": "555-0100", "lat": 40.7, "lng": -74.0, "people_count": 2, "accessibility": ["elderly"], "emergency": True})
    assert response.status_code == 201
    response = admin_client.get("/api/responder/dashboard")
    assert response.status_code == 200
    data = response.get_json()
    assert data["rescue_requests"][0]["people_count"] == 2
    assert data["rescue_requests"][0]["accessibility"] == ["elderly"]


def test_admin_shelter_lifecycle(admin_client):
    response = admin_client.post("/api/shelters", json={"name": "Test Shelter", "address": "99 Test Way", "lat": 40.7, "lng": -74.0, "capacity": 10, "accessibility": ["child"]})
    assert response.status_code == 201
    shelters = admin_client.get("/api/shelters?active=0").get_json()["shelters"]
    shelter = next(item for item in shelters if item["name"] == "Test Shelter")
    assert admin_client.patch(f"/api/shelters/{shelter['id']}", json={"active": False}).status_code == 200
    assert shelter["id"] not in [item["id"] for item in admin_client.get("/api/shelters").get_json()["shelters"]]
    assert admin_client.patch(f"/api/shelters/{shelter['id']}", json={"active": True}).status_code == 200
    assert admin_client.delete(f"/api/shelters/{shelter['id']}").status_code == 200


def test_no_response_reconciles_to_escalation(app, client):
    register(client)
    evacuation = client.post("/api/evacuations", json={"lat": 40.7, "lng": -74.0}).get_json()["evacuation"]
    db = connect()
    old = (datetime.now(timezone.utc) - timedelta(minutes=4)).isoformat()
    db.execute("UPDATE evacuations SET safe_deadline = ? WHERE id = ?", (old, evacuation["id"]))
    db.commit(); db.close()
    response = client.get("/api/evacuations")
    assert response.get_json()["evacuations"][0]["status"] == "escalated"
    assert client.get("/api/rescue") .status_code == 403


def test_local_dev_seeded_accounts_login(client):
    res = client.post("/api/auth/login", json={"email": "responder@test.com", "password": "Test@123"})
    assert res.status_code == 200
    user = res.get_json()["user"]
    assert user["email"] == "responder@test.com"
    assert user["role"] == "responder"

    client.post("/api/auth/logout")

    res = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "Test@123"})
    assert res.status_code == 200
    user = res.get_json()["user"]
    assert user["email"] == "admin@test.com"
    assert user["role"] == "admin"


def test_responder_live_location_flow(app, client):
    # 1. User creates rescue request with GPS
    register(client, "victim@example.com", "Victim User")
    req_res = client.post("/api/rescue", json={
        "name": "Victim User",
        "phone": "555-0199",
        "lat": 40.71,
        "lng": -74.01,
        "people_count": 3,
        "accessibility": ["wheelchair"],
        "emergency": True
    })
    assert req_res.status_code == 201
    req_id = req_res.get_json()["request"]["id"]

    # Create second user to test unauthorized access
    other_client = app.test_client()
    register(other_client, "other@example.com", "Other User")

    # 4. Unauthorized user cannot view victim's rescue request
    assert other_client.get(f"/api/rescue/{req_id}").status_code == 403

    # Log in as responder
    responder_client = app.test_client()
    responder_client.post("/api/auth/login", json={"email": "responder@test.com", "password": "Test@123"})

    # 2. Responder accepts request
    accept_res = responder_client.post(f"/api/rescue/{req_id}/accept", json={"lat": 40.72, "lng": -74.02})
    assert accept_res.status_code == 200
    acc_data = accept_res.get_json()
    assert acc_data["status"] == "accepted"
    assert acc_data["request"]["status"] == "assigned"
    assert acc_data["request"]["responder_name"] == "Rescue Team Responder"

    # Create second responder to test unauthorized responder location updates
    other_responder = app.test_client()
    register(other_responder, "responder2@example.com", "Responder 2")
    db = connect()
    db.execute("UPDATE users SET role = 'responder' WHERE email = 'responder2@example.com'")
    db.commit(); db.close()
    assert other_responder.post(f"/api/rescue/{req_id}/responder-location", json={"lat": 40.73, "lng": -74.03}).status_code == 403

    # 3. Responder location update is authorized for assigned responder
    loc_res = responder_client.post(f"/api/rescue/{req_id}/responder-location", json={"lat": 40.725, "lng": -74.025})
    assert loc_res.status_code == 200
    assert loc_res.get_json()["lat"] == 40.725

    # 5. User can retrieve the assigned responder's latest location
    user_view = client.get(f"/api/rescue/{req_id}")
    assert user_view.status_code == 200
    u_req = user_view.get_json()["request"]
    assert u_req["status"] == "assigned"
    assert u_req["responder_lat"] == 40.725
    assert u_req["responder_lng"] == -74.025
    assert u_req["responder_name"] == "Rescue Team Responder"

    # 6. Resolved requests stop active responder tracking (status updated to resolved)
    patch_res = responder_client.patch(f"/api/rescue/{req_id}", json={"status": "resolved"})
    assert patch_res.status_code == 200
    
    # Updating location on resolved request returns error (not in assigned status)
    assert responder_client.post(f"/api/rescue/{req_id}/responder-location", json={"lat": 40.73, "lng": -74.03}).status_code == 400


def test_chunk1_evacuation_journey_flow(admin_client, client):
    # 1. Available shelter retrieval, distance sorting, active/full exclusions
    # Add an inactive shelter and a full shelter via admin
    admin_client.post("/api/shelters", json={"name": "Inactive Shelter", "address": "1 Inactive St", "lat": 40.715, "lng": -74.005, "capacity": 10})
    shelters_all = admin_client.get("/api/shelters?active=0").get_json()["shelters"]
    inact_s = next(s for s in shelters_all if s["name"] == "Inactive Shelter")
    admin_client.patch(f"/api/shelters/{inact_s['id']}", json={"active": False})

    admin_client.post("/api/shelters", json={"name": "Full Shelter", "address": "2 Full St", "lat": 40.716, "lng": -74.006, "capacity": 2})
    shelters_all = admin_client.get("/api/shelters?active=0").get_json()["shelters"]
    full_s = next(s for s in shelters_all if s["name"] == "Full Shelter")
    
    # Fill the full shelter
    db = connect()
    db.execute("UPDATE shelters SET occupancy = 2 WHERE id = ?", (full_s["id"],))
    db.commit(); db.close()

    # Query available shelters sorted by distance to user (lat=40.71, lng=-74.01)
    avail_res = client.get("/api/shelters?active=1&available=1&lat=40.71&lng=-74.01")
    assert avail_res.status_code == 200
    avail_shelters = avail_res.get_json()["shelters"]
    avail_ids = [s["id"] for s in avail_shelters]

    assert inact_s["id"] not in avail_ids
    assert full_s["id"] not in avail_ids
    assert "distance_km" in avail_shelters[0]

    # 2. Register user & start evacuation journey
    register(client, "evacuee@example.com", "Evacuee Person")
    evac_res = client.post("/api/evacuations", json={"lat": 40.71, "lng": -74.01})
    assert evac_res.status_code == 201
    evac = evac_res.get_json()["evacuation"]
    assert evac["status"] == "started"

    # Select target shelter
    target_s = avail_shelters[0]
    sel_res = client.post(f"/api/evacuations/{evac['id']}/shelter", json={"shelter_id": target_s["id"]})
    assert sel_res.status_code == 200

        # 3. User to shelter routing & turn-by-turn navigation steps
    route_res = client.get(f"/api/route?from_lat=40.71&from_lng=-74.01&shelter_id={target_s['id']}")
    assert route_res.status_code == 200
    r_data = route_res.get_json()
    assert r_data["mode"] == "navigation"
    assert "distance_km" in r_data
    assert "duration_min" in r_data
    assert len(r_data["steps"]) >= 4
    assert r_data["steps"][0]["step"] == 1
    assert "instruction" in r_data["steps"][0]

    # Test route unavailable / missing params
    assert client.get("/api/route").status_code == 400

    # 4. Shelter check-in & headcount update
    checkin_res = client.post(
        "/api/checkins",
        json={
            "shelter_id": target_s["id"],
            "people_with_user": 2,
            "approximate": True
        }
    )
    assert checkin_res.status_code == 201
    assert checkin_res.get_json()["total_people"] == 3

    # 5. Undo check-in
    my_checkins = client.get("/api/checkins").get_json()["checkins"]
    undo_res = client.post(f"/api/checkins/{my_checkins[0]['id']}/undo")
    assert undo_res.status_code == 200

    # Check restored occupancy
    restored_s = client.get("/api/shelters").get_json()["shelters"]
    ts_restored = next(s for s in restored_s if s["id"] == target_s["id"])
    assert ts_restored["occupancy"] == target_s["occupancy"]

    # 6. Re-checkin and confirm I AM SAFE
    client.post("/api/checkins", json={"shelter_id": target_s["id"], "people_with_user": 1})
    safe_res = client.post(f"/api/evacuations/{evac['id']}/safe")
    assert safe_res.status_code == 200
    assert safe_res.get_json()["status"] == "safe"


def test_high_risk_auto_alerts_and_deduplication(client):
    register(client)
    # Evaluate high risk
    res1 = client.post("/api/risk/evaluate", json={"rainfall_1h": 50, "river_level": 2.0, "river_bankfull": 1.0})
    assert res1.status_code == 200
    assert res1.get_json()["risk"]["level"] in ("HIGH", "CRITICAL")

    # Verify automated alert was inserted
    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.get_json()["alerts"]
    high_alerts = [a for a in alerts if a["severity"] in ("HIGH", "CRITICAL")]
    assert len(high_alerts) == 1

    # Evaluate high risk again -> should deduplicate and not insert extra alert
    res2 = client.post("/api/risk/evaluate", json={"rainfall_1h": 50, "river_level": 2.0, "river_bankfull": 1.0})
    assert res2.status_code == 200

    alerts_res2 = client.get("/api/alerts")
    alerts2 = alerts_res2.get_json()["alerts"]
    high_alerts2 = [a for a in alerts2 if a["severity"] in ("HIGH", "CRITICAL")]
    assert len(high_alerts2) == 1


def test_end_to_end_user_rescue_to_responder_desk_and_resolution(app, client):
    # 1. User submits priority rescue request
    register(client, "victim_e2e@example.com", "E2E Victim")
    res = client.post("/api/rescue", json={
        "name": "E2E Victim",
        "phone": "555-9999",
        "lat": 40.7128,
        "lng": -74.0060,
        "people_count": 4,
        "accessibility": ["wheelchair", "elderly"],
        "emergency": True,
        "notes": "Trapped on roof"
    })
    assert res.status_code == 201
    req = res.get_json()["request"]
    req_id = req["id"]
    assert req["status"] == "open"

    # User checks active rescue
    my_active = client.get("/api/rescue/my-active").get_json()["request"]
    assert my_active["id"] == req_id
    assert my_active["people_count"] == 4

    # 2. Responder checks dashboard and sees request
    resp_client = app.test_client()
    resp_client.post("/api/auth/login", json={"email": "responder@test.com", "password": "Test@123"})
    dash = resp_client.get("/api/responder/dashboard").get_json()
    resp_reqs = [r for r in dash["rescue_requests"] if r["id"] == req_id]
    assert len(resp_reqs) == 1
    assert resp_reqs[0]["notes"] == "Trapped on roof"

    # 3. Responder accepts request
    acc = resp_client.post(f"/api/rescue/{req_id}/accept", json={"lat": 40.7200, "lng": -74.0100})
    assert acc.status_code == 200
    assert acc.get_json()["request"]["responder_name"] == "Rescue Team Responder"

    # 4. User views updated status and responder details
    user_view = client.get(f"/api/rescue/{req_id}").get_json()["request"]
    assert user_view["status"] == "assigned"
    assert user_view["responder_name"] == "Rescue Team Responder"
    assert user_view["responder_lat"] == 40.7200

    # 5. Responder updates live location
    loc_upd = resp_client.post(f"/api/rescue/{req_id}/responder-location", json={"lat": 40.7150, "lng": -74.0080})
    assert loc_upd.status_code == 200

    user_view2 = client.get(f"/api/rescue/{req_id}").get_json()["request"]
    assert user_view2["responder_lat"] == 40.7150

    # 6. Responder marks request resolved
    patch_res = resp_client.patch(f"/api/rescue/{req_id}", json={"status": "resolved"})
    assert patch_res.status_code == 200

    # User active rescue should now be None
    my_active_after = client.get("/api/rescue/my-active").get_json()["request"]
    assert my_active_after is None


def test_security_role_protections(app, client):
    # 1. Unauthenticated requests to protected routes fail
    assert client.get("/api/rescue/my-active").status_code == 401
    assert client.post("/api/evacuations", json={}).status_code == 401

    # 2. Normal user cannot access responder/admin routes
    register(client, "normal_user@example.com", "Normal User")
    assert client.get("/api/rescue").status_code == 403
    assert client.get("/api/responder/dashboard").status_code == 403
    assert client.post("/api/alerts", json={"title": "T", "message": "M", "severity": "HIGH"}).status_code == 403
    assert client.post("/api/shelters", json={"name": "S", "address": "A", "lat": 40.7, "lng": -74.0, "capacity": 10}).status_code == 403

    # 3. Responder cannot perform admin-only operations (like adding a shelter)
    resp_client = app.test_client()
    resp_client.post("/api/auth/login", json={"email": "responder@test.com", "password": "Test@123"})
    assert resp_client.post("/api/shelters", json={"name": "S", "address": "A", "lat": 40.7, "lng": -74.0, "capacity": 10}).status_code == 403

    # 4. Admin can perform admin operations
    admin_client = app.test_client()
    admin_client.post("/api/auth/login", json={"email": "admin@test.com", "password": "Test@123"})
    assert admin_client.post("/api/shelters", json={"name": "Admin Shelter", "address": "1 Admin St", "lat": 40.7, "lng": -74.0, "capacity": 50}).status_code == 201


def test_capacity_aware_group_allocation_and_automatic_rerouting(admin_client, client):
    # Setup test shelters with known capacities
    admin_client.post("/api/shelters", json={"name": "Shelter Alpha", "address": "1 Alpha St", "lat": 40.71, "lng": -74.01, "capacity": 2})
    admin_client.post("/api/shelters", json={"name": "Shelter Beta", "address": "2 Beta St", "lat": 40.72, "lng": -74.02, "capacity": 10})

    shelters = admin_client.get("/api/shelters?active=0").get_json()["shelters"]
    alpha = next(s for s in shelters if s["name"] == "Shelter Alpha")

    register(client, "group_leader@example.com", "Group Leader")

    # 1. Test group allocation endpoint for 4 people when Shelter Alpha only has 2 vacancies
    alloc_res = client.post("/api/shelters/allocate", json={"lat": 40.71, "lng": -74.01, "headcount": 4})
    assert alloc_res.status_code == 200
    alloc_data = alloc_res.get_json()
    assert alloc_data["total_headcount"] == 4
    assert alloc_data["fully_allocated"] is True
    assert len(alloc_data["allocations"]) >= 2
    assert alloc_data["allocations"][0]["shelter"]["id"] == alpha["id"]
    assert alloc_data["allocations"][0]["allocated_count"] == 2

    # 2. Test automatic rerouting when requesting route for 4 people to Shelter Alpha (which only has 2 vacancies)
    route_res = client.get(f"/api/route?from_lat=40.71&from_lng=-74.01&shelter_id={alpha['id']}&headcount=4")
    assert route_res.status_code == 200
    r_data = route_res.get_json()
    assert r_data["rerouted"] is True
    assert r_data["original_shelter_id"] == alpha["id"]
    assert r_data["shelter"]["id"] != alpha["id"]



