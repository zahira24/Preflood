import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from werkzeug.security import generate_password_hash


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / "database" / "preflood.db"
SCHEMA = Path(__file__).with_name("schema.sql")


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def get_db_path():
    return Path(os.getenv("PREFLOOD_DB", str(DEFAULT_DB)))


def connect():
    path = get_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def init_db():
    db = connect()
    db.executescript(SCHEMA.read_text())
    
    # Auto-migrate existing SQLite tables if missing responder columns
    cols = [r["name"] for r in db.execute("PRAGMA table_info(rescue_requests)").fetchall()]
    for col_name, col_def in [
        ("responder_id", "INTEGER REFERENCES users(id)"),
        ("responder_name", "TEXT"),
        ("responder_lat", "REAL"),
        ("responder_lng", "REAL"),
        ("responder_updated_at", "TEXT"),
    ]:
        if col_name not in cols:
            db.execute(f"ALTER TABLE rescue_requests ADD COLUMN {col_name} {col_def}")

    if db.execute("SELECT COUNT(*) AS count FROM shelters").fetchone()["count"] == 0:
        now = utc_now()
        db.executemany(
            """INSERT INTO shelters
            (name, address, lat, lng, capacity, accessibility_json, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            [
                ("Riverside Community Hall", "18 River Road", 40.713, -74.006, 120,
                 json.dumps(["wheelchair", "elderly", "visual"]), "Ground-floor, backup generator", now),
                ("Northside School Gym", "204 North Avenue", 40.729, -73.991, 80,
                 json.dumps(["wheelchair", "child", "hearing"]), "Cots and family room", now),
                ("Civic Center", "1 Central Plaza", 40.705, -74.015, 200,
                 json.dumps(["wheelchair", "visual", "elderly", "hearing"]), "Accessible washrooms", now),
            ],
        )
    admin_password = os.getenv("PREFLOOD_ADMIN_PASSWORD")
    if admin_password and not db.execute("SELECT 1 FROM users WHERE role = 'admin'").fetchone():
        db.execute(
            """INSERT INTO users (name, email, password_hash, role, language, accessibility_json, created_at)
            VALUES (?, ?, ?, 'admin', 'en', '[]', ?)""",
            ("PreFlood Administrator", os.getenv("PREFLOOD_ADMIN_EMAIL", "admin@preflood.local"),
             generate_password_hash(admin_password), utc_now()),
        )


    db.commit()
    db.close()
