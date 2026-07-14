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

from app.core.config import settings
from app.core.security import escape_like, sanitize_q
from app.db import get_db
from app.models import Brand, Category, Model, Part, Seller, ServiceCenter
from app.schemas import (
    BrandResponse,
    CategoryStat,
    CityStat,
    ModelResponse,
    PartCreate,
    PartFilter,
    PartResponse,
    PriceBucket,
    SellerResponse,
    ServiceCenterResponse,
    StatsSummary,
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
