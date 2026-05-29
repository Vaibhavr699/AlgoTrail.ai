"""Stripe billing: checkout, customer portal, and subscription webhooks.

Scaffold: prices/limits are placeholders configured via env + the Stripe
dashboard. Everything is guarded so that with no Stripe keys the user-facing
endpoints return 503 (dev-safe) and the webhook rejects unsigned calls.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import current_user
from app.config import get_settings
from app.database import get_db
from app.models import User
from app.observability import logger
from app.usage import daily_limit_for

router = APIRouter()


def _require_stripe():
    settings = get_settings()
    if not settings.stripe_secret_key or not settings.stripe_price_pro:
        raise HTTPException(status_code=503, detail="Billing is not configured.")
    import stripe

    stripe.api_key = settings.stripe_secret_key
    return stripe


def _user_by_customer(db: Session, customer_id: str | None) -> User | None:
    if not customer_id:
        return None
    return db.query(User).filter(User.stripe_customer_id == customer_id).first()


class CheckoutResponse(BaseModel):
    url: str


@router.get("/me")
def billing_me(user: User = Depends(current_user)):
    settings = get_settings()
    return {
        "plan": user.plan,
        "status": user.plan_status,
        "daily_limit": daily_limit_for(user),
        "billing_configured": bool(settings.stripe_secret_key and settings.stripe_price_pro),
    }


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(db: Session = Depends(get_db), user: User = Depends(current_user)):
    stripe = _require_stripe()
    settings = get_settings()

    if not user.stripe_customer_id:
        customer = stripe.Customer.create(email=user.email, metadata={"user_id": user.id})
        user.stripe_customer_id = customer.id
        db.commit()

    base = settings.public_base_url
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=user.stripe_customer_id,
        line_items=[{"price": settings.stripe_price_pro, "quantity": 1}],
        client_reference_id=user.id,
        success_url=f"{base}/settings?checkout=success",
        cancel_url=f"{base}/settings?checkout=cancel",
    )
    return CheckoutResponse(url=session.url)


@router.post("/portal", response_model=CheckoutResponse)
def create_portal(db: Session = Depends(get_db), user: User = Depends(current_user)):
    stripe = _require_stripe()
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account yet. Upgrade first.")
    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=f"{get_settings().public_base_url}/settings",
    )
    return CheckoutResponse(url=session.url)


@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    settings = get_settings()
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Webhook secret not configured.")
    import stripe

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user = _user_by_customer(db, obj.get("customer"))
        if user is None and obj.get("client_reference_id"):
            user = db.query(User).filter(User.id == obj["client_reference_id"]).first()
        if user:
            user.plan = "pro"
            user.plan_status = "active"
            user.stripe_subscription_id = obj.get("subscription")
            if not user.stripe_customer_id:
                user.stripe_customer_id = obj.get("customer")
            db.commit()

    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        user = _user_by_customer(db, obj.get("customer"))
        if user:
            status = obj.get("status")
            user.plan_status = status
            if event_type == "customer.subscription.deleted" or status in ("canceled", "unpaid"):
                user.plan = "free"
            elif status == "active":
                user.plan = "pro"
            db.commit()

    else:
        logger.info("unhandled stripe webhook: %s", event_type)

    return {"received": True}
