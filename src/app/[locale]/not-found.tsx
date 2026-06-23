"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tc = useTranslations("common");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-[#e2e2ea] mb-2">{t("title")}</h1>
        <p className="text-[#9090a8] mb-8 max-w-md mx-auto">
          {t("description")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
        >
          {tc("goHome")}
        </Link>
      </div>
    </div>
  );
}
