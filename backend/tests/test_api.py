import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from app.models import User
from app.security import AuthService


# Create a TestClient instance for testing FastAPI app
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    """
    Setup the database tables before each test.
    For demo tests, use the same DB and ensure tables exist.
    """
    Base.metadata.create_all(bind=engine)
    yield
    # Optionally, clean up after tests here if needed


def register_and_login(email="test@example.com", password="P@ssword123"):
    """
    Helper function to register a new user and login,
    returning the access token for authenticated requests.
    """
    client.post("/auth/register", json={
        "first_name": "Test", "last_name": "User", "email": email, "password": password
    })
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]


def test_invalid_servings():
    """
    Test that sending servings = 0 returns validation error (422).
    """
    token = register_and_login()
    res = client.post(
        "/get-calories",
        json={"dish_name": "pizza", "servings": 0},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 422


def test_nonexistent_dish(monkeypatch):
    """
    Test that requesting calories for a non-existent dish returns 404.
    """
    token = register_and_login("nofood@example.com")

    # Patch the fooddata_service.search_food to simulate no results found
    from app.services.fooddata import fooddata_service

    def fake_search(_):
        return {"foods": []}

    monkeypatch.setattr(fooddata_service, "search_food", fake_search)

    res = client.post(
        "/get-calories",
        json={"dish_name": "xyzabc", "servings": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_calories"] == 0


# Note: The following test hits the real USDA API if API key is set.
# Marked as "integration" so it can be skipped in CI if no API key present.
@pytest.mark.integration
@pytest.mark.skipif(not os.getenv("USDA_API_KEY"), reason="No USDA_API_KEY set")
def test_known_dish_live_api():
    """
    Integration test that calls the live USDA API for a known dish.
    """
    token = register_and_login("live@example.com")
    res = client.post(
        "/get-calories",
        json={"dish_name": "macaroni and cheese", "servings": 2},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_calories"] > 0
