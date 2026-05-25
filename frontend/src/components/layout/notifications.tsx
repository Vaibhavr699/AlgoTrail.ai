"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Flame, Target, Sparkles, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: <Flame className="h-4 w-4 text-orange-500" />,
    title: "Keep your streak alive!",
    message: "Solve one problem today to maintain your daily streak. Consistency beats intensity.",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    icon: <Target className="h-4 w-4 text-brand-500" />,
    title: "New pattern unlocked",
    message: "You've completed enough problems to start the Sliding Window pattern. Ready to dive in?",
    time: "2h ago",
    read: false,
  },
  {
    id: "3",
    icon: <Sparkles className="h-4 w-4 text-amber-500" />,
    title: "You're making progress!",
    message: "You've solved 5 problems this week. That's more than 80% of users. Keep going!",
    time: "1d ago",
    read: true,
  },
  {
    id: "4",
    icon: <Trophy className="h-4 w-4 text-yellow-500" />,
    title: "Milestone reached",
    message: "You've completed your first topic! Arrays & Hashing is done. On to Two Pointers!",
    time: "3d ago",
    read: true,
  },
];

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))]">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[rgb(var(--muted))]">
                All caught up! No notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b border-[rgb(var(--border))] last:border-0 transition-colors",
                    !n.read && "bg-brand-50/50 dark:bg-brand-900/10"
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-[rgb(var(--muted))] leading-relaxed">{n.message}</p>
                    <p className="mt-1 text-[10px] text-[rgb(var(--muted))]">{n.time}</p>
                  </div>
                  <button
                    onClick={() => dismiss(n.id)}
                    className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[rgb(var(--muted))] hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
