"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Screenshot {
  url: string;
  alt: string | null;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  showThumbnails?: boolean;
}

export function ScreenshotGallery({ screenshots, showThumbnails = false }: ScreenshotGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (screenshots.length === 0) return null;

  return (
    <div className="glass-card p-6 mb-8">
      <div className="relative rounded-lg overflow-hidden bg-[#0a0a0f]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshots[current].url}
          alt={screenshots[current].alt || `Screenshot ${current + 1}`}
          className="w-full h-64 md:h-80 object-contain"
        />
        {screenshots.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(c => (c - 1 + screenshots.length) % screenshots.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrent(c => (c + 1) % screenshots.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {showThumbnails && screenshots.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {screenshots.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-10 rounded-md overflow-hidden border-2 transition-colors ${i === current ? "border-indigo-500" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt={s.alt || `Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
