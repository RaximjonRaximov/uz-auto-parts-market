"""SQLAlchemy ORM models."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.db import Base


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Brand(Base, TimestampMixin):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    country = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    popular = Column(Integer, default=0)

    models = relationship("Model", back_populates="brand", lazy="dynamic")


class Model(Base, TimestampMixin):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), nullable=False, index=True)
    year_start = Column(Integer, nullable=True)
    year_end = Column(Integer, nullable=True)
    body_types = Column(String(255), nullable=True)
    engine_types = Column(String(255), nullable=True)

    brand = relationship("Brand", back_populates="models")
    parts = relationship("Part", back_populates="model_obj", lazy="dynamic")


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    icon = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    seo_title = Column(String(200), nullable=True)
    seo_description = Column(String(500), nullable=True)

    parent = relationship("Category", remote_side=[id], backref="children")


class Seller(Base, TimestampMixin):
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    type = Column(String(50), nullable=False, default="shop")  # shop | individual | service
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    website = Column(String(500), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    region = Column(String(100), nullable=True, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    logo_url = Column(String(500), nullable=True)
    rating = Column(Float, default=0.0)
    verified = Column(Integer, default=0)
    work_hours = Column(String(200), nullable=True)
    brands = Column(String(500), nullable=True)
    services = Column(Text, nullable=True)


class ServiceCenter(Base, TimestampMixin):
    __tablename__ = "service_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    services = Column(Text, nullable=True)  # JSON array as text
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    region = Column(String(100), nullable=True, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    phone = Column(String(50), nullable=True)
    work_hours = Column(String(200), nullable=True)
    brands = Column(String(500), nullable=True)
    rating = Column(Float, default=0.0)


class Part(Base, TimestampMixin):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(100), unique=True, index=True, nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    brand = Column(String(100), index=True, nullable=False)
    model = Column(String(100), index=True, nullable=False)
    year = Column(Integer, index=True, nullable=True)
    category = Column(String(100), index=True, nullable=False)
    condition = Column(String(20), index=True, nullable=False)
    price_uzs = Column(Float, nullable=False)
    price_usd = Column(Float, nullable=True)
    currency = Column(String(10), default="UZS")
    region = Column(String(100), index=True, nullable=True)
    city = Column(String(100), index=True, nullable=True)
    seller_name = Column(String(150), nullable=True)
    seller_phone = Column(String(50), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Integer, default=1)

    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True, index=True)

    brand_obj = relationship("Brand")
    model_obj = relationship("Model")
