"""API smoke tests."""
from __future__ import annotations

import re


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_security_headers(client):
    r = client.get("/health")
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["x-frame-options"] == "DENY"


def test_robots_txt(client):
    r = client.get("/robots.txt")
    assert r.status_code == 200
    assert "Sitemap" in r.text


def test_sitemap_xml(client):
    r = client.get("/sitemap.xml")
    assert r.status_code == 200
    assert "<urlset" in r.text


def test_stats_summary(client):
    r = client.get("/api/stats/summary")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] > 0
    assert data["categories"] > 0
    assert data["brands"] > 0
    assert data["cities"] > 0


def test_parts_list(client):
    r = client.get("/api/parts")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "title" in data[0]
    assert "price_uzs" in data[0]


def test_parts_filter_by_brand(client):
    r = client.get("/api/parts", params={"brand": "Chevrolet"})
    assert r.status_code == 200
    for item in r.json():
        assert item["brand"].lower() == "chevrolet"


def test_parts_filter_by_category(client):
    r = client.get("/api/parts", params={"category": "Akumulyator"})
    assert r.status_code == 200
    for item in r.json():
        assert item["category"].lower() == "akumulyator"


def test_brands_endpoint(client):
    r = client.get("/api/brands")
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert "name" in data[0]
    assert "slug" in data[0]


def test_models_by_brand(client):
    r = client.get("/api/models", params={"brand": "Chevrolet"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert "name" in data[0]


def test_vin_decode(client):
    r = client.get("/api/vin/1G1BL52P7TR115520")
    assert r.status_code == 200
    data = r.json()
    assert data["vin"] == "1G1BL52P7TR115520"
    assert data["brand"] is not None


def test_vin_validation(client):
    r = client.get("/api/vin/INVALID")
    assert r.status_code == 400


def test_sellers_endpoint(client):
    r = client.get("/api/sellers", params={"limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert "name" in data[0]


def test_service_centers_endpoint(client):
    r = client.get("/api/service-centers", params={"limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert "services" in data[0]


def test_rate_limit(client):
    # The rate limit is 120 per minute; a few sequential requests should pass.
    for _ in range(5):
        r = client.get("/health")
        assert r.status_code == 200


def test_invalid_part_id(client):
    r = client.get("/api/parts/9999999")
    assert r.status_code == 404


def test_create_part_validation(client):
    r = client.post("/api/parts", json={"title": "ab", "brand": "X", "model": "Y", "category": "Z", "condition": "new", "price_uzs": -100})
    assert r.status_code == 422
