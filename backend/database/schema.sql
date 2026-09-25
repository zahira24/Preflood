PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'responder', 'admin')),
    home_lat REAL,
    home_lng REAL,
    home_label TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    accessibility_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shelters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    occupancy INTEGER NOT NULL DEFAULT 0 CHECK (occupancy >= 0),
    active INTEGER NOT NULL DEFAULT 1,
    accessibility_json TEXT NOT NULL DEFAULT '[]',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    area TEXT NOT NULL DEFAULT 'Your registered area',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evacuations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'started',
    lat REAL,
    lng REAL,
    shelter_id INTEGER REFERENCES shelters(id),
    started_at TEXT NOT NULL,
    safe_deadline TEXT NOT NULL,
    safe_at TEXT,
    escalated_at TEXT
);

CREATE TABLE IF NOT EXISTS rescue_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    lat REAL,
    lng REAL,
    address TEXT NOT NULL DEFAULT '',
    people_count INTEGER NOT NULL CHECK (people_count > 0),
    emergency INTEGER NOT NULL DEFAULT 1,
    accessibility_json TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'open',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    responder_id INTEGER REFERENCES users(id),
    responder_name TEXT,
    responder_lat REAL,
    responder_lng REAL,
    responder_updated_at TEXT
);

CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    shelter_id INTEGER NOT NULL REFERENCES shelters(id),
    people_with_user INTEGER NOT NULL CHECK (people_with_user >= 0),
    total_people INTEGER NOT NULL CHECK (total_people > 0),
    approximate INTEGER NOT NULL DEFAULT 0,
    checked_in_at TEXT NOT NULL,
    undone_at TEXT
);
