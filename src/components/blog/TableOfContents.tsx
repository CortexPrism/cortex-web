"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(content: string): TocEntry[] {
  const headings: TocEntry[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].trim().replace(/[`*_~\[\]()]/g, "");
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    setHeadings(extractHeadings(content));
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1" aria-label="Table of contents">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#55556a] mb-3">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-[rgba(255,255,255,0.08)]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block text-sm py-1 transition-colors border-l-2 -ml-px",
                heading.level === 1 && "pl-4",
                heading.level === 2 && "pl-6",
                heading.level === 3 && "pl-8",
                activeId === heading.id
                  ? "text-indigo-400 border-indigo-400"
                  : "text-[#55556a] border-transparent hover:text-[#9090a8] hover:border-[rgba(255,255,255,0.12)]"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
