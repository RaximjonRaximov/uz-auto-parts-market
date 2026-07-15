"""Pydantic request/response schemas."""
from __future__ import annotations

import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import _clean_html, _sanitize


class PartBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    brand: str = Field(..., min_length=1, max_length=100)
    model: str = Field(..., min_length=1, max_length=100)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    category: str = Field(..., min_length=1, max_length=100)
    condition: str = Field(..., pattern=r"^(new|used|remanufactured)$")
    price_uzs: float = Field(..., gt=0, le=1_000_000_000_000)
    price_usd: Optional[float] = Field(None, gt=0, le=100_000_000_000)
    currency: str = Field(default="UZS", max_length=10)
    region: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    seller_name: Optional[str] = Field(None, max_length=150)
    seller_phone: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = Field(None, max_length=500)

    @field_validator("title", "brand", "model", "category", "region", "city", "seller_name", mode="before")
    @classmethod
    def strip_strings(cls, v: Optional[str]) -> Optional[str]:
        return _sanitize(v, 500) if isinstance(v, str) else v

    @field_validator("description", mode="before")
    @classmethod
    def clean_description(cls, v: Optional[str]) -> Optional[str]:
        return _clean_html(_sanitize(v, 2000))

    @field_validator("seller_phone", mode="before")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        import re

        cleaned = re.sub(r"\s", "", v)
        if not re.fullmatch(r"\+?\d{7,15}", cleaned):
            raise ValueError("Telefon raqami noto'g'ri formatda")
        return cleaned

    @field_validator("image_url", mode="before")
    @classmethod
    def validate_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        import re

        if not re.match(r"^https?://", v, re.IGNORECASE):
            raise ValueError("Rasm URLi faqat http yoki https bilan boshlanishi kerak")
        return v


class PartCreate(PartBase):
    external_id: Optional[str] = Field(None, max_length=100)


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


class BrandResponse(BaseModel):
    id: int
    name: str
    slug: str
    country: Optional[str]
    logo_url: Optional[str]
    popular: int
    model_config = ConfigDict(from_attributes=True)


class ModelResponse(BaseModel):
    id: int
    brand_id: int
    name: str
    slug: str
    year_start: Optional[int]
    year_end: Optional[int]
    body_types: Optional[str]
    engine_types: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class SellerResponse(BaseModel):
    id: int
    name: str
    type: str
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    address: Optional[str]
    city: Optional[str]
    region: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    logo_url: Optional[str]
    rating: float
    verified: int
    work_hours: Optional[str]
    brands: Optional[str]
    services: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class ServiceCenterResponse(BaseModel):
    id: int
    name: str
    services: Optional[str]
    address: Optional[str]
    city: Optional[str]
    region: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    phone: Optional[str]
    work_hours: Optional[str]
    brands: Optional[str]
    rating: float
    model_config = ConfigDict(from_attributes=True)


class VinDecodeResponse(BaseModel):
    vin: str
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    engine: Optional[str] = None
    message: Optional[str] = None


class UserRegister(BaseModel):
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: Optional[str] = Field(None, max_length=50)
    role: str = Field(default="buyer", pattern=r"^(buyer|seller|admin)$")
    city: Optional[str] = Field(None, max_length=100)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        v = _sanitize(v, 150)
        if not v or "@" not in v:
            raise ValueError("Email manzili noto'g'ri")
        return v.lower()

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        cleaned = re.sub(r"\s", "", v)
        if not re.fullmatch(r"\+?\d{7,15}", cleaned):
            raise ValueError("Telefon raqami noto'g'ri formatda")
        return cleaned


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    city: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class OrderItemCreate(BaseModel):
    part_id: int = Field(..., ge=1)
    quantity: int = Field(default=1, ge=1, le=99)


class OrderCreate(BaseModel):
    items: List["OrderItemCreate"] = Field(..., min_length=1, max_length=50)
    delivery_address: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    seller_id: Optional[int] = None

    @field_validator("delivery_address", "notes", mode="before")
    @classmethod
    def clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean_html(_sanitize(v, 1000))


class OrderItemResponse(BaseModel):
    id: int
    part_id: int
    quantity: int
    unit_price_uzs: float
    status: str
    part: Optional[PartResponse] = None
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: Optional[int]
    status: str
    total_uzs: float
    delivery_address: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[OrderItemResponse] = []
    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(pending|confirmed|shipped|delivered|cancelled)$")


class MessageCreate(BaseModel):
    order_id: int = Field(..., ge=1)
    body: str = Field(..., min_length=1, max_length=2000)

    @field_validator("body", mode="before")
    @classmethod
    def clean_body(cls, v: str) -> str:
        return _clean_html(_sanitize(v, 2000)) or ""


class MessageResponse(BaseModel):
    id: int
    order_id: int
    sender_id: int
    sender_name: str
    body: str
    is_read: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PaymentCreate(BaseModel):
    order_id: int = Field(..., ge=1)
    provider: str = Field(..., pattern=r"^(payme|click|uzum|cash_on_delivery)$")


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    user_id: int
    provider: str
    amount_uzs: float
    status: str
    provider_transaction_id: Optional[str]
    payment_url: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
