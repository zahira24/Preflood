import os

import pytest

from backend.app import create_app


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
    return client.post(
        "/api/auth/register",
        json={
            "name": name,
            "email": email,
            "password": "Password123",
        },
    )


@pytest.fixture()
def admin_client(app):
    client = app.test_client()

    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@test.com",
            "password": "Test@123",
        },
    )

    assert response.status_code == 200

    return client