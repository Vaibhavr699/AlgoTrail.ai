"use client";

import { useSession, signOut } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  User,
  Palette,
  LogOut,
  Moon,
  Sun,
  Shield,
  Bell,
  RotateCcw,
  Trash2,
  ExternalLink,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DotsLoader } from "@/components/ui/dots-loader";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const resetOnboarding = useUIStore((s) => s.resetOnboarding);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <TopNav title="Settings" />
      <div className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-5">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Avatar"}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold truncate">{user?.name || "User"}</p>
                <p className="text-sm text-[rgb(var(--muted))] truncate">{user?.email || ""}</p>
                <p className="mt-1 text-xs text-[rgb(var(--muted))]">
                  Member since {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <BillingCard />

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <div className="flex gap-2">
              <ThemeButton
                active={theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun className="h-4 w-4" />}
                label="Light"
              />
              <ThemeButton
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<Moon className="h-4 w-4" />}
                label="Dark"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              label="Streak reminders"
              desc="Get reminded to solve a problem daily"
              defaultChecked
            />
            <WeeklyDigestRow />
            <ToggleRow
              label="New feature announcements"
              desc="Be notified when we ship something new"
              defaultChecked={false}
            />
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Study Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Daily problem goal</label>
              <select className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm w-full sm:w-48">
                <option value="1">1 problem / day</option>
                <option value="2">2 problems / day</option>
                <option value="3" selected>3 problems / day</option>
                <option value="5">5 problems / day</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Preferred language</label>
              <select className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm w-full sm:w-48">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
              </select>
            </div>
            <div className="pt-2">
              <button
                onClick={resetOnboarding}
                className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Replay onboarding tour
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
              <a
                href="/terms"
                className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Terms
              </a>
              <a
                href="/privacy"
                className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Privacy
              </a>
            </div>

            <div className="pt-3 border-t border-[rgb(var(--border))]">
              <p className="text-sm font-medium text-red-600">Danger zone</p>
              <p className="text-xs text-[rgb(var(--muted))] mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[rgb(var(--muted))] pb-4">
          AlgoTrail.ai v0.1 &middot; Made with care for DSA learners
        </p>
      </div>
    </>
  );
}

function WeeklyDigestRow() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notif-prefs"], queryFn: api.account.notifications });
  const enabled = data?.weekly_digest ?? true;
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);

  const toggle = useMutation({
    mutationFn: (next: boolean) => api.account.setWeeklyDigest(next),
    onSuccess: (res) => qc.setQueryData(["notif-prefs"], res),
  });
  const preview = useMutation({
    mutationFn: api.account.sendDigestPreview,
    onSuccess: (res) => setPreviewMsg(`Sent a preview to ${res.sent_to}.`),
    onError: () => setPreviewMsg("Couldn't send the preview. Try again."),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">Weekly progress summary</p>
          <p className="text-xs text-[rgb(var(--muted))]">
            A Monday email with what you solved, your streak, and what&apos;s due for review
          </p>
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggle.mutate(e.target.checked)}
          disabled={toggle.isPending}
          className="h-4 w-4 rounded border-[rgb(var(--border))] text-brand-500 focus:ring-brand-500/30 shrink-0"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setPreviewMsg(null);
            preview.mutate();
          }}
          disabled={preview.isPending}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-60"
        >
          {preview.isPending ? "Sending…" : "Send me a preview"}
        </button>
        {previewMsg && <span className="text-xs text-[rgb(var(--muted))]">{previewMsg}</span>}
      </div>
    </div>
  );
}

function BillingCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["billing-me"], queryFn: api.billing.me });
  const [notice, setNotice] = useState<"success" | "cancel" | null>(null);

  const checkout = useMutation({
    mutationFn: api.billing.checkout,
    onSuccess: (r) => {
      window.location.href = r.url;
    },
  });
  const portal = useMutation({
    mutationFn: api.billing.portal,
    onSuccess: (r) => {
      window.location.href = r.url;
    },
  });

  // Read Stripe's redirect result without useSearchParams (avoids a Suspense boundary).
  useEffect(() => {
    const checkoutParam = new URLSearchParams(window.location.search).get("checkout");
    if (checkoutParam === "success") {
      setNotice("success");
      qc.invalidateQueries({ queryKey: ["billing-me"] });
    } else if (checkoutParam === "cancel") {
      setNotice("cancel");
    }
  }, [qc]);

  const plan = data?.plan ?? "free";
  const isPro = plan === "pro";
  const configured = data?.billing_configured ?? false;
  const busy = checkout.isPending || portal.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Plan &amp; Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notice === "success" && (
          <p className="rounded-lg bg-brand-50 dark:bg-brand-900/20 px-3 py-2 text-sm text-brand-700 dark:text-brand-300">
            🎉 You&apos;re on Pro now. Thanks for the support!
          </p>
        )}
        {notice === "cancel" && (
          <p className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-[rgb(var(--muted))]">
            Checkout canceled — no charge was made.
          </p>
        )}

        {isLoading ? (
          <DotsLoader size="sm" />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  {isPro && <Sparkles className="h-4 w-4 text-brand-500" />}
                  {isPro ? "Pro" : "Free"} plan
                </p>
                <p className="text-xs text-[rgb(var(--muted))]">
                  {data?.daily_limit} AI requests/day
                  {data?.status ? ` · ${data.status}` : ""}
                </p>
              </div>

              {isPro ? (
                <button
                  onClick={() => portal.mutate()}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {portal.isPending ? <DotsLoader size="sm" /> : "Manage billing"}
                </button>
              ) : (
                <button
                  onClick={() => checkout.mutate()}
                  disabled={busy || !configured}
                  title={!configured ? "Billing isn't enabled yet" : undefined}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                >
                  {checkout.isPending ? (
                    <DotsLoader size="sm" className="text-white" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Upgrade to Pro
                    </>
                  )}
                </button>
              )}
            </div>

            {!configured && !isPro && (
              <p className="text-xs text-[rgb(var(--muted))]">
                Pro upgrades are coming soon.
              </p>
            )}
            {(checkout.isError || portal.isError) && (
              <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
          : "border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  desc,
  defaultChecked,
}: {
  label: string;
  desc: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[rgb(var(--muted))]">{desc}</p>
      </div>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-[rgb(var(--border))] text-brand-500 focus:ring-brand-500/30 shrink-0"
      />
    </div>
  );
}
