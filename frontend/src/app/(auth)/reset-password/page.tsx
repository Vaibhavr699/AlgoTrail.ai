"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { DotsLoader } from "@/components/ui/dots-loader";

const INPUT_CLASS =
  "block w-full rounded-lg border border-forest-900/12 bg-white px-3.5 py-2.5 text-sm placeholder:text-forest-ink/35 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition disabled:opacity-50";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setSubmitting(false);
      setError(body?.detail || "This reset link is invalid or expired. Request a new one.");
      return;
    }

    setDone(true);
    setSubmitting(false);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-ink">Invalid link</h1>
        <p className="mt-2 text-sm text-forest-ink/55">
          This password reset link is missing its token.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-block text-sm font-semibold text-forest-600 hover:text-forest-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-ink">Password updated</h1>
        <p className="mt-2 text-sm text-forest-ink/55">Taking you to the login page&hellip;</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-forest-ink">Set a new password</h1>
      <p className="mt-2 text-sm text-forest-ink/55">Choose a strong password you don&apos;t use elsewhere.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="password" className="text-xs font-semibold text-forest-ink/70">
            New password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              disabled={submitting}
              className={INPUT_CLASS + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-forest-ink/40 hover:text-forest-ink transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="text-xs font-semibold text-forest-ink/70">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            disabled={submitting}
            className={INPUT_CLASS + " mt-1.5"}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-forest-500 text-sm font-semibold text-white hover:bg-forest-600 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? <DotsLoader size="sm" className="text-white" /> : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
