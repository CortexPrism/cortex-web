"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/routing";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const track = () => {
      if (lastPath.current === pathname) return;
      lastPath.current = pathname;

      try {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
          }),
        }).catch(() => {});
      } catch {}
    };

    track();
  }, [pathname]);

  return null;
}
