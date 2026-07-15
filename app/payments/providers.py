"""Generate payment checkout URLs for Payme, Click, Uzum and Paynet."""
from __future__ import annotations

import base64
import urllib.parse
from datetime import datetime
from typing import Optional

from app.core.config import settings


def _return_url() -> str:
    return settings.payment_return_url or f"{settings.site_url}/payment/success"


def _amount_tiyn(amount_uzs: float) -> int:
    return int(round(amount_uzs * 100))


def _transaction_ref(order_id: int, provider: str) -> str:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"uzap-{order_id}-{provider}-{ts}"


def generate_payme_url(order_id: int, amount_uzs: float, return_url: Optional[str] = None) -> str:
    """Build a Payme checkout URL using the documented base64 token format."""
    merchant = settings.payme_merchant_id or "TEST_MERCHANT_ID"
    redirect = return_url or _return_url()
    amount_tiyn = _amount_tiyn(amount_uzs)
    token = f"m={merchant};l=uz;ac.order_id={order_id};a={amount_tiyn};c={redirect}"
    encoded = base64.urlsafe_b64encode(token.encode("utf-8")).decode("utf-8").rstrip("=")
    return f"https://checkout.paycom.uz/{encoded}"


def generate_click_url(order_id: int, amount_uzs: float, return_url: Optional[str] = None) -> str:
    """Build a Click checkout URL with service and merchant identifiers."""
    service_id = settings.click_service_id or "TEST_SERVICE_ID"
    merchant_id = settings.click_merchant_id or "TEST_MERCHANT_ID"
    redirect = return_url or _return_url()
    params = {
        "service_id": service_id,
        "merchant_id": merchant_id,
        "amount": amount_uzs,
        "transaction_param": _transaction_ref(order_id, "click"),
        "return_url": redirect,
    }
    query = urllib.parse.urlencode(params)
    return f"https://my.click.uz/services/pay?{query}"


def generate_uzum_url(order_id: int, amount_uzs: float, return_url: Optional[str] = None) -> str:
    """Build an Uzum Bank open-service checkout URL."""
    service_id = settings.uzum_service_id or "TEST_SERVICE_ID"
    redirect = return_url or _return_url()
    params = {
        "serviceId": service_id,
        "order_id": order_id,
        "amount": _amount_tiyn(amount_uzs),
        "redirectUrl": redirect,
    }
    query = urllib.parse.urlencode(params)
    return f"https://www.uzumbank.uz/open-service?{query}"


def generate_paynet_url(order_id: int, amount_uzs: float, merchant_id: Optional[str] = None) -> str:
    """Build a Paynet payment link (amount in tiyn)."""
    merchant = merchant_id or settings.payme_merchant_id or "TEST_MERCHANT_ID"
    params = {
        "m": merchant,
        "c": _transaction_ref(order_id, "paynet"),
        "a": _amount_tiyn(amount_uzs),
    }
    query = urllib.parse.urlencode(params)
    return f"https://app.paynet.uz/?{query}"


def get_payment_url(provider: str, order_id: int, amount_uzs: float) -> str:
    if provider == "payme":
        return generate_payme_url(order_id, amount_uzs)
    if provider == "click":
        return generate_click_url(order_id, amount_uzs)
    if provider == "uzum":
        return generate_uzum_url(order_id, amount_uzs)
    if provider == "cash_on_delivery":
        return ""
    return ""
