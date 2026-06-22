import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function generateUsername(base: string): string {
  const sanitized = base.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20);
  return `${sanitized}_${Math.random().toString(36).slice(2, 8)}`;
}

async function exchangeCode(code: string) {
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/api/auth/discord/callback`,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    console.error("Discord token exchange failed:", err);
    return null;
  }

  const tokenData = await tokenResponse.json();
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userResponse.ok) return null;

  return userResponse.json();
}

function getCookie(request: NextRequest, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(name + "=")) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "";

    if (!code) {
      return new Response("Missing code parameter", { status: 400 });
    }

    // Link flow: validate state, then pass code to the link API
    // (don't exchangeCode here — the code is single-use and the link API handles it)
    if (state.startsWith("link:")) {
      const stateValue = state.slice(5);
      const storedState = getCookie(request, "discord_oauth_state");
      if (!storedState || storedState !== stateValue) {
        return new Response("Invalid state parameter", { status: 400 });
      }

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Linking Discord...</title></head>
<body>
<script>
(async function() {
  var token = localStorage.getItem("token");
  if (!token) { window.location.href = "/login?error=not_authenticated"; return; }
  try {
    var res = await fetch("/api/auth/discord/link", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + token },
      body: JSON.stringify({ code: ${JSON.stringify(code)} }),
    });
    var data = await res.json();
    if (res.ok && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard/settings?linked=discord";
    } else {
      window.location.href = "/dashboard/settings?error=" + encodeURIComponent(data.error || "link_failed");
    }
  } catch(e) {
    window.location.href = "/dashboard/settings?error=connection_error";
  }
})();
</script>
</body>
</html>`;
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    // Sign-in flow: exchange the code and create/log in the user
    const discordUser = await exchangeCode(code);
    if (!discordUser) {
      return new Response("Failed to authenticate with Discord", { status: 500 });
    }

    const discordId = discordUser.id;
    const discordUsername = `${discordUser.username}`;

    let user = await prisma.user.findUnique({ where: { discordId } });

    if (!user) {
      const email = `${discordId}@discord.placeholder`;
      const username = generateUsername(discordUser.username);

      user = await prisma.user.create({
        data: { email, username, passwordHash: "", discordId, discordUsername },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { discordUsername },
      });
    }

    const token = signToken({ userId: user.id, role: user.role });

    const userJson = JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: null,
      role: user.role,
      avatar: null,
      bio: null,
      website: null,
      location: null,
      socialLinks: null,
      preferences: null,
      emailVerified: false,
      createdAt: user.createdAt.toISOString(),
      discordUsername,
    });

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Redirecting...</title></head>
<body>
<script>
  localStorage.setItem("token", ${JSON.stringify(token)});
  localStorage.setItem("user", ${JSON.stringify(userJson)});
  window.location.href = "/dashboard";
</script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    console.error("Discord callback error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
