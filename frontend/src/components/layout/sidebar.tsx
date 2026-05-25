"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Map, BarChart3, Settings, Flame, LogOut, Shapes } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/patterns", label: "Patterns", icon: Shapes },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ streak = 0 }: { streak?: number }) {
  const pathname = usePathname();
  const open = useUIStore((s) => s.sidebarOpen);
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <aside
      className={cn(
        "hidden md:flex sticky top-0 h-screen shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] transition-all",
        open ? "w-60" : "w-16"
      )}
    >
      <Link
        href="/dashboard"
        className="flex h-14 items-center px-4 border-b border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <Image src="/AlgoTrailnobg.png" alt="AlgoTrail.ai" width={32} height={32} className="h-8 w-8 shrink-0" />
        {open && <span className="font-semibold tracking-tight">AlgoTrail.ai</span>}
      </Link>

      <nav data-tour="sidebar-nav" className="flex-1 py-3 px-2 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-[rgb(var(--muted))] hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {open && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgb(var(--border))] p-3">
        <div className="flex items-center gap-3">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "Avatar"}
              className="h-9 w-9 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
          )}
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-[rgb(var(--muted))] flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="font-mono">{streak}</span> day streak
              </p>
            </div>
          )}
        </div>
        {open && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-[rgb(var(--muted))] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
