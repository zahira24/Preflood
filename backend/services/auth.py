import re
from functools import wraps

from flask import g, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash

from backend.database.db import utc_now


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validate_registration(payload):
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    if len(name) < 2 or len(name) > 80:
        return "Name must be 2-80 characters"
    if not EMAIL_RE.match(email) or len(email) > 160:
        return "Enter a valid email address"
    if len(password) < 8 or len(password) > 128:
        return "Password must be 8-128 characters"
    return None


def create_user(db, payload):
    error = validate_registration(payload)
    if error:
        raise ValueError(error)
    accessibility = payload.get("accessibility", [])
    if not isinstance(accessibility, list) or len(accessibility) > 20:
        raise ValueError("Accessibility preferences must be a list")
    db.execute(
        """INSERT INTO users
        (name, email, password_hash, home_lat, home_lng, home_label, language, accessibility_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            str(payload["name"]).strip(), str(payload["email"]).strip().lower(),
            generate_password_hash(payload["password"]),
            payload.get("home_lat"), payload.get("home_lng"), str(payload.get("home_label", "")).strip(),
            str(payload.get("language", "en"))[:10], __import__("json").dumps(accessibility), utc_now(),
        ),
    )
    return db.execute("SELECT * FROM users WHERE id = last_insert_rowid()").fetchone()


def login_user(db, email, password):
    user = db.execute("SELECT * FROM users WHERE email = ?", (str(email).strip().lower(),)).fetchone()
    if not user or not check_password_hash(user["password_hash"], str(password)):
        return None
    session.clear()
    session["user_id"] = user["id"]
    return user


def load_user(db):
    user_id = session.get("user_id")
    if not user_id:
        return None
    return db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def require_auth(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if g.user is None:
            return jsonify(error="Authentication required"), 401
        return fn(*args, **kwargs)
    return wrapped


def require_role(*roles):
    def decorator(fn):
        @wraps(fn)
        @require_auth
        def wrapped(*args, **kwargs):
            if g.user["role"] not in roles:
                return jsonify(error="Responder or admin access required"), 403
            return fn(*args, **kwargs)
        return wrapped
    return decorator
