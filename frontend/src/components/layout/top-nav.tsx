"use client";

import { Search, Bell, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui.store";

export function TopNav({ title }: { title: string }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-10 h-14 flex items-center gap-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden md:inline-flex"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      <h1 className="text-sm font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--muted))] text-sm w-64">
          <Search className="h-4 w-4" />
          <span className="flex-1">Search questions…</span>
          <kbd className="font-mono text-[10px] border border-[rgb(var(--border))] rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
