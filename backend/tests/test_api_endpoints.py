import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db
from app.seed import seed_database


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_db()
    seed_database(force=True)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["persona"] == "Arjun"
    assert data["total_events"] > 0


def test_events_endpoint(client):
    res = client.get("/api/events")
    assert res.status_code == 200
    events = res.json()
    assert len(events) > 0
    assert any(e["event_type"] == "expense" for e in events)


def test_insights_endpoint(client):
    res = client.get("/api/insights")
    assert res.status_code == 200
    insights = res.json()
    assert len(insights) >= 3
    keys = [ins["detector_key"] for ins in insights]
    assert "late_night_spend_chain" in keys
    assert "budget_burn_early" in keys
    assert "sleep_study_deficit" in keys


def test_budget_endpoint(client):
    res = client.get("/api/insights/budget")
    assert res.status_code == 200
    data = res.json()
    assert data["monthly_budget"] == 6000.0
    assert data["total_spent"] > 0
    assert "depletion" in data["status"] or "warning" in data["status"] or "critical" in data["status"]


def test_briefing_endpoint(client):
    res = client.get("/api/briefing")
    assert res.status_code == 200
    data = res.json()
    assert "Arjun" in data["script"]
    assert len(data["highlights"]) >= 3
    assert data["word_count"] > 50


def test_whatif_endpoint(client):
    payload = {"question": "What if I order Zomato tonight?"}
    res = client.post("/api/whatif", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["risk_score"] > 50
    assert len(data["predicted_consequences"]) >= 2
    assert len(data["spoken_answer"]) > 20


def test_ingest_text_endpoint(client):
    payload = {"text": "Spent 120 on snacks after late lab"}
    res = client.post("/api/ingest/text", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["parsed_events"]) == 1
    ev = data["parsed_events"][0]
    assert ev["amount"] == 120.0
    assert ev["category"] == "food"


def test_ingest_file_endpoint(client):
    file_content = b"Mock UPI transaction screenshot content"
    res = client.post(
        "/api/ingest/file",
        files={"file": ("upi_payment_screenshot.png", file_content, "image/png")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["parsed_events"]) > 0


def test_privacy_wipe_and_seed(client):
    # 1. Wipe
    res = client.delete("/api/privacy/wipe")
    assert res.status_code == 200
    assert res.json()["status"] == "success"

    # Events should be 0
    res_events = client.get("/api/events")
    assert len(res_events.json()) == 0

    # 2. Reseed
    res_seed = client.post("/api/privacy/seed")
    assert res_seed.status_code == 200
    assert res_seed.json()["deleted_events_count"] > 0

    # Events restored
    res_restored = client.get("/api/events")
    assert len(res_restored.json()) > 0
