"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { DotsLoader } from "@/components/ui/dots-loader";

const INPUT_CLASS =
  "block w-full rounded-lg border border-forest-900/12 bg-white px-3.5 py-2.5 text-sm placeholder:text-forest-ink/35 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition disabled:opacity-50";

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") || "").trim();
    if (!email) return;

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    // Always show the same confirmation — we never reveal whether the email exists.
    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-forest-ink/55">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
          The link expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-sm font-semibold text-forest-600 hover:text-forest-700"
        >
          &larr; Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-forest-ink">Forgot your password?</h1>
      <p className="mt-2 text-sm text-forest-ink/55">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="email" className="text-xs font-semibold text-forest-ink/70">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            disabled={submitting}
            className={INPUT_CLASS + " mt-1.5"}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-forest-500 text-sm font-semibold text-white hover:bg-forest-600 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? <DotsLoader size="sm" className="text-white" /> : "Send reset link"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-forest-ink/55">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-forest-600 hover:text-forest-700">
          Back to login
        </Link>
      </p>
    </div>
  );
}
