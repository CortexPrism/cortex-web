"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, RefreshCw, Send, MessageSquare,
  Bot, Shield, Settings as SettingsIcon, Bell, Globe,
} from "lucide-react";
import { Button } from "@/components/shared/Button";

interface DiscordSettings {
  discord_client_id: string | null;
  discord_client_secret: string | null;
  discord_bot_token: string | null;
  discord_guild_id: string | null;
  discord_webhook_url: string | null;
  discord_admin_ids: string | null;
  _env_discord_client_id: string;
  _env_discord_client_secret: string;
  _env_discord_bot_token: string;
  _env_discord_guild_id: string;
  _env_discord_webhook_url: string;
  _env_discord_admin_ids: string;
  _bot_online: string;
  _bot_last_heartbeat: string | null;
}

export default function AdminDiscordPage() {
  const [settings, setSettings] = useState<DiscordSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});

  const authHeaders = useCallback(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return t ? { authorization: `Bearer ${t}` } : {};
  }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchSettings = async () => {
    const headers = authHeaders();
    if (!headers.authorization) { setLoading(false); return; }
    try {
      const res = await fetch("/api/admin/discord", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const s = data.settings as DiscordSettings;
      setSettings(s);
      setFormValues({
        discord_client_id: s.discord_client_id || "",
        discord_client_secret: s.discord_client_secret || "",
        discord_bot_token: s.discord_bot_token || "",
        discord_guild_id: s.discord_guild_id || "",
        discord_webhook_url: s.discord_webhook_url || "",
        discord_admin_ids: s.discord_admin_ids || "",
      });
    } catch (e) {
      showMsg("error", "Failed to load: " + (e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSetting = async (key: string) => {
    const headers = authHeaders();
    if (!headers.authorization) { showMsg("error", "Not authenticated"); return; }
    setSaving(key);
    try {
      const value = formValues[key];
      const res = await fetch("/api/admin/discord", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ key, value: value || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg("success", key.replace("discord_", "").replace(/_/g, " ") + " saved");
        if (settings) {
          setSettings({ ...settings, [key]: value || null });
        }
      } else {
        showMsg("error", data.error || "Save failed (HTTP " + res.status + ")");
      }
    } catch (e) {
      showMsg("error", "Connection error: " + (e as Error).message);
    }
    setSaving(null);
  };

  const testWebhook = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setTestingWebhook(true);
    try {
      const res = await fetch("/api/admin/discord", {
        method: "POST", headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ action: "test-webhook" }),
      });
      const data = await res.json();
      showMsg(res.ok ? "success" : "error", res.ok ? "Webhook test sent!" : (data.error || "Test failed"));
    } catch {
      showMsg("error", "Connection error");
    }
    setTestingWebhook(false);
  };

  const pingBot = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    try {
      const res = await fetch("/api/admin/discord", {
        method: "POST", headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ action: "ping-bot" }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.online) {
          showMsg("success", "Bot is online (heartbeat " + data.secondsSinceHeartbeat + "s ago)");
        } else {
          showMsg("error", "Bot is offline" + (data.lastHeartbeat ? " (last seen " + data.lastHeartbeat + ")" : " (no heartbeat recorded)"));
        }
        fetchSettings();
      } else {
        showMsg("error", data.error || "Ping failed");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50";
  const labelClass = "block text-sm text-[#e2e2ea] mb-1.5";

  function renderConfigField(key: string, label: string, placeholder: string, secret?: boolean, helpText?: string, docLink?: string) {
    return (
      <div className="mb-4" key={key}>
        <label className={labelClass}>{label}</label>
        <div className="relative">
          <input
            type={secret && !showFields[key] ? "password" : "text"}
            value={formValues[key] || ""}
            onChange={e => setFormValues(prev => ({ ...prev, [key]: e.target.value }))}
            className={inputClass + (secret ? " pr-10 font-mono text-xs" : "")}
            placeholder={placeholder}
          />
          {secret && (
            <button
              onClick={() => setShowFields(prev => ({ ...prev, [key]: !prev[key] }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#e2e2ea]"
            >
              {showFields[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {helpText && <p className="text-xs text-[#55556a] mt-1">{helpText}</p>}
        {docLink && (
          <a href={docLink} target="_blank" rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5 mt-1">
            {docLink} <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={() => saveSetting(key)} disabled={saving === key}>
            <Save className="w-3.5 h-3.5 mr-1" /> {saving === key ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  function statusBadge(configured: boolean) {
    return (
      <span className={"inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full " + (configured
        ? "bg-green-500/10 text-green-400 border border-green-500/20"
        : "bg-red-500/10 text-red-400 border border-red-500/20")}>
        {configured ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {configured ? "Configured" : "Not set"}
      </span>
    );
  }

  function sectionHeader(icon: React.ReactNode, title: string, description: string) {
    return (
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-[#e2e2ea]">{title}</h2>
          <p className="text-xs text-[#55556a]">{description}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8"><div className="text-center py-12 text-[#55556a]">Loading...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Discord Bot</h1>
        <p className="text-[#9090a8] text-sm">Manage Discord integration, bot configuration, and OAuth settings</p>
      </div>

      {message && (
        <div className={"mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 " + (message.type === "success"
          ? "bg-green-500/10 text-green-300 border border-green-500/20"
          : "bg-red-500/10 text-red-300 border border-red-500/20")}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Bot Status */}
        <div className="glass-card p-6">
          {sectionHeader(
            <Bot className="w-5 h-5 text-indigo-400" />,
            "Bot Status",
            "Current status of the Discord bot service",
          )}

          <div className="flex items-center justify-between p-4 bg-[#111118] rounded-lg border border-[rgba(255,255,255,0.07)] mb-4">
            <div className="flex items-center gap-3">
              <div className={"w-3 h-3 rounded-full " + (settings?._bot_online === "true" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-500")} />
              <div>
                <p className="text-sm text-[#e2e2ea] font-medium">
                  {settings?._bot_online === "true" ? "Online" : "Offline"}
                </p>
                <p className="text-xs text-[#55556a]">
                  {settings?._bot_last_heartbeat
                    ? "Last heartbeat: " + new Date(settings._bot_last_heartbeat).toLocaleString()
                    : "No heartbeat recorded"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={pingBot}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
              </Button>
            </div>
          </div>

          <div className="text-xs text-[#55556a] space-y-1">
            <p>The bot updates its heartbeat every 30 seconds while running. If no heartbeat is received for 60 seconds, the bot is considered offline.</p>
            <p>To start the bot: <code className="text-indigo-400">cd discord-bot && npx tsx src/index.ts</code></p>
          </div>
        </div>

        {/* OAuth Configuration */}
        <div className="glass-card p-6">
          {sectionHeader(
            <Globe className="w-5 h-5 text-indigo-400" />,
            "OAuth Configuration",
            "Discord OAuth app credentials for Sign in with Discord",
          )}
          {renderConfigField("discord_client_id", "Client ID", "123456789012345678", false,
            "From Discord Developer Portal OAuth2 Client ID",
            "https://discord.com/developers/applications")}
          {renderConfigField("discord_client_secret", "Client Secret", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", true,
            "From Discord Developer Portal OAuth2 Client Secret")}
          <div className="border-t border-[rgba(255,255,255,0.07)] pt-4">
            <h3 className="text-sm font-medium text-[#e2e2ea] mb-2">Configuration Status</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Database Client ID</span>{statusBadge(!!settings?.discord_client_id)}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Database Client Secret</span>{statusBadge(!!settings?.discord_client_secret)}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Environment DISCORD_CLIENT_ID</span>{statusBadge(settings?._env_discord_client_id === "set")}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Environment DISCORD_CLIENT_SECRET</span>{statusBadge(settings?._env_discord_client_secret === "set")}</div>
            </div>
          </div>
        </div>

        {/* Bot Configuration */}
        <div className="glass-card p-6">
          {sectionHeader(
            <SettingsIcon className="w-5 h-5 text-indigo-400" />,
            "Bot Configuration",
            "Discord bot token and guild settings for slash commands",
          )}
          {renderConfigField("discord_bot_token", "Bot Token", "MTJ_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", true,
            "From Discord Developer Portal Bot Token. Required for bot to function.")}
          {renderConfigField("discord_guild_id", "Guild ID", "987654321098765432", false,
            "Guild ID for guild-specific slash command registration (faster updates). Leave empty for global commands.")}
          <div className="border-t border-[rgba(255,255,255,0.07)] pt-4">
            <h3 className="text-sm font-medium text-[#e2e2ea] mb-2">Configuration Status</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Database Bot Token</span>{statusBadge(!!settings?.discord_bot_token)}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Database Guild ID</span>{statusBadge(!!settings?.discord_guild_id)}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Environment DISCORD_BOT_TOKEN</span>{statusBadge(settings?._env_discord_bot_token === "set")}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Environment DISCORD_GUILD_ID</span>{statusBadge(settings?._env_discord_guild_id === "set")}</div>
            </div>
          </div>
        </div>

        {/* Notification Configuration */}
        <div className="glass-card p-6">
          {sectionHeader(
            <Bell className="w-5 h-5 text-indigo-400" />,
            "Submission Notifications",
            "Discord webhook for marketplace submission alerts",
          )}
          {renderConfigField("discord_webhook_url", "Webhook URL", "https://discord.com/api/webhooks/...", false,
            "Channel webhook URL for new plugin/agent submission notifications.",
            "https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks")}
          <div className="flex items-center justify-between p-3 bg-[#111118] rounded-lg border border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center gap-2"><Send className="w-4 h-4 text-[#55556a]" /><span className="text-sm text-[#e2e2ea]">Test webhook</span></div>
            <Button variant="outline" size="sm" onClick={testWebhook} disabled={testingWebhook}>
              {testingWebhook ? "Sending..." : "Send Test"}
            </Button>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.07)] pt-4 mt-4">
            <h3 className="text-sm font-medium text-[#e2e2ea] mb-2">Configuration Status</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Database Webhook URL</span>{statusBadge(!!settings?.discord_webhook_url)}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Environment DISCORD_SUBMISSION_WEBHOOK_URL</span>{statusBadge(settings?._env_discord_webhook_url === "set")}</div>
            </div>
          </div>
        </div>

        {/* Admin Configuration */}
        <div className="glass-card p-6">
          {sectionHeader(
            <Shield className="w-5 h-5 text-indigo-400" />,
            "Admin Access",
            "Discord user IDs with bot admin permissions for /review commands",
          )}
          {renderConfigField("discord_admin_ids", "Admin User IDs", "123456789012345678, 234567890123456789", false,
            "Comma-separated Discord user IDs. These users can use /review commands in Discord.")}
          <div className="border-t border-[rgba(255,255,255,0.07)] pt-4">
            <h3 className="text-sm font-medium text-[#e2e2ea] mb-2">Configuration Status</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Database Admin IDs</span>{statusBadge(!!settings?.discord_admin_ids)}</div>
              <div className="flex justify-between py-1"><span className="text-[#9090a8]">Environment DISCORD_ADMIN_IDS</span>{statusBadge(settings?._env_discord_admin_ids === "set")}</div>
            </div>
          </div>
        </div>

        {/* Commands Reference */}
        <div className="glass-card p-6">
          {sectionHeader(
            <MessageSquare className="w-5 h-5 text-indigo-400" />,
            "Bot Commands Reference",
            "Available Discord slash commands",
          )}
          <div className="text-sm text-[#55556a] space-y-2">
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <code className="text-indigo-400">/stats</code><span>Show marketplace statistics</span>
              <code className="text-indigo-400">/plugin search &lt;query&gt;</code><span>Search plugins by name or keyword</span>
              <code className="text-indigo-400">/plugin info &lt;name|id&gt;</code><span>Show plugin details</span>
              <code className="text-indigo-400">/agent search &lt;query&gt;</code><span>Search agents by name or keyword</span>
              <code className="text-indigo-400">/agent info &lt;name|id&gt;</code><span>Show agent details</span>
              <code className="text-indigo-400">/review list</code><span>List pending submissions (admin only)</span>
              <code className="text-indigo-400">/review approve &lt;id&gt;</code><span>Approve a submission (admin only)</span>
              <code className="text-indigo-400">/review reject &lt;id&gt; &lt;reason&gt;</code><span>Reject a submission (admin only)</span>
            </div>
            <p className="mt-3 text-xs text-[#55556a]">
              Register commands: <code className="text-indigo-400">cd discord-bot && npx tsx src/deploy-commands.ts</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
