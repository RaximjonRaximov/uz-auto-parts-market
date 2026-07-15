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
    order_items = relationship("OrderItem", back_populates="part", lazy="dynamic")


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), nullable=False, unique=True, index=True)
    phone = Column(String(50), nullable=True, unique=True, index=True)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="buyer")  # buyer | seller | admin
    is_active = Column(Integer, default=1)
    avatar_url = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)

    orders = relationship("Order", back_populates="buyer", lazy="dynamic")
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender", lazy="dynamic")
    payments = relationship("Payment", back_populates="user", lazy="dynamic")


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=True, index=True)
    status = Column(String(30), nullable=False, default="pending")  # pending | confirmed | shipped | delivered | cancelled
    total_uzs = Column(Float, nullable=False, default=0.0)
    delivery_address = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    buyer = relationship("User", back_populates="orders")
    seller = relationship("Seller")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="order", lazy="dynamic")
    payments = relationship("Payment", back_populates="order", lazy="dynamic")


class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price_uzs = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="pending")  # pending | ready | shipped

    order = relationship("Order", back_populates="items")
    part = relationship("Part", back_populates="order_items")


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    body = Column(Text, nullable=False)
    is_read = Column(Integer, default=0)

    order = relationship("Order", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(30), nullable=False)  # payme | click | uzum | cash_on_delivery
    amount_uzs = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="pending")  # pending | paid | failed | refunded
    provider_transaction_id = Column(String(255), nullable=True)
    payment_url = Column(String(800), nullable=True)

    order = relationship("Order", back_populates="payments")
    user = relationship("User", back_populates="payments")
