"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Save, CheckCircle, XCircle, Eye, EyeOff, RefreshCw, Send,
  Bot, Shield, Settings as SettingsIcon, Bell, Globe, Play, Square,
  RotateCw, BarChart3, ShieldAlert, MessageSquare, Home, Zap,
  DoorOpen, ToggleLeft, ToggleRight, Search,
  ChevronLeft, ChevronRight, Trash2,
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
  _bot_started_at: string | null;
  _bot_uptime_seconds: string | null;
  _bot_command_counts: string | null;
}

interface GuildConfig {
  id: string;
  guildId: string;
  guildName: string | null;
  logChannelId: string | null;
  modRoleId: string | null;
  adminRoleId: string | null;
  autoModEnabled: boolean;
  welcomeEnabled: boolean;
  welcomeMessage: string | null;
  welcomeChannelId: string | null;
  leaveEnabled: boolean;
  leaveMessage: string | null;
  leaveChannelId: string | null;
  slowmodeDefault: number;
  maxWarnsBeforeBan: number;
  announcementChannelId: string | null;
  ticketCategoryId: string | null;
  ticketLogChannelId: string | null;
  ticketStaffRoleId: string | null;
  levelingEnabled: boolean;
  levelingChannelId: string | null;
  starboardEnabled: boolean;
  starboardChannelId: string | null;
  starboardThreshold: number;
}

interface AutoModRule {
  id: string;
  guildId: string;
  type: string;
  name: string;
  enabled: boolean;
  action: string;
  duration: number | null;
  config: string | null;
  createdAt: string;
}

interface ModLog {
  id: string;
  guildId: string;
  actionType: string;
  moderatorId: string;
  moderatorTag: string;
  targetId: string;
  targetTag: string;
  reason: string | null;
  duration: string | null;
  createdAt: string;
}

type TabKey = "overview" | "config" | "guild" | "automod" | "welcome" | "commands" | "moderation";

