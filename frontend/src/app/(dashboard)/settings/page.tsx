"use client";

import { useSession, signOut } from "next-auth/react";
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
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex-1 p-4 sm:p-6 max-w-3xl w-full mx-auto space-y-5">
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
            <ToggleRow
              label="Weekly progress summary"
              desc="Summary of problems solved and topics covered"
              defaultChecked
            />
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
