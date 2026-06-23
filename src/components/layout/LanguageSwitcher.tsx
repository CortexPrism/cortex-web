"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function LanguageSwitcher() {
  const t = useTranslations("langSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(nextLocale: string) {
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  const currentLabel = t(locale) || locale;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 text-sm rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
        title={t("label")}
        aria-label={t("label")}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden lg:inline">{currentLabel}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-44 max-h-72 overflow-y-auto glass-card p-1.5 shadow-2xl shadow-black/40 z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                loc === locale
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#18181f]"
              )}
            >
              {t(loc)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
