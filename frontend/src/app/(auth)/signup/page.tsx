"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { DotsLoader } from "@/components/ui/dots-loader";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => scorePassword(password), [password]);

  async function onSocial(provider: "google" | "github") {
    setSocialLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const accept = data.get("accept") === "on";

    if (!name || !email || !password) {
      setError("Please fill in every field above.");
      return;
    }
    if (password.length < 8) {
      setError("Passwords need to be at least 8 characters.");
      return;
    }
    if (!accept) {
      setError("You'll need to accept the terms to continue.");
      return;
    }

    setSubmitting(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setSubmitting(false);
      setError(body?.detail || "Could not create account. Try another email.");
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInRes?.error) {
      setSubmitting(false);
      setError("Account created but sign-in failed. Try logging in.");
      return;
    }

    router.push("/dashboard");
  }

  const anyLoading = submitting || socialLoading !== null;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-ink">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-forest-ink/55">
          Free while in beta. Start mastering DSA patterns today.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          id="name"
          name="name"
          type="text"
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          disabled={anyLoading}
        />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="you@domain.com"
          disabled={anyLoading}
        />

        <div>
          <label
            htmlFor="password"
            className="text-xs font-semibold text-forest-ink/70"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={anyLoading}
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
          <StrengthMeter strength={strength} hasInput={password.length > 0} />
        </div>

        <label className="flex items-start gap-2 text-xs text-forest-ink/55">
          <input
            type="checkbox"
            name="accept"
            disabled={anyLoading}
            className="mt-0.5 h-3.5 w-3.5 rounded border-forest-900/15 text-forest-500 focus:ring-forest-500/30"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-forest-600 hover:text-forest-700">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-forest-600 hover:text-forest-700">Privacy Policy</Link>.
          </span>
        </label>

        {error && (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={anyLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-forest-500 text-sm font-semibold text-white hover:bg-forest-600 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? <DotsLoader size="sm" className="text-white" /> : "Create account"}
        </button>
      </form>

      <Divider />

      <div className="grid grid-cols-2 gap-3">
        <SocialButton
          onClick={() => onSocial("google")}
          disabled={anyLoading}
          loading={socialLoading === "google"}
        >
          <GoogleGlyph />
          Google
        </SocialButton>
        <SocialButton
          onClick={() => onSocial("github")}
          disabled={anyLoading}
          loading={socialLoading === "github"}
        >
          <GithubGlyph />
          GitHub
        </SocialButton>
      </div>

      <p className="mt-8 text-center text-sm text-forest-ink/55">
        Already have one?{" "}
        <Link href="/login" className="font-semibold text-forest-600 hover:text-forest-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}

const INPUT_CLASS =
  "block w-full rounded-lg border border-forest-900/12 bg-white px-3.5 py-2.5 text-sm placeholder:text-forest-ink/35 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition disabled:opacity-50";

function Field({
  id,
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-semibold text-forest-ink/70"
      >
        {label}
      </label>
      <input id={id} className={cn(INPUT_CLASS, "mt-1.5", className)} {...rest} />
    </div>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-forest-ink/40">
      <span className="h-px flex-1 bg-forest-900/8" />
      <span>or</span>
      <span className="h-px flex-1 bg-forest-900/8" />
    </div>
  );
}

function SocialButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-forest-900/10 bg-white px-3 py-2.5 text-sm font-medium text-forest-ink hover:bg-gray-50 transition disabled:opacity-50 disabled:pointer-events-none"
    >
      {loading ? <DotsLoader size="sm" /> : children}
    </button>
  );
}

function GithubGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.09 3.29 9.4 7.86 10.93.57.11.78-.25.78-.55v-2.03c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.04 11.04 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.35.78 1.05.78 2.12v3.14c0 .3.21.66.79.55A11.52 11.52 0 0023.5 12.02C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 12s4.2 9.6 9.4 9.6c5.4 0 9-3.8 9-9.1 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}

function scorePassword(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

function StrengthMeter({
  strength,
  hasInput,
}: {
  strength: 0 | 1 | 2 | 3 | 4;
  hasInput: boolean;
}) {
  const colors = [
    "bg-forest-900/10",
    "bg-red-400",
    "bg-amber-400",
    "bg-forest-400",
    "bg-forest-500",
  ];
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  if (!hasInput) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= strength ? colors[strength] : "bg-forest-900/10"
            )}
          />
        ))}
      </div>
      <p className="flex items-center gap-1 text-[10px] text-forest-ink/55">
        {strength >= 3 && <Check className="h-3 w-3 text-forest-500" />}
        {labels[strength]}
      </p>
    </div>
  );
}
