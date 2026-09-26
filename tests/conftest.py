import os

import pytest

from backend.app import create_app
from backend.database.db import connect
from werkzeug.security import generate_password_hash


@pytest.fixture()
def app(tmp_path, monkeypatch):
    monkeypatch.setenv("PREFLOOD_DB", str(tmp_path / "test.db"))

    # Test-only demo accounts
    monkeypatch.setenv("PREFLOOD_ADMIN_EMAIL", "admin@test.com")
    monkeypatch.setenv("PREFLOOD_ADMIN_PASSWORD", "Test@123")

    monkeypatch.setenv("PREFLOOD_RESPONDER_EMAIL", "responder@test.com")
    monkeypatch.setenv("PREFLOOD_RESPONDER_PASSWORD", "Test@123")

    app = create_app({"TESTING": True, "SECRET_KEY": "test-secret"})
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


def register(client, email="person@example.com", name="Test Person"):
    return client.post("/api/auth/register", json={"name": name, "email": email, "password": "Password123"})


@pytest.fixture()
def admin_client(app):
    db = connect()
    db.execute(
        """INSERT INTO users (name, email, password_hash, role, language, accessibility_json, created_at)
        VALUES (?, ?, ?, 'admin', 'en', '[]', datetime('now'))""",
        ("Admin", "admin@example.com", generate_password_hash("AdminPassword123")),
    )
    db.commit()
    db.close()
    client = app.test_client()
    response = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "AdminPassword123"})
    assert response.status_code == 200
    return client
