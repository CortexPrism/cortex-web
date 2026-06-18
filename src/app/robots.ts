import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const publicDisallow = [
  "/api/",
  "/dashboard/",
  "/admin/",
  "/login/",
  "/register/",
  "/profile/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: publicDisallow,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: publicDisallow,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: publicDisallow,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: publicDisallow,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: publicDisallow,
      },
      {
        userAgent: "GoogleOther",
        allow: "/",
        disallow: publicDisallow,
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "ia_archiver",
        disallow: "/",
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap.md`,
    ],
    host: SITE_URL,
  };
}
