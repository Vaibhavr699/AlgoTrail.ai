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


def _stat(value: str, label: str) -> str:
    return (
        '<td style="text-align:center;padding:8px 12px">'
        f'<div style="font-size:26px;font-weight:800;color:#2f7d4f">{value}</div>'
        f'<div style="font-size:12px;color:#666">{label}</div>'
        "</td>"
    )


def send_weekly_digest_email(to: str, name: str | None, data: dict, base_url: str) -> None:
    base = base_url.rstrip("/")
    greeting = f"Hi {name.split()[0]}," if name else "Hi there,"
    streak = data["streak"]
    streak_line = (
        f"You're on a {streak}-day streak 🔥 — keep it alive!"
        if streak
        else "Solve one problem today to start a streak 🔥"
    )
    review_line = (
        f"<p style='font-family:sans-serif'>📌 <b>{data['due_for_review']}</b> "
        f"problem(s) are due for review.</p>"
        if data["due_for_review"]
        else ""
    )
    readiness_str = f"{data['readiness']}%"

    html = (
        '<div style="font-family:sans-serif;max-width:520px">'
        "<h2>Your week on AlgoTrail.ai</h2>"
        f"<p>{greeting}</p>"
        f"<p>{streak_line}</p>"
        '<table style="margin:18px 0;border:1px solid #eee;border-radius:10px;'
        'border-collapse:separate;padding:6px"><tr>'
        f"{_stat(str(data['solved_this_week']), 'solved this week')}"
        f"{_stat(str(data['total_solved']), 'solved total')}"
        f"{_stat(readiness_str, 'MAANG-ready')}"
        "</tr></table>"
        f"{review_line}"
        f"{_button('Open AlgoTrail', base + '/dashboard')}"
        '<p style="color:#999;font-size:12px;margin-top:24px">'
        f'You receive this weekly summary because it\'s on in your '
        f'<a href="{base}/settings" style="color:#2f7d4f">notification settings</a>.</p>'
        "</div>"
    )
    text = (
        f"{greeting}\n{streak_line}\n\n"
        f"Solved this week: {data['solved_this_week']}\n"
        f"Solved total: {data['total_solved']}\n"
        f"MAANG-ready: {data['readiness']}%\n"
        f"Due for review: {data['due_for_review']}\n\n"
        f"Open AlgoTrail: {base}/dashboard\n"
        f"Manage emails: {base}/settings"
    )
    send_email(to, "Your week on AlgoTrail.ai 📈", html, text=text)
