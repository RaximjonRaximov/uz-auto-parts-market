"""Uzbekistan Auto Parts Marketplace — FastAPI backend."""
from __future__ import annotations

import json
import os
import random
from datetime import datetime
from pathlib import Path
from typing import Any, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine, Column, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Session, declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    database_url: str = "sqlite:///./autoparts.db"
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:5173,http://localhost:8000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()

connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    brand = Column(String, index=True, nullable=False)
    model = Column(String, index=True, nullable=False)
    year = Column(Integer, index=True, nullable=True)
    category = Column(String, index=True, nullable=False)
    condition = Column(String, index=True, nullable=False)  # new / used / remanufactured
    price_uzs = Column(Float, nullable=False)
    price_usd = Column(Float, nullable=True)
    currency = Column(String, default="UZS")
    region = Column(String, index=True, nullable=True)
    city = Column(String, index=True, nullable=True)
    seller_name = Column(String, nullable=True)
    seller_phone = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# --- Pydantic schemas ---

class PartBase(BaseModel):
    title: str
    description: Optional[str] = None
    brand: str
    model: str
    year: Optional[int] = None
    category: str
    condition: str = "used"
    price_uzs: float
    price_usd: Optional[float] = None
    currency: str = "UZS"
    region: Optional[str] = None
    city: Optional[str] = None
    seller_name: Optional[str] = None
    seller_phone: Optional[str] = None
    image_url: Optional[str] = None


class PartCreate(PartBase):
    external_id: Optional[str] = None


