"use client";

import { useEffect } from "react";

export function KbViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/knowledge-base/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
