import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const allowedOrigins = [
  "https://cortexprism.io",
  "http://localhost:3000",
  "http://localhost:3001",
];

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function handleCors(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  const origin = request.headers.get("origin") || "";
  const resolvedHeaders = { ...corsHeaders };
  if (allowedOrigins.includes(origin)) {
    resolvedHeaders["Access-Control-Allow-Origin"] = origin;
  } else {
    delete resolvedHeaders["Access-Control-Allow-Origin"];
  }

  const response = NextResponse.next();
  Object.entries(resolvedHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

const intlMiddleware = createMiddleware(routing);

const staticPathPatterns = [
  "/_next/",
  "/api/",
  "/fonts/",
  "/images/",
  "/indexnow-key.txt",
  "/install.sh",
  "/install.ps1",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.md",
  "/sitemap.xml",
  "/robots.txt",
  "/favicon.ico",
  "/og-image.png",
];

function isStaticPath(pathname: string): boolean {
  return staticPathPatterns.some(
    (pattern) =>
      pathname === pattern || pathname.startsWith(pattern)
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
    if (
      pathname.startsWith("/api/") ||
      pathname === "/indexnow-key.txt"
    ) {
      return handleCors(request);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}