class PartResponse(PartBase):
    id: int
    external_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PartFilter(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    region: Optional[str] = None
    city: Optional[str] = None
    q: Optional[str] = None
    skip: int = 0
    limit: int = 50


class StatsSummary(BaseModel):
    total: int
    avg_price_uzs: Optional[float] = None
    categories: int
    brands: int
    cities: int


class CategoryStat(BaseModel):
    category: str
    count: int
    avg_price_uzs: Optional[float] = None


class CityStat(BaseModel):
    city: str
    region: Optional[str] = None
    count: int
    avg_price_uzs: Optional[float] = None


class PriceBucket(BaseModel):
    min: float
    max: float
    count: int


# --- DB helpers ---

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Sample data ---

_BRANDS = {
    "Chevrolet": ["Nexia", "Cobalt", "Spark", "Lacetti", "Damas", "Malibu", "Captiva", "Tracker"],
    "Kia": ["Rio", "K5", "Sportage", "Sorento", "Cerato", "Optima"],
    "Hyundai": ["Accent", "Elantra", "Sonata", "Tucson", "Santa Fe", "Creta"],
    "Toyota": ["Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux", "Prado"],
    "Daewoo": ["Matiz", "Nexia", "Gentra", "Damaz"],
    "BYD": ["Song", "Chazor", "E2", "E3"],
    "Haval": ["H6", "Jolion", "Dargo"],
    "Lada": ["Vesta", "Granta", "Niva", "XRay"],
    "BMW": ["E39", "E46", "F10", "X5", "X3"],
    "Mercedes-Benz": ["W124", "W210", "W211", "Sprinter", "G-Class"],
    "Audi": ["A4", "A6", "Q5", "Q7"],
    "Volkswagen": ["Polo", "Jetta", "Tiguan", "Passat"],
}

_CATEGORIES = [
    "Dvigatel", "Transmissiya", "Xodovoy", "Kuzov", "Elektrika",
    "Salon", "Detali dvigatelya", "Tormoz tizimi", "Radiator va salnik",
    "Shinalar va disklar", "Akumulyator", "Zapchasti",
]

_CONDITIONS = ["new", "used", "remanufactured"]

_REGIONS = {
    "Toshkent": ["Yunusobod", "Shayxontohur", "Mirabad", "Yashnobod", "Chilonzor", "Bektemir", "Sergeli", "Yakkasaroy"],
    "Toshkent viloyati": ["Chirchiq", "Yangiyo‘l", "Angren", "Bekobod", "Olmaliq"],
    "Samarqand": ["Samarqand shahri", "Urgut", "Jomboy", "Kattaqo‘rg‘on"],
    "Buxoro": ["Buxoro shahri", "G‘ijduvon", "Kogon", "Qorako‘l"],
    "Andijon": ["Andijon shahri", "Asaka", "Shahrixon", "Marhamat"],
    "Farg‘ona": ["Farg‘ona shahri", "Qo‘qon", "Marg‘ilon", "Rishton"],
    "Namangan": ["Namangan shahri", "Chortoq", "Pop", "Uychi"],
    "Xorazm": ["Urganch", "Xiva", "Gurlan", "Shovot"],
    "Qashqadaryo": ["Qarshi", "Shahrisabz", "Kitob", "Koson"],
    "Surxondaryo": ["Termiz", "Denov", "Sherobod", "Sariosiyo"],
    "Navoiy": ["Navoiy shahri", "Zarafshon", "Uchquduq", "Konimex"],
    "Jizzax": ["Jizzax shahri", "Arnasoy", "Forish", "Zomin"],
    "Sirdaryo": ["Guliston", "Sirdaryo", "Oqoltin", "Xovos"],
    "Qoraqalpog‘iston": ["Nukus", "Xo‘jayli", "To‘rtko‘l", "Qong‘irot"],
}

_PART_TITLES = {
    "Dvigatel": ["Dvigatel", "Dvigatel blok", "Porshen", "Kolenval", "Golovka bloki", "Yag silindrlar"],
    "Transmissiya": ["KPP", "Avtomat karobka", "Sceplenie", "Kardan", "Reduktor"],
    "Xodovoy": ["Amortizator", "Prujina", "Rychag", "Stupitsa", "Sharovaya opora"],
    "Kuzov": ["Bamper", "Krilo", "Kaput", "Dver", "Fara", "Zadniy fonar"],
    "Elektrika": ["Generator", "Starter", "Fara bloor", "Provodka", "Datchik"],
    "Salon": ["Sideniya", "Rul", "Panel priborov", "Kovrik", "Obivka"],
    "Detali dvigatelya": ["Raspredval", "Maslyaniy nasos", "Vodanoy nasos", "Remen GRM", "Termostat"],
    "Tormoz tizimi": ["Tormoz disk", "Kolodki", "Tormoz silindr", "ABS datchik"],
    "Radiator va salnik": ["Radiator", "Salnik", "Patrubok", "Ventilyator"],
    "Shinalar va disklar": ["Shina", "Disk", "Kolpachok", "Zimniy shina"],
    "Akumulyator": ["Akumulyator 60Ah", "Akumulyator 75Ah", "Akumulyator 90Ah"],
    "Zapchasti": ["Filtr", "Remkomplekt", "Podshipnik", "Svecha", "Rezinlar"],
}

_UZS_TO_USD = 12_500.0


def _phone() -> str:
    prefixes = ["90", "91", "93", "94", "95", "97", "98", "99", "88", "33"]
    return f"+998 {random.choice(prefixes)} {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}"


def _generate_parts(count: int = 200) -> list[dict[str, Any]]:
    random.seed(42)
    parts: list[dict[str, Any]] = []
    for i in range(1, count + 1):
        brand = random.choice(list(_BRANDS.keys()))
        model = random.choice(_BRANDS[brand])
        year = random.randint(2000, 2024)
        category = random.choice(_CATEGORIES)
        condition = random.choice(_CONDITIONS)
        region = random.choice(list(_REGIONS.keys()))
        city = random.choice(_REGIONS[region])

        base_price = random.randint(80_000, 8_000_000)
        if condition == "new":
            base_price = int(base_price * 1.35)
        elif condition == "remanufactured":
            base_price = int(base_price * 0.75)
        if region == "Toshkent":
            base_price = int(base_price * 1.1)
        base_price = round(base_price / 1_000) * 1_000

        title_choices = _PART_TITLES.get(category, ["Zapchast"])
        title = f"{random.choice(title_choices)} {brand} {model} {year}"
        if condition == "new":
            title = "Yangi " + title.lower()
        elif condition == "remanufactured":
            title = "Tiklangan " + title.lower()

        description = (
            f"{title}. {condition} holatda. "
            f"{brand} {model} {year} uchun mos. "
            f"Sotuvchi: {random.choice(['Avto zapchast', 'Usta', 'Shaxsiy', 'Magazin'])}."
        )

        image_url = f"https://placehold.co/640x480/e2e8f0/1e293b?text={i}"

        parts.append({
            "external_id": f"part-{i:04d}",
            "title": title.capitalize(),
            "description": description,
            "brand": brand,
            "model": model,
            "year": year,
            "category": category,
            "condition": condition,
            "price_uzs": base_price,
            "price_usd": round(base_price / _UZS_TO_USD, 2),
            "currency": "UZS",
            "region": region,
            "city": city,
            "seller_name": f"Sotuvchi {i}",
            "seller_phone": _phone(),
            "image_url": image_url,
            "is_active": 1,
        })
    return parts


def seed_sample_data() -> None:
    db = SessionLocal()
    try:
        if db.query(Part).first() is not None:
            return
        for item in _generate_parts(200):
            db.add(Part(**item))
        db.commit()
    finally:
        db.close()


# --- FastAPI app ---

Base.metadata.create_all(bind=engine)
seed_sample_data()

app = FastAPI(
    title="Uzbekistan Auto Parts Marketplace",
    version="0.1.0",
    description="Modern auto spare parts marketplace for Uzbekistan",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(f"{settings.api_prefix}/parts", response_model=List[PartResponse])
def list_parts(
    brand: Optional[str] = None,
    model: Optional[str] = None,
    category: Optional[str] = None,
    condition: Optional[str] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    region: Optional[str] = None,
    city: Optional[str] = None,
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Part).filter(Part.is_active == 1)
    if brand:
        query = query.filter(Part.brand.ilike(brand))
    if model:
        query = query.filter(Part.model.ilike(model))
    if category:
        query = query.filter(Part.category.ilike(category))
    if condition:
        query = query.filter(Part.condition == condition)
    if min_year is not None:
        query = query.filter(Part.year >= min_year)
    if max_year is not None:
        query = query.filter(Part.year <= max_year)
    if min_price is not None:
        query = query.filter(Part.price_uzs >= min_price)
    if max_price is not None:
        query = query.filter(Part.price_uzs <= max_price)
    if region:
        query = query.filter(Part.region.ilike(region))
    if city:
        query = query.filter(Part.city.ilike(city))
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            (Part.title.ilike(pattern))
            | (Part.description.ilike(pattern))
            | (Part.brand.ilike(pattern))
            | (Part.model.ilike(pattern))
        )
    return query.order_by(Part.created_at.desc()).offset(skip).limit(limit).all()


@app.get(f"{settings.api_prefix}/parts/{{part_id}}", response_model=PartResponse)
def get_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part


@app.post(f"{settings.api_prefix}/parts", response_model=PartResponse, status_code=201)
def create_part(part: PartCreate, db: Session = Depends(get_db)):
    external_id = part.external_id or f"part-{random.randint(1_000_000, 9_999_999)}"
    db_part = Part(**part.model_dump(), external_id=external_id)
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part


@app.get(f"{settings.api_prefix}/categories")
def categories(db: Session = Depends(get_db)):
    rows = db.query(Part.category, func.count(Part.id)).filter(Part.is_active == 1).group_by(Part.category).all()
    return [{"name": c, "count": n} for c, n in sorted(rows, key=lambda x: x[1], reverse=True)]


@app.get(f"{settings.api_prefix}/brands")
def brands(db: Session = Depends(get_db)):
    rows = db.query(Part.brand, func.count(Part.id)).filter(Part.is_active == 1).group_by(Part.brand).all()
    return [{"name": b, "count": n} for b, n in sorted(rows, key=lambda x: x[1], reverse=True)]


@app.get(f"{settings.api_prefix}/regions")
def regions(db: Session = Depends(get_db)):
    rows = db.query(Part.region, func.count(Part.id)).filter(Part.is_active == 1, Part.region.isnot(None)).group_by(Part.region).all()
    return [{"name": r, "count": n} for r, n in sorted(rows, key=lambda x: x[1], reverse=True)]


@app.get(f"{settings.api_prefix}/cities")
def cities(db: Session = Depends(get_db)):
    rows = db.query(Part.city, Part.region, func.count(Part.id)).filter(Part.is_active == 1, Part.city.isnot(None)).group_by(Part.city, Part.region).all()
    return [{"city": c, "region": r, "count": n} for c, r, n in sorted(rows, key=lambda x: x[2], reverse=True)]


@app.get(f"{settings.api_prefix}/stats/summary", response_model=StatsSummary)
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


@app.get(f"{settings.api_prefix}/stats/by-category", response_model=List[CategoryStat])
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


@app.get(f"{settings.api_prefix}/stats/by-city", response_model=List[CityStat])
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


@app.get(f"{settings.api_prefix}/stats/price-distribution", response_model=List[PriceBucket])
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


# --- Static frontend mount ---
static_dir = BASE_DIR / "app" / "static"
if static_dir.exists() and any(static_dir.iterdir()):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
