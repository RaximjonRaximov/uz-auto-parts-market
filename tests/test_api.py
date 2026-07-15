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


def test_auth_register_login_and_me(client):
    r = client.post(
        "/api/auth/register",
        json={
            "email": "pytest@example.com",
            "password": "pytpass123",
            "full_name": "Pytest User",
            "phone": "+998901234599",
            "city": "Toshkent",
            "role": "buyer",
        },
    )
    assert r.status_code == 201
    token = r.json()["access_token"]

    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "pytest@example.com"

    r = client.post("/api/auth/login", json={"email": "pytest@example.com", "password": "pytpass123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_order_and_payment_flow(client):
    # register
    r = client.post(
        "/api/auth/register",
        json={
            "email": "order@example.com",
            "password": "orderpass123",
            "full_name": "Order User",
            "role": "buyer",
        },
    )
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # fetch first part
    part = client.get("/api/parts", params={"limit": 1}).json()[0]

    # create order
    r = client.post(
        "/api/orders",
        json={"items": [{"part_id": part["id"], "quantity": 2}], "delivery_address": "Test"},
        headers=headers,
    )
    assert r.status_code == 201
    order = r.json()
    assert order["total_uzs"] == part["price_uzs"] * 2
    order_id = order["id"]

    # list orders
    r = client.get("/api/orders", headers=headers)
    assert r.status_code == 200
    assert any(o["id"] == order_id for o in r.json())

    # message
    r = client.post("/api/messages", json={"order_id": order_id, "body": "Salom"}, headers=headers)
    assert r.status_code == 201
    r = client.get(f"/api/messages/{order_id}", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) == 1

    # payment
    r = client.post("/api/payments", json={"order_id": order_id, "provider": "payme"}, headers=headers)
    assert r.status_code == 201
    payment = r.json()
    assert payment["provider"] == "payme"
    assert "payment_url" in payment
    assert payment["status"] == "pending"

    # confirm payment
    r = client.post(f"/api/payments/{payment['id']}/confirm", headers=headers)
    assert r.status_code == 200
    assert r.json()["status"] == "paid"


def test_order_status_transition(client):
    r = client.post(
        "/api/auth/register",
        json={
            "email": "status@example.com",
            "password": "statuspass123",
            "full_name": "Status User",
            "role": "buyer",
        },
    )
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    part = client.get("/api/parts", params={"limit": 1}).json()[0]
    order = client.post(
        "/api/orders",
        json={"items": [{"part_id": part["id"], "quantity": 1}]},
        headers=headers,
    ).json()

    r = client.patch(f"/api/orders/{order['id']}/status", json={"status": "confirmed"}, headers=headers)
    assert r.status_code == 403  # buyer cannot confirm, only cancel pending

    r = client.patch(f"/api/orders/{order['id']}/status", json={"status": "cancelled"}, headers=headers)
    assert r.status_code == 200
    assert r.json()["status"] == "cancelled"
