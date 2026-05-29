"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useState, useEffect } from "react";
import { useUIStore } from "@/stores/ui.store";
import { setAccessToken } from "@/lib/auth-token";

function ThemeSync() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return null;
}

// Mirrors the session's backend access token into the in-memory cache that the
// API client reads, so requests can attach the bearer header synchronously.
// Runs inside SessionProvider so it tracks sign-in/out.
function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    setAccessToken(session?.accessToken ?? null);
  }, [session?.accessToken]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        <TokenSync />
        <ThemeSync />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