export default function AdminDiscordPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [settings, setSettings] = useState<DiscordSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [controlling, setControlling] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});

  const [guildConfigs, setGuildConfigs] = useState<GuildConfig[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<GuildConfig | null>(null);
  const [guildForm, setGuildForm] = useState<Partial<GuildConfig>>({});
  const [savingGuild, setSavingGuild] = useState(false);

  const [autoModRules, setAutoModRules] = useState<AutoModRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);

  const [modLogs, setModLogs] = useState<{ logs: ModLog[]; total: number; page: number; totalPages: number; actionCounts: Record<string, number> } | null>(null);
  const [modPage, setModPage] = useState(1);
  const [modFilter, setModFilter] = useState("");
  const [modSearch, setModSearch] = useState("");

  const authHeaders = useCallback(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return t ? { authorization: `Bearer ${t}`, "Content-Type": "application/json" } : {};
  }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
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

  const fetchGuildConfigs = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    try {
      const guildId = formValues.discord_guild_id || settings?.discord_guild_id || "";
      const hasEnvGuildId = settings?._env_discord_guild_id === "set";
      if (!guildId && !hasEnvGuildId) return;
      const params = guildId ? `?guildId=${guildId}` : "";
      const res = await fetch(`/api/admin/discord/guilds${params}`, { headers });
      const data = await res.json();
      if (res.ok && data.guilds?.length > 0) {
        setGuildConfigs(data.guilds);
        if (!selectedGuild) {
          setSelectedGuild(data.guilds[0]);
          setGuildForm(data.guilds[0]);
        }
      }
    } catch {}
  };

  const fetchAutoModRules = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    const guildId = formValues.discord_guild_id || settings?.discord_guild_id || "";
    const hasEnvGuildId = settings?._env_discord_guild_id === "set";
    if (!guildId && !hasEnvGuildId) return;
    setLoadingRules(true);
    try {
      const params = guildId ? `?guildId=${guildId}` : "";
      const res = await fetch(`/api/admin/discord/automod${params}`, { headers });
      const data = await res.json();
      if (res.ok) setAutoModRules(data.rules || []);
    } catch {}
    setLoadingRules(false);
  };

  const fetchModLogs = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    try {
      const params = new URLSearchParams();
      params.set("page", String(modPage));
      params.set("limit", "20");
      if (modFilter) params.set("actionType", modFilter);
      if (modSearch && /^\d{17,20}$/.test(modSearch)) params.set("targetId", modSearch);
      const res = await fetch(`/api/admin/discord/moderation?${params}`, { headers });
      if (res.ok) setModLogs(await res.json());
    } catch {}
  };

  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => { if (settings && activeTab === "guild") fetchGuildConfigs(); if (settings && activeTab === "automod") fetchAutoModRules(); if (settings && activeTab === "moderation") fetchModLogs(); }, [settings, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (activeTab === "moderation") fetchModLogs(); }, [modPage, modFilter, modSearch, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSetting = async (key: string) => {
    const headers = authHeaders();
    if (!headers.authorization) { showMsg("error", "Not authenticated"); return; }
    setSaving(key);
    try {
      const value = formValues[key];
      const res = await fetch("/api/admin/discord", {
        method: "PUT", headers, body: JSON.stringify({ key, value: value || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg("success", key.replace("discord_", "").replace(/_/g, " ") + " saved");
        if (settings) setSettings({ ...settings, [key]: value || null });
      } else {
        showMsg("error", data.error || "Save failed");
      }
    } catch { showMsg("error", "Connection error"); }
    setSaving(null);
  };

  const postAction = async (action: string) => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setControlling(action);
    try {
      const res = await fetch("/api/admin/discord", { method: "POST", headers, body: JSON.stringify({ action }) });
      const data = await res.json();
      showMsg(res.ok ? "success" : "error", data.message || data.error || (res.ok ? "Done" : "Failed"));
      setTimeout(fetchSettings, 2000);
    } catch { showMsg("error", "Connection error"); }
    setControlling(null);
  };

  const saveGuildConfig = async () => {
    const headers = authHeaders();
    if (!headers.authorization || !selectedGuild) return;
    setSavingGuild(true);
    try {
      const res = await fetch("/api/admin/discord/guilds", {
        method: "PUT", headers,
        body: JSON.stringify({ guildId: selectedGuild.guildId, ...guildForm }),
      });
      if (res.ok) {
        showMsg("success", "Guild config saved");
        fetchGuildConfigs();
      } else {
        const data = await res.json();
        showMsg("error", data.error || "Save failed");
      }
    } catch { showMsg("error", "Connection error"); }
    setSavingGuild(false);
  };

  const toggleAutoModRule = async (rule: AutoModRule) => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    try {
      await fetch("/api/admin/discord/automod", {
        method: "PUT", headers, body: JSON.stringify({ id: rule.id, enabled: !rule.enabled }),
      });
      fetchAutoModRules();
    } catch {}
  };

  const deleteAutoModRule = async (id: string) => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    try {
      await fetch(`/api/admin/discord/automod?id=${id}`, { method: "DELETE", headers });
      fetchAutoModRules();
      showMsg("success", "Rule deleted");
    } catch { showMsg("error", "Failed to delete rule"); }
  };

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50";
  const labelClass = "block text-sm text-[#e2e2ea] mb-1.5";

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

  function renderConfigField(key: string, label: string, placeholder: string, secret?: boolean) {
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
            <button onClick={() => setShowFields(prev => ({ ...prev, [key]: !prev[key] }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#e2e2ea]">
              {showFields[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={() => saveSetting(key)} disabled={saving === key}>
            <Save className="w-3.5 h-3.5 mr-1" /> {saving === key ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(d + "d");
    if (h > 0) parts.push(h + "h");
    if (m > 0) parts.push(m + "m");
    parts.push(s + "s");
    return parts.join(" ");
  }

  function formatDate(d: string) { return new Date(d).toLocaleString(); }

  const isOnline = settings?._bot_online === "true";
  const uptimeSeconds = settings?._bot_uptime_seconds ? parseInt(settings._bot_uptime_seconds) : 0;
  let commandCounts: Record<string, number> = {};
  try { if (settings?._bot_command_counts) commandCounts = JSON.parse(settings._bot_command_counts); } catch {}

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Home className="w-4 h-4" /> },
    { key: "config", label: "Bot Config", icon: <SettingsIcon className="w-4 h-4" /> },
    { key: "guild", label: "Guild Settings", icon: <Shield className="w-4 h-4" /> },
    { key: "automod", label: "Auto-Mod", icon: <Zap className="w-4 h-4" /> },
    { key: "welcome", label: "Welcome/Leave", icon: <DoorOpen className="w-4 h-4" /> },
    { key: "commands", label: "Commands", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "moderation", label: "Mod Logs", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8"><div className="text-center py-12 text-[#55556a]">Loading...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Discord Bot</h1>
        <p className="text-[#9090a8] text-sm">Manage Discord bot, server settings, moderation, and more</p>
      </div>

      {message && (
        <div className={"mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 " + (message.type === "success"
          ? "bg-green-500/10 text-green-300 border border-green-500/20"
          : "bg-red-500/10 text-red-300 border border-red-500/20")}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-[rgba(255,255,255,0.07)]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
              activeTab === tab.key
                ? "text-indigo-400 border-indigo-500"
                : "text-[#9090a8] border-transparent hover:text-[#e2e2ea]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Bot Status Card */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10"><Bot className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">Bot Status</h2>
                  <p className="text-xs text-[#55556a]">Service health and control panel</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#111118] rounded-lg border border-[rgba(255,255,255,0.07)] mb-4">
                <div className="flex items-center gap-3">
                  <div className={"w-3 h-3 rounded-full " + (isOnline ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-500")} />
                  <div>
                    <p className="text-sm text-[#e2e2ea] font-medium">{isOnline ? "Online" : "Offline"}</p>
                    <p className="text-xs text-[#55556a]">
                      {settings?._bot_last_heartbeat
                        ? "Last heartbeat: " + new Date(settings._bot_last_heartbeat).toLocaleString()
                        : "No heartbeat recorded"}
                    </p>
                    {isOnline && uptimeSeconds > 0 && (
                      <p className="text-xs text-green-400 mt-0.5">Uptime: {formatUptime(uptimeSeconds)}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => postAction("ping-bot")}>
                  <RefreshCw className={"w-3.5 h-3.5 mr-1 " + (controlling === "ping-bot" ? "animate-spin" : "")} /> Refresh
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => postAction("start-bot")} disabled={controlling === "start-bot" || isOnline}>
                  <Play className="w-3.5 h-3.5 mr-1" /> {controlling === "start-bot" ? "Starting..." : "Start"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => postAction("stop-bot")} disabled={controlling === "stop-bot" || !isOnline}>
                  <Square className="w-3.5 h-3.5 mr-1" /> Stop
                </Button>
                <Button size="sm" variant="outline" onClick={() => postAction("restart-bot")} disabled={controlling === "restart-bot"}>
                  <RotateCw className={"w-3.5 h-3.5 mr-1 " + (controlling === "restart-bot" ? "animate-spin" : "")} /> Restart
                </Button>
                <Button size="sm" variant="outline" onClick={() => postAction("register-commands")} disabled={controlling === "register-commands"}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> Register Commands
                </Button>
              </div>
            </div>

            {/* Command Usage */}
            {Object.keys(commandCounts).length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-indigo-500/10"><BarChart3 className="w-5 h-5 text-indigo-400" /></div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#e2e2ea]">Command Usage</h2>
                    <p className="text-xs text-[#55556a]">Slash command invocations since last restart</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {Object.entries(commandCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cmd, count]) => (
                      <div key={cmd} className="flex items-center justify-between py-1.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                        <code className="text-indigo-400 text-sm">/{cmd}</code>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: Math.max(5, (count / Math.max(...Object.values(commandCounts))) * 100) + "%" }}
                            />
                          </div>
                          <span className="text-[#e2e2ea] font-medium text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  <div className="flex items-center justify-between pt-2 text-xs text-[#55556a]">
                    <span>Total</span>
                    <span>{Object.values(commandCounts).reduce((a, b) => a + b, 0)} uses</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== CONFIG TAB ==================== */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10"><Globe className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">OAuth Configuration</h2>
                  <p className="text-xs text-[#55556a]">Discord OAuth app credentials for Sign in with Discord</p>
                </div>
              </div>
              {renderConfigField("discord_client_id", "Client ID", "123456789012345678")}
              {renderConfigField("discord_client_secret", "Client Secret", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", true)}
              <div className="border-t border-[rgba(255,255,255,0.07)] pt-4 space-y-1 text-xs">
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">DB Client ID</span>{statusBadge(!!settings?.discord_client_id)}</div>
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">DB Client Secret</span>{statusBadge(!!settings?.discord_client_secret)}</div>
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">Env DISCORD_CLIENT_ID</span>{statusBadge(settings?._env_discord_client_id === "set")}</div>
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">Env DISCORD_CLIENT_SECRET</span>{statusBadge(settings?._env_discord_client_secret === "set")}</div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10"><SettingsIcon className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">Bot Configuration</h2>
                  <p className="text-xs text-[#55556a]">Token and guild settings</p>
                </div>
              </div>
              {renderConfigField("discord_bot_token", "Bot Token", "MTJ_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", true)}
              {renderConfigField("discord_guild_id", "Guild ID", "987654321098765432")}
              <div className="border-t border-[rgba(255,255,255,0.07)] pt-4 space-y-1 text-xs">
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">DB Bot Token</span>{statusBadge(!!settings?.discord_bot_token)}</div>
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">DB Guild ID</span>{statusBadge(!!settings?.discord_guild_id)}</div>
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">Env DISCORD_BOT_TOKEN</span>{statusBadge(settings?._env_discord_bot_token === "set")}</div>
                <div className="flex justify-between py-1"><span className="text-[#9090a8]">Env DISCORD_GUILD_ID</span>{statusBadge(settings?._env_discord_guild_id === "set")}</div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10"><Bell className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">Submission Webhook</h2>
                  <p className="text-xs text-[#55556a]">Notifications for marketplace submissions</p>
                </div>
              </div>
              {renderConfigField("discord_webhook_url", "Webhook URL", "https://discord.com/api/webhooks/...")}
              <div className="flex items-center justify-between p-3 bg-[#111118] rounded-lg border border-[rgba(255,255,255,0.07)]">
                <div className="flex items-center gap-2"><Send className="w-4 h-4 text-[#55556a]" /><span className="text-sm text-[#e2e2ea]">Test webhook</span></div>
                <Button variant="outline" size="sm" onClick={() => postAction("test-webhook")} disabled={controlling === "test-webhook"}>
                  {controlling === "test-webhook" ? "Sending..." : "Send Test"}
                </Button>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10"><Shield className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">Admin Access</h2>
                  <p className="text-xs text-[#55556a]">Discord user IDs for bot admin permissions</p>
                </div>
              </div>
              {renderConfigField("discord_admin_ids", "Admin User IDs", "123456789012345678, 234567890123456789")}
            </div>
          </div>
        )}

        {/* ==================== GUILD SETTINGS TAB ==================== */}
        {activeTab === "guild" && (
          <div className="space-y-6">
            {guildConfigs.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <p className="text-[#55556a]">
                  {settings?._env_discord_guild_id === "set"
                    ? "No guild configs found. The bot will create them automatically when /guild commands are used."
                    : "Configure guild ID in Bot Config tab or set DISCORD_GUILD_ID in .env to view guild settings."}
                </p>
              </div>
            ) : (
              <>
                {guildConfigs.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {guildConfigs.map(gc => (
                      <Button
                        key={gc.guildId}
                        size="sm"
                        variant={selectedGuild?.guildId === gc.guildId ? "primary" : "outline"}
                        onClick={() => { setSelectedGuild(gc); setGuildForm(gc); }}
                      >
                        {gc.guildName || gc.guildId}
                      </Button>
                    ))}
                  </div>
                )}

                {selectedGuild && (
                  <div className="glass-card p-6">
                    <div className="flex items-start gap-3 mb-5">
                      <div className="p-2 rounded-lg bg-indigo-500/10"><Shield className="w-5 h-5 text-indigo-400" /></div>
                      <div>
                        <h2 className="text-lg font-semibold text-[#e2e2ea]">
                          {selectedGuild.guildName || selectedGuild.guildId}
                        </h2>
                        <p className="text-xs text-[#55556a]">Server configuration</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Log Channel ID", key: "logChannelId", placeholder: "Channel ID for moderation logs" },
                        { label: "Mod Role ID", key: "modRoleId", placeholder: "Role ID for moderators" },
                        { label: "Admin Role ID", key: "adminRoleId", placeholder: "Role ID for admins" },
                        { label: "Announcement Channel ID", key: "announcementChannelId", placeholder: "Channel for /announce default" },
                        { label: "Ticket Category ID", key: "ticketCategoryId", placeholder: "Category for ticket channels" },
                        { label: "Ticket Log Channel ID", key: "ticketLogChannelId", placeholder: "Channel for ticket logs" },
                        { label: "Ticket Staff Role ID", key: "ticketStaffRoleId", placeholder: "Role for ticket staff" },
                        { label: "Welcome Channel ID", key: "welcomeChannelId", placeholder: "Channel for welcome messages" },
                        { label: "Leave Channel ID", key: "leaveChannelId", placeholder: "Channel for leave messages" },
                      ].map(f => {
                        const fieldKey = f.key as keyof GuildConfig;
                        return (
                        <div key={f.key}>
                          <label className={labelClass}>{f.label}</label>
                          <input
                            type="text"
                            value={String(guildForm[fieldKey] || "")}
                            onChange={e => setGuildForm(prev => ({ ...prev, [f.key]: e.target.value || null }))}
                            className={inputClass}
                            placeholder={f.placeholder}
                          />
                        </div>
                        );
                      })}
                      <div>
                        <label className={labelClass}>Max Warns Before Ban</label>
                        <input
                          type="number"
                          value={guildForm.maxWarnsBeforeBan || 3}
                          onChange={e => setGuildForm(prev => ({ ...prev, maxWarnsBeforeBan: parseInt(e.target.value) || 0 }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Default Slowmode (seconds)</label>
                        <input
                          type="number"
                          value={guildForm.slowmodeDefault || 0}
                          onChange={e => setGuildForm(prev => ({ ...prev, slowmodeDefault: parseInt(e.target.value) || 0 }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Starboard Threshold</label>
                        <input
                          type="number"
                          value={guildForm.starboardThreshold || 3}
                          onChange={e => setGuildForm(prev => ({ ...prev, starboardThreshold: parseInt(e.target.value) || 3 }))}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button size="sm" onClick={saveGuildConfig} disabled={savingGuild}>
                        <Save className="w-3.5 h-3.5 mr-1" /> {savingGuild ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================== AUTO-MOD TAB ==================== */}
        {activeTab === "automod" && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10"><Zap className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">Auto-Mod Rules</h2>
                  <p className="text-xs text-[#55556a]">Automatically detect and act on problematic content</p>
                </div>
              </div>

              {!formValues.discord_guild_id && !settings?.discord_guild_id && settings?._env_discord_guild_id !== "set" ? (
                <p className="text-[#55556a] text-sm">Set Guild ID in Bot Config tab or DISCORD_GUILD_ID in .env to manage auto-mod rules.</p>
              ) : loadingRules ? (
                <p className="text-[#55556a]">Loading...</p>
              ) : autoModRules.length === 0 ? (
                <p className="text-[#55556a] text-sm">No auto-mod rules configured. Use Discord slash commands or the API to create rules.</p>
              ) : (
                <div className="space-y-2">
                  {autoModRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-[#111118] rounded-lg border border-[rgba(255,255,255,0.07)]">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleAutoModRule(rule)}>
                          {rule.enabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-[#55556a]" />}
                        </button>
                        <div>
                          <p className="text-sm text-[#e2e2ea] font-medium">{rule.name}</p>
                          <p className="text-xs text-[#55556a]">
                            {rule.type.replace(/_/g, " ")} · Action: {rule.action.toUpperCase()}
                            {rule.duration && rule.action === "mute" ? ` (${rule.duration}m)` : ""}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteAutoModRule(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 bg-[#111118] rounded-lg border border-[rgba(255,255,255,0.07)]">
                <p className="text-xs text-[#55556a]">
                  Auto-mod rules can be created via Discord using <code className="text-indigo-400">/automod create</code> or via the <Link href="/admin/discord/automod" className="text-indigo-400">Auto-Mod Rules API</Link>.
                  Available rule types: keyword_filter, invite_filter, spam_filter, link_filter, mention_limit, caps_filter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== WELCOME/LEAVE TAB ==================== */}
        {activeTab === "welcome" && (
          <div className="space-y-6">
            {selectedGuild ? (
              <>
                <div className="glass-card p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-green-500/10"><DoorOpen className="w-5 h-5 text-green-400" /></div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#e2e2ea]">Welcome Messages</h2>
                      <p className="text-xs text-[#55556a]">Greet new members when they join the server</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#e2e2ea]">Enable Welcome Messages</label>
                      <button onClick={() => setGuildForm(prev => ({ ...prev, welcomeEnabled: !prev.welcomeEnabled }))}>
                        {guildForm.welcomeEnabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-[#55556a]" />}
                      </button>
                    </div>
                    <div>
                      <label className={labelClass}>Welcome Message</label>
                      <textarea
                        value={guildForm.welcomeMessage || ""}
                        onChange={e => setGuildForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                        className={inputClass + " h-24 resize-y"}
                        placeholder="Welcome {user} to {server}! Available variables: {user}, {user_tag}, {user_name}, {server}, {member_count}"
                      />
                    </div>
                    <Button size="sm" onClick={saveGuildConfig} disabled={savingGuild}>
                      <Save className="w-3.5 h-3.5 mr-1" /> Save Welcome Settings
                    </Button>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-red-500/10"><DoorOpen className="w-5 h-5 text-red-400 rotate-180" /></div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#e2e2ea]">Leave Messages</h2>
                      <p className="text-xs text-[#55556a]">Notify when members leave the server</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#e2e2ea]">Enable Leave Messages</label>
                      <button onClick={() => setGuildForm(prev => ({ ...prev, leaveEnabled: !prev.leaveEnabled }))}>
                        {guildForm.leaveEnabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-[#55556a]" />}
                      </button>
                    </div>
                    <div>
                      <label className={labelClass}>Leave Message</label>
                      <textarea
                        value={guildForm.leaveMessage || ""}
                        onChange={e => setGuildForm(prev => ({ ...prev, leaveMessage: e.target.value }))}
                        className={inputClass + " h-24 resize-y"}
                        placeholder="{user_tag} has left the server. Variables: {user_tag}, {user_name}, {server}, {member_count}"
                      />
                    </div>
                    <Button size="sm" onClick={saveGuildConfig} disabled={savingGuild}>
                      <Save className="w-3.5 h-3.5 mr-1" /> Save Leave Settings
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-[#55556a]">Go to the Guild Settings tab and configure a guild first.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== COMMANDS TAB ==================== */}
        {activeTab === "commands" && (
          <div className="glass-card p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 rounded-lg bg-indigo-500/10"><MessageSquare className="w-5 h-5 text-indigo-400" /></div>
              <div>
                <h2 className="text-lg font-semibold text-[#e2e2ea]">Bot Commands Reference</h2>
                <p className="text-xs text-[#55556a]">All available Discord slash commands</p>
              </div>
            </div>

            <div className="text-sm text-[#55556a] space-y-4">
              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Marketplace</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/stats</code><span>Show marketplace statistics</span>
                  <code className="text-indigo-400">/plugin search &lt;query&gt;</code><span>Search plugins</span>
                  <code className="text-indigo-400">/plugin info &lt;name|id&gt;</code><span>Plugin details</span>
                  <code className="text-indigo-400">/agent search &lt;query&gt;</code><span>Search agent configs</span>
                  <code className="text-indigo-400">/agent info &lt;name|id&gt;</code><span>Agent details</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Review</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/review list</code><span>Pending submissions (admin)</span>
                  <code className="text-indigo-400">/review approve &lt;id&gt;</code><span>Approve submission</span>
                  <code className="text-indigo-400">/review reject &lt;id&gt; &lt;reason&gt;</code><span>Reject submission</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Moderation (Mod/Admin)</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/warn &lt;user&gt; [reason]</code><span>Warn a user</span>
                  <code className="text-indigo-400">/mute &lt;user&gt; [duration] [reason]</code><span>Timeout user</span>
                  <code className="text-indigo-400">/unmute &lt;user&gt; [reason]</code><span>Remove timeout</span>
                  <code className="text-indigo-400">/kick &lt;user&gt; [reason]</code><span>Kick user</span>
                  <code className="text-indigo-400">/ban &lt;user&gt; [reason] [days]</code><span>Ban user</span>
                  <code className="text-indigo-400">/unban &lt;user_id&gt; [reason]</code><span>Unban by ID</span>
                  <code className="text-indigo-400">/purge &lt;count&gt; [user]</code><span>Bulk delete messages</span>
                  <code className="text-indigo-400">/modlogs [user] [action]</code><span>View moderation logs</span>
                  <code className="text-indigo-400">/slowmode [duration] [channel]</code><span>Set slowmode</span>
                  <code className="text-indigo-400">/lockdown [channel] [reason]</code><span>Lock channel</span>
                  <code className="text-indigo-400">/unlock [channel]</code><span>Unlock channel</span>
                  <code className="text-indigo-400">/nickname &lt;user&gt; &lt;name&gt; [reason]</code><span>Change nickname</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Role Management (Mod/Admin)</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/role create &lt;name&gt; [color]</code><span>Create a role</span>
                  <code className="text-indigo-400">/role delete &lt;role&gt;</code><span>Delete a role</span>
                  <code className="text-indigo-400">/role edit &lt;role&gt; [name] [color]</code><span>Edit a role</span>
                  <code className="text-indigo-400">/role assign &lt;user&gt; &lt;role&gt;</code><span>Toggle role on user</span>
                  <code className="text-indigo-400">/role list</code><span>List all roles</span>
                  <code className="text-indigo-400">/role info &lt;role&gt;</code><span>Role details</span>
                  <code className="text-indigo-400">/role mass &lt;role&gt; &lt;add|remove&gt;</code><span>Mass assign/remove</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Channel Management (Mod/Admin)</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/channel create &lt;name&gt; [type]</code><span>Create channel</span>
                  <code className="text-indigo-400">/channel delete &lt;channel&gt;</code><span>Delete channel</span>
                  <code className="text-indigo-400">/channel edit &lt;channel&gt; [name]</code><span>Edit channel</span>
                  <code className="text-indigo-400">/channel info &lt;channel&gt;</code><span>Channel details</span>
                  <code className="text-indigo-400">/channel list</code><span>List all channels</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Messaging &amp; Utilities</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/announce &lt;channel&gt; &lt;message&gt;</code><span>Send announcement</span>
                  <code className="text-indigo-400">/embed &lt;channel&gt; [title]</code><span>Send custom embed</span>
                  <code className="text-indigo-400">/say [channel] &lt;message&gt;</code><span>Bot says message</span>
                  <code className="text-indigo-400">/poll create &lt;channel&gt; &lt;title&gt;</code><span>Create poll</span>
                  <code className="text-indigo-400">/poll end &lt;id&gt;</code><span>End poll &amp; show results</span>
                  <code className="text-indigo-400">/reactionrole create</code><span>Create reaction role</span>
                  <code className="text-indigo-400">/reactionrole panel</code><span>Send reaction role panel</span>
                  <code className="text-indigo-400">/reactionrole list</code><span>List reaction roles</span>
                  <code className="text-indigo-400">/reactionrole delete &lt;id&gt;</code><span>Delete reaction role</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Ticketing</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/ticket create &lt;subject&gt; [priority]</code><span>Create support ticket</span>
                  <code className="text-indigo-400">/ticket close [reason]</code><span>Close ticket (mod)</span>
                  <code className="text-indigo-400">/ticket claim</code><span>Claim ticket (mod)</span>
                  <code className="text-indigo-400">/ticket add &lt;user&gt;</code><span>Add user to ticket (mod)</span>
                  <code className="text-indigo-400">/ticket remove &lt;user&gt;</code><span>Remove user from ticket (mod)</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-[#e2e2ea] mb-1.5">Information</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <code className="text-indigo-400">/guild info</code><span>Server information</span>
                  <code className="text-indigo-400">/guild settings view|set</code><span>Guild settings</span>
                  <code className="text-indigo-400">/user [user]</code><span>User information</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODERATION LOGS TAB ==================== */}
        {activeTab === "moderation" && (
          <div>
            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10"><ShieldAlert className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">Moderation Logs</h2>
                  <p className="text-xs text-[#55556a]">Complete moderation history across servers</p>
                </div>
              </div>

              {modLogs?.actionCounts && Object.keys(modLogs.actionCounts).length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {Object.entries(modLogs.actionCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111118] border border-[rgba(255,255,255,0.07)] text-xs">
                      <span className="text-[#e2e2ea]">{type.toUpperCase()}</span>
                      <span className="text-indigo-400 font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" />
                  <input
                    type="text" placeholder="Search by User ID..."
                    value={modSearch} onChange={e => { setModSearch(e.target.value); setModPage(1); }}
                    className="w-full pl-9 pr-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <select
                  value={modFilter} onChange={e => { setModFilter(e.target.value); setModPage(1); }}
                  className="px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]">
                  <option value="">All Actions</option>
                  {["warn","mute","unmute","kick","ban","unban","purge","lockdown","unlock","role_assign","role_remove","nickname"].map(a => (
                    <option key={a} value={a}>{a.replace(/_/g, " ").toUpperCase()}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={fetchModLogs}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
              </div>

              {modLogs && modLogs.logs.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.07)]">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0a0a0f] text-[#9090a8] text-xs uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Action</th>
                          <th className="px-3 py-2 text-left">Target</th>
                          <th className="px-3 py-2 text-left">Moderator</th>
                          <th className="px-3 py-2 text-left">Reason</th>
                          <th className="px-3 py-2 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                        {modLogs.logs.map(log => {
                          const colors: Record<string, string> = {
                            warn: "bg-amber-500/10 text-amber-400",
                            mute: "bg-orange-500/10 text-orange-400",
                            unmute: "bg-emerald-500/10 text-emerald-400",
                            kick: "bg-red-500/10 text-red-400",
                            ban: "bg-red-600/10 text-red-500",
                            unban: "bg-emerald-500/10 text-emerald-400",
                            purge: "bg-purple-500/10 text-purple-400",
                            lockdown: "bg-red-500/10 text-red-400",
                            unlock: "bg-emerald-500/10 text-emerald-400",
                            nickname: "bg-blue-500/10 text-blue-400",
                            role_assign: "bg-green-500/10 text-green-400",
                            role_remove: "bg-orange-500/10 text-orange-400",
                          };
                          const c = colors[log.actionType] || "bg-gray-500/10 text-gray-400";
                          return (
                            <tr key={log.id} className="hover:bg-[#111118]/50">
                              <td className="px-3 py-2">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs ${c}`}>
                                  {log.actionType.replace(/_/g, " ").toUpperCase()}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-[#e2e2ea] text-xs font-medium">{log.targetTag}</div>
                                <div className="text-[#55556a] text-xs font-mono">{log.targetId}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-[#e2e2ea] text-xs">{log.moderatorTag}</div>
                              </td>
                              <td className="px-3 py-2 text-[#9090a8] text-xs max-w-[150px] truncate">
                                {log.reason || "—"}
                              </td>
                              <td className="px-3 py-2 text-right text-[#55556a] text-xs whitespace-nowrap">
                                {formatDate(log.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {modLogs.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-[#55556a]">
                        {(modLogs.page - 1) * 20 + 1}–{Math.min(modLogs.page * 20, modLogs.total)} of {modLogs.total}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled={modPage <= 1} onClick={() => setModPage(p => p - 1)}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 text-[#9090a8]">{modPage}/{modLogs.totalPages}</span>
                        <Button variant="outline" size="sm" disabled={modPage >= modLogs.totalPages} onClick={() => setModPage(p => p + 1)}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-[#55556a]">No moderation logs found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
