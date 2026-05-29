"""Transactional email over SMTP, with a dev-safe console fallback.

When ``SMTP_HOST`` is unset the message (including the action link) is logged
instead of sent, so the verification / reset flows are fully testable locally
without any provider credentials.
"""
import smtplib
from email.message import EmailMessage

from app.config import get_settings
from app.observability import logger


def send_email(to: str, subject: str, html: str, text: str | None = None) -> None:
    settings = get_settings()

    if not settings.smtp_host:
        logger.info(
            "email (console fallback — SMTP not configured): to=%s subject=%s\n%s",
            to,
            subject,
            text or html,
        )
        return

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text or "Please view this email in an HTML-capable client.")
    msg.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            if settings.smtp_starttls:
                server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except Exception:
        # Never let an email failure break the request that triggered it.
        logger.exception("failed to send email to %s (subject=%s)", to, subject)


def _button(label: str, url: str) -> str:
    return (
        f'<p style="margin:24px 0"><a href="{url}" '
        'style="background:#2f7d4f;color:#fff;padding:12px 20px;border-radius:8px;'
        'text-decoration:none;font-family:sans-serif">'
        f"{label}</a></p>"
        f'<p style="color:#666;font-family:sans-serif;font-size:13px">'
        f'Or paste this link into your browser:<br>{url}</p>'
    )


def send_verification_email(to: str, link: str) -> None:
    html = (
        '<div style="font-family:sans-serif">'
        "<h2>Confirm your email</h2>"
        "<p>Welcome to AlgoTrail.ai! Confirm your email to finish setting up your account.</p>"
        f"{_button('Verify email', link)}"
        "<p style='color:#999;font-size:12px'>This link expires in 24 hours.</p>"
        "</div>"
    )
    send_email(to, "Verify your AlgoTrail.ai email", html, text=f"Verify your email: {link}")


def send_password_reset_email(to: str, link: str) -> None:
    html = (
        '<div style="font-family:sans-serif">'
        "<h2>Reset your password</h2>"
        "<p>We received a request to reset your AlgoTrail.ai password. "
        "If this wasn't you, you can safely ignore this email.</p>"
        f"{_button('Reset password', link)}"
        "<p style='color:#999;font-size:12px'>This link expires in 1 hour.</p>"
        "</div>"
    )
    send_email(to, "Reset your AlgoTrail.ai password", html, text=f"Reset your password: {link}")
