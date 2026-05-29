"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { DotsLoader } from "@/components/ui/dots-loader";

type Status = "verifying" | "success" | "error";

function VerifyEmail() {
  const token = useSearchParams().get("token") || "";
  const [status, setStatus] = useState<Status>("verifying");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against React 18 strict-mode double-run
    ran.current = true;

    if (!token) {
      setStatus("error");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => setStatus(res.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "verifying") {
    return (
      <div className="text-center">
        <DotsLoader />
        <p className="mt-4 text-sm text-forest-ink/55">Verifying your email&hellip;</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-forest-500" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-forest-ink">Email verified</h1>
        <p className="mt-2 text-sm text-forest-ink/55">Your account is all set.</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-forest-500 px-6 text-sm font-semibold text-white hover:bg-forest-600 transition"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <XCircle className="mx-auto h-12 w-12 text-red-400" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-forest-ink">Verification failed</h1>
      <p className="mt-2 text-sm text-forest-ink/55">
        This verification link is invalid or has expired. You can request a new one from your settings.
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
