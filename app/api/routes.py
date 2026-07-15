"""API routers for the marketplace."""
from __future__ import annotations

import random
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

import uuid

from app.core.auth import (
    create_access_token,
    get_current_active_user,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.core.config import settings
from app.core.security import escape_like, sanitize_q
from app.db import get_db
from app.models import (
    Brand,
    Category,
    Message,
    Model,
    Order,
    OrderItem,
    Part,
    Payment,
    Seller,
    ServiceCenter,
    User,
)
from app.payments.providers import get_payment_url
from app.schemas import (
    BrandResponse,
    CategoryStat,
    CityStat,
    MessageCreate,
    MessageResponse,
    ModelResponse,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    PartCreate,
    PartFilter,
    PartResponse,
    PaymentCreate,
    PaymentResponse,
    PriceBucket,
    SellerResponse,
    ServiceCenterResponse,
    StatsSummary,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    VinDecodeResponse,
)

api_router = APIRouter(prefix=settings.api_prefix)


@api_router.get("/health", include_in_schema=False)
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@api_router.get("/parts", response_model=List[PartResponse])
def list_parts(
    brand: Optional[str] = Query(None, max_length=100),
    model: Optional[str] = Query(None, max_length=100),
    category: Optional[str] = Query(None, max_length=100),
    condition: Optional[str] = Query(None, max_length=20),
    min_year: Optional[int] = Query(None, ge=1900, le=2100),
    max_year: Optional[int] = Query(None, ge=1900, le=2100),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    region: Optional[str] = Query(None, max_length=100),
    city: Optional[str] = Query(None, max_length=100),
    q: Optional[str] = Query(None, max_length=100),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Part).filter(Part.is_active == 1)
    if brand:
        query = query.filter(Part.brand.ilike(brand.strip()))
    if model:
        query = query.filter(Part.model.ilike(model.strip()))
    if category:
        query = query.filter(Part.category.ilike(category.strip()))
    if condition:
        query = query.filter(Part.condition == condition.strip())
    if min_year is not None:
        query = query.filter(Part.year >= min_year)
    if max_year is not None:
        query = query.filter(Part.year <= max_year)
    if min_price is not None:
        query = query.filter(Part.price_uzs >= min_price)
    if max_price is not None:
        query = query.filter(Part.price_uzs <= max_price)
    if region:
        query = query.filter(Part.region.ilike(region.strip()))
    if city:
        query = query.filter(Part.city.ilike(city.strip()))
    if q:
        raw = sanitize_q(q)
        if raw:
            pattern = f"%{escape_like(raw)}%"
            query = query.filter(
                (Part.title.ilike(pattern, escape="\\"))
                | (Part.description.ilike(pattern, escape="\\"))
                | (Part.brand.ilike(pattern, escape="\\"))
                | (Part.model.ilike(pattern, escape="\\"))
            )
    return query.order_by(Part.created_at.desc()).offset(skip).limit(limit).all()


@api_router.get("/parts/{part_id}", response_model=PartResponse)
def get_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part


@api_router.get("/vin/{vin}", response_model=VinDecodeResponse)
async def decode_vin(vin: str, db: Session = Depends(get_db)):
    vin = vin.strip().upper()
    if len(vin) != 17:
        raise HTTPException(status_code=400, detail="VIN 17 belgidan iborat bo'lishi kerak")
    # Basic sanitization
    if not re.fullmatch(r"[A-HJ-NPR-Z0-9]{17}", vin):
        raise HTTPException(status_code=400, detail="VIN noto'g'ri formatda")

    # Try NHTSA decode first
    brand = model = year = engine = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json"
            r = await client.get(url)
            if r.status_code == 200:
                data = r.json()
                results = data.get("Results", [])
                if results:
                    res = results[0]
                    brand = res.get("Make")
                    model = res.get("Model")
                    year_raw = res.get("ModelYear")
                    engine = res.get("EngineModel") or res.get("DisplacementL") or res.get("EngineConfiguration")
                    if year_raw:
                        try:
                            year = int(year_raw)
                        except ValueError:
                            year = None
    except Exception:
        pass

    # Fallback: try matching brand from our database by substring
    if not brand:
        all_brands = [b.name for b in db.query(Brand).all()]
        for b in all_brands:
            if b.upper() in vin:
                brand = b
                break

    return VinDecodeResponse(
        vin=vin,
        brand=brand,
        model=model,
        year=year,
        engine=engine,
        message="NHTSA dan olingan ma'lumot" if brand else "Mahalliy bazadan taxminiy brend",
    )


@api_router.post("/parts", response_model=PartResponse, status_code=201)
def create_part(part: PartCreate, db: Session = Depends(get_db)):
    data = part.model_dump()
    if not data.get("external_id"):
        data["external_id"] = f"part-{random.randint(1_000_000, 9_999_999)}"
    db_part = Part(**data)
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part


@api_router.get("/categories")
def categories(db: Session = Depends(get_db)):
    rows = (
        db.query(Part.category, func.count(Part.id))
        .filter(Part.is_active == 1)
        .group_by(Part.category)
        .all()
    )
    return [{"name": c, "count": n} for c, n in sorted(rows, key=lambda x: x[1], reverse=True)]


@api_router.get("/brands", response_model=List[BrandResponse])
def brands(db: Session = Depends(get_db)):
    return db.query(Brand).order_by(Brand.popular.desc(), Brand.name).all()


@api_router.get("/brands/{brand_id}/models", response_model=List[ModelResponse])
def brand_models(brand_id: int, db: Session = Depends(get_db)):
    return db.query(Model).filter(Model.brand_id == brand_id).order_by(Model.name).all()


@api_router.get("/models", response_model=List[ModelResponse])
def models(brand: Optional[str] = Query(None, max_length=100), db: Session = Depends(get_db)):
    query = db.query(Model)
    if brand:
        brand_obj = db.query(Brand).filter(Brand.name.ilike(brand.strip())).first()
        if brand_obj:
            query = query.filter(Model.brand_id == brand_obj.id)
        else:
            return []
    return query.order_by(Model.name).all()


@api_router.get("/regions")
def regions(db: Session = Depends(get_db)):
    rows = (
        db.query(Part.region, func.count(Part.id))
        .filter(Part.is_active == 1, Part.region.isnot(None))
        .group_by(Part.region)
        .all()
    )
    return [{"name": r, "count": n} for r, n in sorted(rows, key=lambda x: x[1], reverse=True)]


@api_router.get("/cities")
def cities(db: Session = Depends(get_db)):
    rows = (
        db.query(Part.city, Part.region, func.count(Part.id))
        .filter(Part.is_active == 1, Part.city.isnot(None))
        .group_by(Part.city, Part.region)
        .all()
    )
    return [{"city": c, "region": r, "count": n} for c, r, n in sorted(rows, key=lambda x: x[2], reverse=True)]


@api_router.get("/sellers", response_model=List[SellerResponse])
def sellers(
    city: Optional[str] = Query(None, max_length=100),
    verified: Optional[int] = Query(None, ge=0, le=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Seller)
    if city:
        query = query.filter(Seller.city.ilike(city.strip()))
    if verified is not None:
        query = query.filter(Seller.verified == verified)
    return query.order_by(Seller.rating.desc()).limit(limit).all()


@api_router.get("/service-centers", response_model=List[ServiceCenterResponse])
def service_centers(
    city: Optional[str] = Query(None, max_length=100),
    service: Optional[str] = Query(None, max_length=100),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(ServiceCenter)
    if city:
        query = query.filter(ServiceCenter.city.ilike(city.strip()))
    if service:
        query = query.filter(ServiceCenter.services.ilike(f"%{escape_like(service)}%", escape="\\"))
    return query.order_by(ServiceCenter.rating.desc()).limit(limit).all()


@api_router.get("/stats/summary", response_model=StatsSummary)
def stats_summary(db: Session = Depends(get_db)):
    base = db.query(Part).filter(Part.is_active == 1)
    total = base.count()
    avg_price = base.with_entities(func.avg(Part.price_uzs)).scalar()
    categories = db.query(Part.category).filter(Part.is_active == 1).distinct().count()
    brands = db.query(Part.brand).filter(Part.is_active == 1).distinct().count()
    cities = db.query(Part.city).filter(Part.is_active == 1, Part.city.isnot(None)).distinct().count()
    return StatsSummary(
        total=total,
        avg_price_uzs=round(float(avg_price), 2) if avg_price else None,
        categories=categories,
        brands=brands,
        cities=cities,
    )


@api_router.get("/stats/by-category", response_model=List[CategoryStat])
def stats_by_category(db: Session = Depends(get_db)):
    rows = (
        db.query(Part.category, func.count(Part.id), func.avg(Part.price_uzs))
        .filter(Part.is_active == 1)
        .group_by(Part.category)
        .all()
    )
    out = []
    for category, count, avg_price in rows:
        out.append(
            CategoryStat(
                category=category,
                count=count,
                avg_price_uzs=round(float(avg_price), 2) if avg_price else None,
            )
        )
    return sorted(out, key=lambda x: x.count, reverse=True)


@api_router.get("/stats/by-city", response_model=List[CityStat])
def stats_by_city(db: Session = Depends(get_db)):
    rows = (
        db.query(Part.city, Part.region, func.count(Part.id), func.avg(Part.price_uzs))
        .filter(Part.is_active == 1, Part.city.isnot(None))
        .group_by(Part.city, Part.region)
        .all()
    )
    out = []
    for city, region, count, avg_price in rows:
        out.append(
            CityStat(
                city=city or "Noma'lum",
                region=region,
                count=count,
                avg_price_uzs=round(float(avg_price), 2) if avg_price else None,
            )
        )
    return sorted(out, key=lambda x: x.count, reverse=True)[:20]


@api_router.get("/stats/price-distribution", response_model=List[PriceBucket])
def price_distribution(db: Session = Depends(get_db)):
    buckets = [
        (0, 300_000),
        (300_000, 800_000),
        (800_000, 1_500_000),
        (1_500_000, 3_000_000),
        (3_000_000, 6_000_000),
        (6_000_000, 100_000_000),
    ]
    result = []
    for low, high in buckets:
        count = (
            db.query(Part)
            .filter(Part.is_active == 1, Part.price_uzs >= low, Part.price_uzs < high)
            .count()
        )
        result.append(PriceBucket(min=low, max=high, count=count))
    return result


# Static-ish routes used by the root app

def robots_content() -> str:
    return (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        f"Sitemap: {settings.site_url}/sitemap.xml\n"
    )


def sitemap_content(db: Session) -> str:
    root = ET.Element("urlset", {"xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"})

    def add(loc: str, priority: str, changefreq: str = "daily"):
        url = ET.SubElement(root, "url")
        ET.SubElement(url, "loc").text = loc
        ET.SubElement(url, "priority").text = priority
        ET.SubElement(url, "changefreq").text = changefreq

    add(settings.site_url, "1.0")
    add(f"{settings.site_url}/#categories", "0.8")
    add(f"{settings.site_url}/#listings", "0.9")
    add(f"{settings.site_url}/#stats", "0.7")
    add(f"{settings.site_url}/#map", "0.6")

    parts = db.query(Part).filter(Part.is_active == 1).order_by(Part.id.desc()).limit(100).all()
    for part in parts:
        add(f"{settings.site_url}/#listings?part={part.id}", "0.6", "weekly")

    categories = {c.category for c in db.query(Part.category).filter(Part.is_active == 1).distinct().all()}
    for cat in categories:
        add(f"{settings.site_url}/#listings?category={cat}", "0.7", "weekly")

    return ET.tostring(root, encoding="unicode")


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


@api_router.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")
    if data.phone:
        existing_phone = db.query(User).filter(User.phone == data.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Bu telefon raqam allaqachon ishlatilgan")
    user = User(
        email=data.email,
        phone=data.phone,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
        role=data.role,
        city=data.city,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@api_router.post("/auth/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@api_router.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------


_ORDER_TRANSITIONS = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"shipped", "cancelled"},
    "shipped": {"delivered", "cancelled"},
    "delivered": set(),
    "cancelled": set(),
}


@api_router.post("/orders", response_model=OrderResponse, status_code=201)
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Buyurtma kamida bitta mahsulotni o'z ichiga olishi kerak")

    order = Order(
        buyer_id=current_user.id,
        seller_id=data.seller_id,
        status="pending",
        total_uzs=0.0,
        delivery_address=data.delivery_address,
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    total = 0.0
    for item in data.items:
        part = db.query(Part).filter(Part.id == item.part_id, Part.is_active == 1).first()
        if not part:
            raise HTTPException(status_code=400, detail=f"Qismlar topilmadi: ID {item.part_id}")
        line_total = part.price_uzs * item.quantity
        total += line_total
        db.add(
            OrderItem(
                order_id=order.id,
                part_id=part.id,
                quantity=item.quantity,
                unit_price_uzs=part.price_uzs,
                status="pending",
            )
        )

    order.total_uzs = total
    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order)


@api_router.get("/orders", response_model=List[OrderResponse])
def list_orders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if current_user.role != "admin":
        query = query.filter(Order.buyer_id == current_user.id)
    return query.order_by(Order.created_at.desc()).all()


@api_router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).get(order_id)
    if not order or (order.buyer_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    return OrderResponse.model_validate(order)


@api_router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).get(order_id)
    if not order or (order.buyer_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")

    allowed = _ORDER_TRANSITIONS.get(order.status, set())
    if payload.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"'{order.status}' holatidan '{payload.status}' holatiga o'tish mumkin emas",
        )

    # Buyers can only cancel their own orders unless they are admins.
    if current_user.role != "admin" and payload.status != "cancelled":
        raise HTTPException(status_code=403, detail="Faqat admin buyurtma holatini o'zgartirishi mumkin")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order)


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------


def _message_response(msg: Message) -> MessageResponse:
    return MessageResponse(
        id=msg.id,
        order_id=msg.order_id,
        sender_id=msg.sender_id,
        sender_name=msg.sender.full_name if msg.sender else "Noma'lum",
        body=msg.body,
        is_read=msg.is_read,
        created_at=msg.created_at,
    )


@api_router.post("/messages", response_model=MessageResponse, status_code=201)
def create_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).get(data.order_id)
    if not order or (order.buyer_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    msg = Message(order_id=order.id, sender_id=current_user.id, body=data.body)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _message_response(msg)


@api_router.get("/messages/{order_id}", response_model=List[MessageResponse])
def list_messages(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).get(order_id)
    if not order or (order.buyer_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    messages = db.query(Message).filter(Message.order_id == order_id).order_by(Message.created_at).all()
    return [_message_response(m) for m in messages]


# ---------------------------------------------------------------------------
# Payments
# ---------------------------------------------------------------------------


@api_router.post("/payments", response_model=PaymentResponse, status_code=201)
def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).get(data.order_id)
    if not order or (order.buyer_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    if data.provider not in {"payme", "click", "uzum", "cash_on_delivery"}:
        raise HTTPException(status_code=400, detail="Noto'g'ri to'lov turi")

    existing = (
        db.query(Payment)
        .filter(Payment.order_id == order.id, Payment.provider == data.provider, Payment.status == "pending")
        .first()
    )
    if existing:
        return PaymentResponse.model_validate(existing)

    payment_url = get_payment_url(data.provider, order.id, order.total_uzs) if data.provider != "cash_on_delivery" else ""
    transaction_id = f"{data.provider}-{uuid.uuid4().hex[:12]}"
    payment = Payment(
        order_id=order.id,
        user_id=current_user.id,
        provider=data.provider,
        amount_uzs=order.total_uzs,
        status="pending",
        provider_transaction_id=transaction_id,
        payment_url=payment_url,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return PaymentResponse.model_validate(payment)


@api_router.get("/payments/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).get(payment_id)
    if not payment or (payment.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="To'lov topilmadi")
    return PaymentResponse.model_validate(payment)


@api_router.post("/payments/{payment_id}/confirm", response_model=PaymentResponse)
def confirm_payment(
    payment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).get(payment_id)
    if not payment or (payment.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="To'lov topilmadi")
    if payment.status != "pending":
        raise HTTPException(status_code=400, detail="To'lov allaqachon yakunlangan")

    payment.status = "paid"
    if payment.order and payment.order.status == "pending":
        payment.order.status = "confirmed"
    db.commit()
    db.refresh(payment)
    return PaymentResponse.model_validate(payment)
