"use client";

import { useEffect, useState, useCallback } from "react";
import { Send, Trash2, Users, Megaphone, AlertCircle, CheckCircle, XCircle, RefreshCw, Upload, Plus, Eye, EyeOff, Monitor, Pencil, FlaskConical, BarChart3, Download, TrendingUp, Percent, MousePointerClick, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Subscriber = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
};

type FilterCriteria = {
  subscribedAfter?: string;
  subscribedBefore?: string;
  createdAfter?: string;
  createdBefore?: string;
};

type Campaign = {
  id: string;
  subject: string;
  status: string;
  filterCriteria: string | null;
  scheduledAt: string | null;
  sentCount: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  sentAt: string | null;
  createdAt: string;
};

type Automation = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  trigger: string;
  subject: string;
  content: string;
  delayMinutes: number;
  isActive: boolean;
  sortOrder: number;
  filterCriteria: string | null;
  sendCount: number;
  lastSentAt: string | null;
  createdAt: string;
};

type Tab = "subscribers" | "campaigns" | "automations" | "analytics";

export default function AdminNewsletterPage() {
  const [tab, setTab] = useState<Tab>("subscribers");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (type: "success" | "error", text: unknown) => {
    const safeText = typeof text === "string" ? text : String(text);
    setMessage({ type, text: safeText });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Newsletter</h1>
        <p className="text-[#9090a8] text-sm">Manage subscribers and send email campaigns</p>
      </div>

      {message && (
        <div className={"mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 " + (message.type === "success"
          ? "bg-green-500/10 text-green-300 border border-green-500/20"
          : "bg-red-500/10 text-red-300 border border-red-500/20")}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {String(message.text)}
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-[#0a0a0f] rounded-lg p-1 border border-[rgba(255,255,255,0.07)] w-fit">
        <button
          onClick={() => setTab("subscribers")}
          className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " +
            (tab === "subscribers" ? "bg-indigo-500/20 text-indigo-300" : "text-[#9090a8] hover:text-[#e2e2ea]")}
        >
          <Users className="w-4 h-4 inline mr-1.5" /> Subscribers
        </button>
        <button
          onClick={() => setTab("campaigns")}
          className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " +
            (tab === "campaigns" ? "bg-indigo-500/20 text-indigo-300" : "text-[#9090a8] hover:text-[#e2e2ea]")}
        >
          <Megaphone className="w-4 h-4 inline mr-1.5" /> Campaigns
        </button>
        <button
          onClick={() => setTab("automations")}
          className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " +
            (tab === "automations" ? "bg-indigo-500/20 text-indigo-300" : "text-[#9090a8] hover:text-[#e2e2ea]")}
        >
          <RefreshCw className="w-4 h-4 inline mr-1.5" /> Automations
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " +
            (tab === "analytics" ? "bg-indigo-500/20 text-indigo-300" : "text-[#9090a8] hover:text-[#e2e2ea]")}
        >
          <BarChart3 className="w-4 h-4 inline mr-1.5" /> Analytics
        </button>
      </div>

      {tab === "subscribers" ? <SubscribersPanel showMsg={showMsg} /> : tab === "campaigns" ? <CampaignsPanel showMsg={showMsg} /> : tab === "automations" ? <AutomationsPanel showMsg={showMsg} /> : <AnalyticsPanel showMsg={showMsg} />}
    </div>
  );
}

function SubscribersPanel({ showMsg }: { showMsg: (type: "success" | "error", text: string) => void }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchSubscribers = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/newsletter/subscribers?${params}`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        setSubscribers(data.subscribers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => showMsg("error", "Failed to load subscribers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubscribers(); }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchSubscribers();
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showMsg("success", "Subscriber deleted");
        fetchSubscribers();
      } else {
        const data = await res.json();
        showMsg("error", data.error || "Failed to delete");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const handleSubscriberAction = async (action: string, id?: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ...(id ? { id } : {}) }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === "activate_all_pending") {
          showMsg("success", `Activated ${data.activated} subscribers`);
        } else if (action === "resend_verification") {
          showMsg("success", "Verification email sent");
        } else {
          showMsg("success", "Subscriber activated");
        }
        fetchSubscribers();
      } else {
        showMsg("error", data.error || "Failed");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const handleImport = async () => {
    const emails = importText
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e.length > 3);
    if (emails.length === 0) {
      showMsg("error", "No entries found");
      return;
    }
    setImporting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ emails }),
      });
      const data = await res.json();
      if (res.ok) {
        const invalid = data.rawTotal ? data.rawTotal - data.total : 0;
        let msg = `Imported ${data.created} subscribers (${data.skipped} skipped)`;
        if (data.updated > 0) msg += `, ${data.updated} updated`;
        if (invalid > 0) msg += ` — ${invalid} invalid entries ignored`;
        showMsg("success", msg);
        setShowImport(false);
        setImportText("");
        fetchSubscribers();
      } else {
        showMsg("error", data.error || "Failed to import");
      }
    } catch {
      showMsg("error", "Connection error");
    }
    setImporting(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-300 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      case "unsubscribed": return "bg-red-500/10 text-red-300 border-red-500/20";
      default: return "bg-[#18181f] text-[#9090a8] border-[rgba(255,255,255,0.07)]";
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search by email..."
            className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
          />
          <Button onClick={handleSearch} size="sm" variant="secondary">Search</Button>
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <Button onClick={() => setShowImport(true)} size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-1.5" /> Import
        </Button>
        <Button onClick={() => fetchSubscribers()} size="sm" variant="ghost">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {showImport && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#e2e2ea]">Import Subscribers</h3>
            <button onClick={() => { setShowImport(false); setImportText(""); }} className="text-[#55556a] hover:text-[#e2e2ea]">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#9090a8] mb-1">
                Email addresses (one per line, comma/semicolon separated, or Name &lt;email&gt; format)
              </label>
              <p className="text-xs text-[#55556a] mb-2">Imported subscribers are added as active immediately — no verification required.</p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="user1@example.com&#10;User Two &lt;user2@example.com&gt;&#10;user3@example.com"
                rows={8}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50 font-mono resize-y"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={importing || !importText.trim()}>
                <Plus className="w-4 h-4 mr-1.5" /> {importing ? "Importing..." : "Import"}
              </Button>
              <Button onClick={() => { setShowImport(false); setImportText(""); }} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between text-xs text-[#55556a]">
          <span>{total} subscriber{total !== 1 ? "s" : ""}</span>
          {statusFilter === "pending" && total > 0 && (
            <button
              onClick={() => handleSubscriberAction("activate_all_pending")}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Activate all pending →
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-center py-12 text-[#55556a]">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12 text-[#55556a]">No subscribers found</div>
        ) : (
          <>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {subscribers.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-[#e2e2ea] font-medium">
                      {s.firstName || s.lastName ? `${s.firstName || ""} ${s.lastName || ""}`.trim() : s.email}
                    </p>
                    <p className="text-xs text-[#55556a]">
                      {s.email}
                      {s.subscribedAt
                        ? ` · Subscribed ${new Date(s.subscribedAt).toLocaleDateString()}`
                        : ` · Created ${new Date(s.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={"inline-flex items-center px-2 py-0.5 text-xs rounded-full border " + statusColor(s.status)}>
                      {s.status}
                    </span>
                    {s.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleSubscriberAction("activate", s.id)}
                          className="text-xs text-green-400 hover:text-green-300 transition-colors"
                          title="Activate subscriber"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleSubscriberAction("resend_verification", s.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          title="Resend verification email"
                        >
                          Resend verify
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded text-[#55556a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete subscriber"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="p-3 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                  Prev
                </Button>
                <span className="text-xs text-[#55556a]">{page} / {totalPages}</span>
                <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CampaignsPanel({ showMsg }: { showMsg: (type: "success" | "error", text: string) => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [subCount, setSubCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSubscribedAfter, setFilterSubscribedAfter] = useState("");
  const [filterSubscribedBefore, setFilterSubscribedBefore] = useState("");
  const [filterCreatedAfter, setFilterCreatedAfter] = useState("");
  const [filterCreatedBefore, setFilterCreatedBefore] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [recipientTotal, setRecipientTotal] = useState(0);
  const [scheduledAt, setScheduledAt] = useState("");

  const buildFilterCriteria = useCallback((): FilterCriteria | undefined => {
    const fc: FilterCriteria = {};
    if (filterSubscribedAfter) fc.subscribedAfter = new Date(filterSubscribedAfter).toISOString();
    if (filterSubscribedBefore) fc.subscribedBefore = new Date(filterSubscribedBefore + "T23:59:59.999Z").toISOString();
    if (filterCreatedAfter) fc.createdAfter = new Date(filterCreatedAfter).toISOString();
    if (filterCreatedBefore) fc.createdBefore = new Date(filterCreatedBefore + "T23:59:59.999Z").toISOString();
    return Object.keys(fc).length > 0 ? fc : undefined;
  }, [filterSubscribedAfter, filterSubscribedBefore, filterCreatedAfter, filterCreatedBefore]);

  const hasFilters = () => filterSubscribedAfter || filterSubscribedBefore || filterCreatedAfter || filterCreatedBefore;

  const setFilterPreset = (days: number | null) => {
    setFilterSubscribedBefore("");
    setFilterCreatedAfter("");
    setFilterCreatedBefore("");
    if (days === null) {
      setFilterSubscribedAfter("");
    } else {
      const d = new Date();
      d.setDate(d.getDate() - days);
      setFilterSubscribedAfter(d.toISOString().slice(0, 10));
    }
  };

  const isPresetActive = (days: number | null): boolean => {
    if (days === null) return !hasFilters();
    if (filterSubscribedBefore || filterCreatedAfter || filterCreatedBefore) return false;
    if (!filterSubscribedAfter) return false;
    const d = new Date();
    d.setDate(d.getDate() - days);
    const presetDate = d.toISOString().slice(0, 10);
    return filterSubscribedAfter === presetDate;
  };

  useEffect(() => {
    const criteria = buildFilterCriteria();
    const token = localStorage.getItem("token");
    fetch("/api/admin/newsletter/campaigns/count-recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ filterCriteria: criteria }),
    })
      .then(async r => {
        const data = await r.json();
        if (r.ok) {
          setRecipientCount(data.matching);
          setRecipientTotal(data.totalActive);
        } else {
          setRecipientCount(null);
        }
      })
      .catch(() => setRecipientCount(null));
  }, [buildFilterCriteria]);

  const loadFilterCriteria = (criteria: string | null) => {
    setFilterSubscribedAfter("");
    setFilterSubscribedBefore("");
    setFilterCreatedAfter("");
    setFilterCreatedBefore("");
    if (!criteria) return;
    try {
      const fc = JSON.parse(criteria) as FilterCriteria;
      if (fc.subscribedAfter) setFilterSubscribedAfter(fc.subscribedAfter.slice(0, 10));
      if (fc.subscribedBefore) setFilterSubscribedBefore(fc.subscribedBefore.slice(0, 10));
      if (fc.createdAfter) setFilterCreatedAfter(fc.createdAfter.slice(0, 10));
      if (fc.createdBefore) setFilterCreatedBefore(fc.createdBefore.slice(0, 10));
    } catch {
      // ignore
    }
  };

  const fetchCampaigns = useCallback((p = 1) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`/api/admin/newsletter/campaigns?page=${p}&limit=20`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setCampaigns(data.campaigns);
        setTotalPages(data.totalPages);
      })
      .catch(() => showMsg("error", "Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, [showMsg]);

  useEffect(() => {
    fetchCampaigns(page);
  }, [page, fetchCampaigns]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/newsletter/subscribers?status=active&limit=1", {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(async r => {
        const data = await r.json();
        if (r.ok) setSubCount(data.total);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      fetch("/api/admin/newsletter/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: subject || "(no subject)", content: content || "<p></p>" }),
      })
        .then(async r => {
          const data = await r.json();
          if (r.ok) setPreviewHtml(data.html);
        })
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [subject, content, showForm]);

  const handleSave = async () => {
    if (!subject || !content) { showMsg("error", "Subject and content are required"); return; }
    const token = localStorage.getItem("token");
    try {
      const url = editingId
        ? `/api/admin/newsletter/campaigns/${editingId}`
        : "/api/admin/newsletter/campaigns";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, content, filterCriteria: buildFilterCriteria(), scheduledAt: scheduledAt || null }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", editingId ? "Campaign updated" : "Campaign draft created");
        setShowForm(false);
        setEditingId(null);
        setSubject("");
        setContent("");
        setPreviewHtml("");
        setShowPreview(false);
        fetchCampaigns();
      } else {
        showMsg("error", data.error || "Failed to save");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const handleEdit = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.campaign) {
        setEditingId(id);
        setSubject(data.campaign.subject);
        setContent(data.campaign.content);
        loadFilterCriteria(data.campaign.filterCriteria);
        setShowForm(true);
        setShowPreview(true);
        setShowFilters(!!data.campaign.filterCriteria);
      } else {
        showMsg("error", data.error || "Failed to load campaign");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const handlePreview = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.campaign) {
        const previewRes = await fetch("/api/admin/newsletter/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify({ subject: data.campaign.subject, content: data.campaign.content }),
        });
        const previewData = await previewRes.json();
        if (previewRes.ok) {
          setPreviewHtml(previewData.html);
          setPreviewCampaign(data.campaign);
          setShowPreview(true);
        }
      } else {
        showMsg("error", data.error || "Failed to load campaign");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSubject("");
    setContent("");
    setPreviewHtml("");
    setShowPreview(false);
    setShowFilters(false);
    setFilterSubscribedAfter("");
    setFilterSubscribedBefore("");
    setFilterCreatedAfter("");
    setFilterCreatedBefore("");
    setRecipientCount(null);
    setScheduledAt("");
    setPreviewCampaign(null);
  };

  const handleSend = async (id: string) => {
    setSending(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}/send`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", data.message || "Campaign send started");
        fetchCampaigns();
      } else {
        showMsg("error", data.error || "Failed to send");
        setSending(null);
      }
    } catch {
      showMsg("error", "Connection error");
      setSending(null);
    }
  };

  useEffect(() => {
    if (!sending) return;
    const interval = setInterval(() => {
      fetch(`/api/admin/newsletter/campaigns/${sending}`, {
        headers: { authorization: localStorage.getItem("token") || "" },
      })
        .then(async r => {
          const data = await r.json();
          if (data.campaign && data.campaign.status !== "sending") {
            setSending(null);
            fetchCampaigns();
            showMsg(
              data.campaign.status === "sent" ? "success" : "error",
              data.campaign.status === "sent"
                ? `Campaign sent! ${data.campaign.sentCount} delivered`
                : "Campaign send encountered an error"
            );
          }
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [sending, fetchCampaigns, showMsg]);

  const handleTestSend = async (id: string) => {
    const email = window.prompt("Send test email to:");
    if (!email) return;
    setSending(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", data.message || "Test email sent");
      } else {
        showMsg("error", data.error || "Failed to send test");
      }
    } catch {
      showMsg("error", "Connection error");
    }
    setSending(null);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showMsg("success", "Campaign deleted");
        fetchCampaigns();
      } else {
        const data = await res.json();
        showMsg("error", data.error || "Failed to delete");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-500/10 text-green-300 border-green-500/20";
      case "sending": return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      case "scheduled": return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      case "error": return "bg-red-500/10 text-red-300 border-red-500/20";
      case "draft": return "bg-[#18181f] text-[#9090a8] border-[rgba(255,255,255,0.07)]";
      default: return "bg-[#18181f] text-[#9090a8] border-[rgba(255,255,255,0.07)]";
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#55556a]">{subCount} active subscriber{subCount !== 1 ? "s" : ""}</p>
        {!showForm && (
          <Button onClick={() => { setEditingId(null); setShowForm(true); loadFilterCriteria(null); }} size="sm">
            <Megaphone className="w-4 h-4 mr-1.5" /> New Campaign
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[#e2e2ea]">{editingId ? "Edit Campaign" : "New Campaign"}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={"p-2 rounded-lg border text-xs transition-colors " + (showPreview
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                  : "border-[rgba(255,255,255,0.07)] text-[#9090a8] hover:text-[#e2e2ea]")}
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={closeForm} className="p-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-[#9090a8] hover:text-[#e2e2ea] transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={`grid ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-4`}>
            {/* Editor pane */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-[#9090a8]">Subject</label>
                  <span className={"text-xs " + (subject.length > 180 ? "text-yellow-400" : "text-[#55556a]")}>
                    {subject.length}/200
                  </span>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What's new in CortexPrism..."
                  maxLength={200}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-[#9090a8]">Content</label>
                  <span className={"text-xs " + (content.length > 95000 ? "text-yellow-400" : "text-[#55556a]")}>
                    {content.length}/100,000
                  </span>
                </div>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your newsletter..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave}>
                  <Send className="w-4 h-4 mr-1.5" /> {editingId ? "Update Draft" : "Save Draft"}
                </Button>
                <Button onClick={closeForm} variant="ghost">
                  Cancel
                </Button>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.05)] pt-4 mt-2">
                <label className="text-sm font-medium text-[#9090a8] mb-2 block">Schedule Send (optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                  />
                  {scheduledAt && (
                    <button
                      onClick={() => setScheduledAt("")}
                      className="p-2 rounded text-[#55556a] hover:text-[#e2e2ea] transition-colors"
                      title="Clear schedule"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#55556a] mt-1">
                  {scheduledAt
                    ? `Campaign will be sent on ${new Date(scheduledAt).toLocaleString()}`
                    : "Leave empty to save as draft (send manually later)"}
                </p>
              </div>
            </div>

            {/* Preview pane */}
            {showPreview && (
              <div className="glass-card overflow-hidden">
                <div className="p-3 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#55556a]" />
                  <span className="text-xs font-medium text-[#9090a8]">Live Preview</span>
                  <span className="text-xs text-[#55556a]">— updates as you type</span>
                </div>
                <div className="bg-[#050508]">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-0"
                      style={{ height: "600px" }}
                      title="Email preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-[#55556a] text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-[#55556a] border-t-transparent animate-spin" />
                        Rendering preview...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recipient targeting */}
          <div className="glass-card p-6 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-[#e2e2ea] w-full text-left"
            >
              <Filter className="w-4 h-4 text-indigo-400" />
              Recipient Targeting
              {hasFilters() && recipientCount !== null && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300">
                  {recipientCount} of {recipientTotal} match
                </span>
              )}
              <span className="ml-auto text-[#55556a]">
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {showFilters && (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-[#55556a]">
                  Narrow down which active subscribers receive this campaign. Leave fields empty to include all.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterPreset(null)}
                    className={"px-3 py-1.5 text-xs rounded-md border transition-colors " +
                      (isPresetActive(null) ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" : "border-[rgba(255,255,255,0.07)] text-[#9090a8] hover:text-[#e2e2ea]")}
                  >
                    All subscribers
                  </button>
                  <button
                    onClick={() => setFilterPreset(7)}
                    className={"px-3 py-1.5 text-xs rounded-md border transition-colors " +
                      (isPresetActive(7) ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" : "border-[rgba(255,255,255,0.07)] text-[#9090a8] hover:text-[#e2e2ea]")}
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => setFilterPreset(30)}
                    className={"px-3 py-1.5 text-xs rounded-md border transition-colors " +
                      (isPresetActive(30) ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" : "border-[rgba(255,255,255,0.07)] text-[#9090a8] hover:text-[#e2e2ea]")}
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => setFilterPreset(90)}
                    className={"px-3 py-1.5 text-xs rounded-md border transition-colors " +
                      (isPresetActive(90) ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" : "border-[rgba(255,255,255,0.07)] text-[#9090a8] hover:text-[#e2e2ea]")}
                  >
                    Last 90 days
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#0a0a0f] rounded-lg border border-[rgba(255,255,255,0.05)]">
                  <div>
                    <label className="block text-xs font-medium text-[#9090a8] mb-1">Subscribed after</label>
                    <input
                      type="date"
                      value={filterSubscribedAfter}
                      onChange={e => setFilterSubscribedAfter(e.target.value)}
                      className="w-full px-3 py-2 bg-[#050508] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                    />
                    <p className="text-[10px] text-[#55556a] mt-0.5">Filter by subscription date</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9090a8] mb-1">Subscribed before</label>
                    <input
                      type="date"
                      value={filterSubscribedBefore}
                      onChange={e => setFilterSubscribedBefore(e.target.value)}
                      className="w-full px-3 py-2 bg-[#050508] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                    />
                    <p className="text-[10px] text-[#55556a] mt-0.5">Filter by subscription date</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9090a8] mb-1">Created after</label>
                    <input
                      type="date"
                      value={filterCreatedAfter}
                      onChange={e => setFilterCreatedAfter(e.target.value)}
                      className="w-full px-3 py-2 bg-[#050508] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                    />
                    <p className="text-[10px] text-[#55556a] mt-0.5">Filter by record creation date</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9090a8] mb-1">Created before</label>
                    <input
                      type="date"
                      value={filterCreatedBefore}
                      onChange={e => setFilterCreatedBefore(e.target.value)}
                      className="w-full px-3 py-2 bg-[#050508] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                    />
                    <p className="text-[10px] text-[#55556a] mt-0.5">Filter by record creation date</p>
                  </div>
                </div>

                {recipientCount !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-[#e2e2ea] font-medium">{recipientCount}</span>
                    <span className="text-[#55556a]">of</span>
                    <span className="text-[#9090a8]">{recipientTotal}</span>
                    <span className="text-[#55556a]">active subscribers match</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-[#55556a]">No campaigns yet</div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-base font-semibold text-[#e2e2ea] truncate">{c.subject}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={"inline-flex items-center px-2 py-0.5 text-xs rounded-full border " + statusColor(c.status)}>
                      {c.status === "sending" && (
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
                      )}
                      {c.status}
                    </span>
                  {c.scheduledAt && c.status === "scheduled" && (
                      <span className="text-xs text-blue-400/80">
                        Scheduled for {new Date(c.scheduledAt).toLocaleString()}
                      </span>
                    )}
                    {c.status === "sending" && (
                      <span className="text-xs text-yellow-400/80 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                        Sending in background — {c.sentCount} sent so far
                      </span>
                    )}
                    {c.sentAt && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-[#55556a]">
                          Sent {new Date(c.sentAt).toLocaleDateString()} — {c.sentCount} delivered
                        </span>
                        <span className="text-xs text-[#55556a]" title="Unique opens">
                          👁 {c.opens || 0}
                        </span>
                        <span className="text-xs text-[#55556a]" title="Link clicks">
                          🔗 {c.clicks || 0}
                        </span>
                        {c.unsubscribes > 0 && (
                          <span className="text-xs text-red-400/70" title="Unsubscribes">
                            ✕ {c.unsubscribes}
                          </span>
                        )}
                        {c.bounces > 0 && (
                          <span className="text-xs text-red-400/70" title="Bounces">
                            ⚠ {c.bounces}
                          </span>
                        )}
                      </div>
                    )}
                    {!c.sentAt && (
                      <span className="text-xs text-[#55556a]">
                        Created {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {c.filterCriteria && (() => {
                      try {
                        const fc = JSON.parse(c.filterCriteria);
                        const parts: string[] = [];
                        if (fc.subscribedAfter) parts.push(`subscribed ≥ ${new Date(fc.subscribedAfter).toLocaleDateString()}`);
                        if (fc.subscribedBefore) parts.push(`subscribed ≤ ${new Date(fc.subscribedBefore).toLocaleDateString()}`);
                        if (fc.createdAfter) parts.push(`created ≥ ${new Date(fc.createdAfter).toLocaleDateString()}`);
                        if (fc.createdBefore) parts.push(`created ≤ ${new Date(fc.createdBefore).toLocaleDateString()}`);
                        if (parts.length > 0) {
                          return <span className="text-xs text-indigo-400/70" title="Recipient filter"><Filter className="w-3 h-3 inline mr-0.5" />{parts.join(", ")}</span>;
                        }
                      } catch { /* ignore */ }
                      return null;
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePreview(c.id)}
                    className="p-2 rounded text-[#55556a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    title="Preview campaign"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {c.status === "draft" && (
                    <>
                      <button
                        onClick={() => handleEdit(c.id)}
                        className="p-2 rounded text-[#55556a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="Edit campaign"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <Button onClick={() => handleSend(c.id)} size="sm" disabled={sending === c.id}>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        {sending === c.id ? "Sending..." : "Send Now"}
                      </Button>
                      <button
                        onClick={() => handleTestSend(c.id)}
                        className="p-2 rounded text-[#55556a] hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                        title="Send test email"
                      >
                        <FlaskConical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded text-[#55556a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {c.status === "scheduled" && (
                    <>
                      <button
                        onClick={() => handleEdit(c.id)}
                        className="p-2 rounded text-[#55556a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="Edit campaign"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <Button onClick={() => handleSend(c.id)} size="sm" disabled={sending === c.id}>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Send Now
                      </Button>
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          const res = await fetch(`/api/admin/newsletter/campaigns/${c.id}/schedule`, {
                            method: "DELETE",
                            headers: { authorization: `Bearer ${token}` },
                          });
                          if (res.ok) {
                            showMsg("success", "Schedule cancelled — campaign is now a draft");
                            fetchCampaigns();
                          } else {
                            const data = await res.json();
                            showMsg("error", data.error || "Failed to unschedule");
                          }
                        }}
                        className="p-2 rounded text-[#55556a] hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                        title="Cancel schedule"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded text-[#55556a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {c.status === "sending" && (
                    <>
                      <span className="flex items-center gap-1.5 text-xs text-yellow-400">
                        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Sending...
                      </span>
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          const res = await fetch(`/api/admin/newsletter/campaigns/${c.id}/reset`, {
                            method: "POST",
                            headers: { authorization: `Bearer ${token}` },
                          });
                          if (res.ok) {
                            showMsg("success", "Campaign reset to draft");
                            fetchCampaigns();
                          } else {
                            const data = await res.json();
                            showMsg("error", data.error || "Failed to reset");
                          }
                        }}
                        className="p-2 rounded text-[#55556a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Stop sending and reset to draft"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
            Prev
          </Button>
          <span className="text-xs text-[#55556a]">{page} / {totalPages}</span>
          <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}

      {showPreview && !showForm && previewHtml && previewCampaign && (
        <div className="mt-6 glass-card overflow-hidden">
          <div className="p-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Monitor className="w-4 h-4 text-[#55556a] shrink-0" />
              <span className="text-xs font-medium text-[#9090a8] shrink-0">Campaign Preview</span>
              <span className="text-[#2a2a36] shrink-0">—</span>
              <span className="text-sm font-semibold text-[#e2e2ea] truncate">{previewCampaign.subject}</span>
              <span className={"inline-flex items-center px-2 py-0.5 text-xs rounded-full border shrink-0 " + statusColor(previewCampaign.status)}>
                {previewCampaign.status}
              </span>
              {previewCampaign.scheduledAt && (
                <span className="text-xs text-blue-400/80 shrink-0">
                  Scheduled: {new Date(previewCampaign.scheduledAt).toLocaleString()}
                </span>
              )}
              {previewCampaign.sentAt && (
                <span className="text-xs text-[#55556a] shrink-0">
                  Sent: {new Date(previewCampaign.sentAt).toLocaleDateString()}
                  {previewCampaign.sentCount > 0 && ` — ${previewCampaign.sentCount} delivered`}
                </span>
              )}
              {previewCampaign.filterCriteria && (() => {
                try {
                  const fc = JSON.parse(previewCampaign.filterCriteria);
                  const parts: string[] = [];
                  if (fc.subscribedAfter) parts.push(`≥ ${new Date(fc.subscribedAfter).toLocaleDateString()}`);
                  if (fc.subscribedBefore) parts.push(`≤ ${new Date(fc.subscribedBefore).toLocaleDateString()}`);
                  if (fc.createdAfter) parts.push(`created ≥ ${new Date(fc.createdAfter).toLocaleDateString()}`);
                  if (fc.createdBefore) parts.push(`created ≤ ${new Date(fc.createdBefore).toLocaleDateString()}`);
                  if (parts.length > 0) {
                    return <span className="text-xs text-indigo-400/70 shrink-0 hidden sm:inline" title="Recipient filter"><Filter className="w-3 h-3 inline mr-0.5" />{parts.join(", ")}</span>;
                  }
                } catch { /* ignore */ }
                return null;
              })()}
            </div>
            <button onClick={() => { setShowPreview(false); setPreviewHtml(""); setPreviewCampaign(null); }} className="p-1 rounded text-[#55556a] hover:text-[#e2e2ea] transition-colors shrink-0 ml-2">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[#050508]">
            <iframe
              srcDoc={previewHtml}
              className="w-full border-0"
              style={{ height: "600px" }}
              title="Email preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AutomationsPanel({ showMsg }: { showMsg: (type: "success" | "error", text: string) => void }) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [autoType, setAutoType] = useState<string>("welcome");
  const [trigger, setTrigger] = useState<string>("on_subscribe");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const fetchAutomations = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch("/api/admin/newsletter/automations", {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setAutomations(data.automations);
      })
      .catch(() => showMsg("error", "Failed to load automations"))
      .finally(() => setLoading(false));
  }, [showMsg]);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setAutoType("welcome");
    setTrigger("on_subscribe");
    setSubject("");
    setContent("");
    setDelayMinutes(0);
    setIsActive(true);
    setSortOrder(0);
  };

  const handleSave = async () => {
    if (!name || !subject || !content) { showMsg("error", "Name, subject and content are required"); return; }
    const token = localStorage.getItem("token");
    try {
      const url = editingId
        ? `/api/admin/newsletter/automations/${editingId}`
        : "/api/admin/newsletter/automations";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description: description || null, type: autoType, trigger, subject, content, delayMinutes, isActive, sortOrder, filterCriteria: null }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", editingId ? "Automation updated" : "Automation created");
        closeForm();
        fetchAutomations();
      } else {
        showMsg("error", data.error || "Failed to save");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const handleEdit = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/automations/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.automation) {
        setEditingId(id);
        setName(data.automation.name);
        setDescription(data.automation.description || "");
        setAutoType(data.automation.type);
        setTrigger(data.automation.trigger);
        setSubject(data.automation.subject);
        setContent(data.automation.content);
        setDelayMinutes(data.automation.delayMinutes);
        setIsActive(data.automation.isActive);
        setSortOrder(data.automation.sortOrder);
        setShowForm(true);
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/automations/${id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showMsg("success", "Automation deleted");
        fetchAutomations();
      } else {
        const data = await res.json();
        showMsg("error", data.error || "Failed to delete");
      }
    } catch {
      showMsg("error", "Connection error");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/newsletter/automations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        fetchAutomations();
      }
    } catch { /* ignore */ }
  };

  const typeLabel = (t: string) => t === "welcome" ? "Welcome" : t === "reengagement" ? "Re-engagement" : "Custom";
  const triggerLabel = (t: string) => t === "on_subscribe" ? "On Subscribe" : t === "on_schedule" ? "On Schedule" : "On Inactive";
  const formatDelay = (min: number) => {
    if (min === 0) return "Immediate";
    if (min < 60) return `${min}m`;
    if (min < 1440) return `${Math.round(min / 60)}h`;
    return `${Math.round(min / 1440)}d`;
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#55556a]">
          Automated email sequences that send based on triggers and delays
        </p>
        {!showForm && (
          <Button onClick={() => { setEditingId(null); setShowForm(true); }} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> New Automation
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#e2e2ea]">{editingId ? "Edit Automation" : "New Automation"}</h3>
            <button onClick={closeForm} className="p-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-[#9090a8] hover:text-[#e2e2ea] transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#9090a8] mb-1 block">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Welcome Series #1" maxLength={200}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#9090a8] mb-1 block">Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Sent to new subscribers..." maxLength={500}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-[#9090a8] mb-1 block">Type</label>
              <select value={autoType} onChange={e => setAutoType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50">
                <option value="welcome">Welcome</option>
                <option value="reengagement">Re-engagement</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9090a8] mb-1 block">Trigger</label>
              <select value={trigger} onChange={e => setTrigger(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50">
                <option value="on_subscribe">On Subscribe</option>
                <option value="on_schedule">On Schedule</option>
                <option value="on_inactive">On Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9090a8] mb-1 block">Delay</label>
              <div className="flex items-center gap-2">
                <input type="number" value={delayMinutes} onChange={e => setDelayMinutes(parseInt(e.target.value) || 0)} min={0} max={525600}
                  className="w-24 px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50" />
                <span className="text-sm text-[#55556a]">minutes ({formatDelay(delayMinutes)})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#9090a8] mb-1 block">Sort Order</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} min={0} max={100}
                className="w-24 px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[#0a0a0f] text-indigo-500 focus:ring-indigo-500/50" />
                <span className="text-sm text-[#9090a8]">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#9090a8] mb-1 block">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Welcome to the newsletter!" maxLength={200}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50" />
          </div>

          <div>
            <label className="text-sm font-medium text-[#9090a8] mb-1 block">Content</label>
            <RichTextEditor content={content} onChange={setContent} placeholder="Write your automation email content..." />
            <p className="text-xs text-[#55556a] mt-1">Use {"{{firstName}}"}, {"{{lastName}}"}, {"{{fullName}}"}, {"{{name}}"}, {"{{email}}"} for personalization</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}>
              <Send className="w-4 h-4 mr-1.5" /> {editingId ? "Update Automation" : "Create Automation"}
            </Button>
            <Button onClick={closeForm} variant="ghost">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : automations.length === 0 ? (
        <div className="text-center py-12 text-[#55556a]">No automations configured yet</div>
      ) : (
        <div className="space-y-3">
          {automations.map(a => (
            <div key={a.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[#e2e2ea]">{a.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${a.isActive ? "bg-green-500/10 text-green-300 border-green-500/20" : "bg-[#18181f] text-[#55556a] border-[rgba(255,255,255,0.07)]"}`}>
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-[#55556a]">{typeLabel(a.type)}</span>
                    <span className="text-xs text-indigo-400/70">{triggerLabel(a.trigger)}</span>
                    {a.delayMinutes > 0 && (
                      <span className="text-xs text-[#55556a]">After {formatDelay(a.delayMinutes)}</span>
                    )}
                    <span className="text-xs text-[#55556a]">&ldquo;{a.subject}&rdquo;</span>
                    {a.sendCount > 0 && (
                      <span className="text-xs text-green-400/70">{a.sendCount} sent</span>
                    )}
                    {a.lastSentAt && (
                      <span className="text-xs text-[#55556a]">Last: {new Date(a.lastSentAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggleActive(a.id, a.isActive)}
                    className={`p-2 rounded transition-colors ${a.isActive ? "text-green-400 hover:bg-green-500/10" : "text-[#55556a] hover:text-green-400 hover:bg-green-500/10"}`}
                    title={a.isActive ? "Pause" : "Activate"}>
                    {a.isActive ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(a.id)} className="p-2 rounded text-[#55556a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 rounded text-[#55556a] hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel({ showMsg }: { showMsg: (type: "success" | "error", text: string) => void }) {
  const [overview, setOverview] = useState<{
    subscribers: { total: number; active: number; pending: number; unsubscribed: number; newToday: number; newWeek: number; newMonth: number };
    campaigns: { total: number; sent: number; totalDelivered: number; totalOpens: number; totalClicks: number; totalUnsubscribes: number; totalBounces: number; openRate: number; clickRate: number; unsubscribeRate: number; bounceRate: number };
    lastCampaign: { id: string; subject: string; sentAt: string; sentCount: number; opens: number; clicks: number } | null;
  } | null>(null);
  const [growth, setGrowth] = useState<{ date: string; newSubs: number; confirmed: number; unsubscribed: number; active: number }[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; subject: string; status: string; sentCount: number; opens: number; clicks: number; unsubscribes: number; bounces: number; openRate: number; clickRate: number; unsubscribeRate: number; bounceRate: number; ctr: number; sentAt: string | null; createdAt: string }[]>([]);
  const [growthRange, setGrowthRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/admin/newsletter/analytics/overview", { headers }).then(r => r.json()),
      fetch(`/api/admin/newsletter/analytics/growth?range=${growthRange}`, { headers }).then(r => r.json()),
      fetch("/api/admin/newsletter/analytics/campaigns?limit=20", { headers }).then(r => r.json()),
    ])
      .then(([ov, gr, cp]) => {
        setOverview(ov);
        setGrowth(gr.growth || []);
        setCampaigns(cp.campaigns || []);
      })
      .catch(() => showMsg("error", "Failed to load analytics"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnalytics(); }, [growthRange]);

  const handleExport = () => {
    const token = localStorage.getItem("token");
    const a = document.createElement("a");
    a.href = `/api/admin/newsletter/subscribers/export?status=active`;
    a.download = "";
    fetch(a.href, { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => showMsg("error", "Export failed"));
  };

  if (loading) {
    return <div className="text-center py-12 text-[#55556a]">Loading analytics...</div>;
  }

  const statCards = [
    { label: "Active Subscribers", value: overview?.subscribers.active ?? 0, icon: Users, color: "indigo" },
    { label: "Campaigns Sent", value: overview?.campaigns.sent ?? 0, icon: Megaphone, color: "purple" },
    { label: "Open Rate", value: `${overview?.campaigns.openRate ?? "0"}%`, icon: Percent, color: "green" },
    { label: "Click Rate", value: `${overview?.campaigns.clickRate ?? "0"}%`, icon: MousePointerClick, color: "blue" },
  ];

  const statColors: Record<string, string> = {
    indigo: "border-indigo-500/30",
    purple: "border-purple-500/30",
    green: "border-green-500/30",
    blue: "border-blue-500/30",
  };

  const iconColors: Record<string, string> = {
    indigo: "text-indigo-400",
    purple: "text-purple-400",
    green: "text-green-400",
    blue: "text-blue-400",
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-[#0a0a0f] rounded-lg p-1 border border-[rgba(255,255,255,0.07)]">
            {(["7d", "30d", "90d"] as const).map(r => (
              <button
                key={r}
                onClick={() => setGrowthRange(r)}
                className={"px-3 py-1.5 rounded-md text-xs font-medium transition-colors " +
                  (growthRange === r ? "bg-indigo-500/20 text-indigo-300" : "text-[#9090a8] hover:text-[#e2e2ea]")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleExport} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`glass-card bg-[#0a0a0f] border ${statColors[stat.color]} rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9090a8]">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${iconColors[stat.color]}`} />
            </div>
            <div className="text-2xl font-bold text-[#e2e2ea] mt-2">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <span className="text-sm text-[#9090a8] mb-1">Total Emails Delivered</span>
            <span className="text-3xl font-bold text-[#e2e2ea]">{(overview?.campaigns.totalDelivered ?? 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <span className="text-sm text-[#9090a8] mb-1">Bounce Rate</span>
            <span className={`text-3xl font-bold ${(overview?.campaigns.bounceRate ?? 0) > 3 ? "text-red-400" : "text-green-400"}`}>{overview?.campaigns.bounceRate ?? "0"}%</span>
          </div>
        </div>
        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <span className="text-sm text-[#9090a8] mb-1">Unsubscribe Rate</span>
            <span className={`text-3xl font-bold ${(overview?.campaigns.unsubscribeRate ?? 0) > 1 ? "text-yellow-400" : "text-green-400"}`}>{overview?.campaigns.unsubscribeRate ?? "0"}%</span>
          </div>
        </div>
        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <span className="text-sm text-[#9090a8] mb-1">New This Week</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-green-400">+{overview?.subscribers.newWeek ?? 0}</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#9090a8] mb-4">Subscriber Growth ({growthRange})</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#55556a" }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fontSize: 11, fill: "#55556a" }} />
                <Tooltip
                  contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#e2e2ea" }}
                />
                <Bar dataKey="confirmed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Confirmed" />
                <Bar dataKey="unsubscribed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Unsubscribed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#9090a8] mb-4">Subscriber Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#9090a8]">Active</span>
                <span className="text-[#e2e2ea] font-medium">{overview?.subscribers.active ?? 0}</span>
              </div>
              <div className="w-full bg-[#111118] rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${overview ? Math.round((overview.subscribers.active / Math.max(1, overview.subscribers.total)) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#9090a8]">Pending</span>
                <span className="text-[#e2e2ea] font-medium">{overview?.subscribers.pending ?? 0}</span>
              </div>
              <div className="w-full bg-[#111118] rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${overview ? Math.round((overview.subscribers.pending / Math.max(1, overview.subscribers.total)) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#9090a8]">Unsubscribed</span>
                <span className="text-[#e2e2ea] font-medium">{overview?.subscribers.unsubscribed ?? 0}</span>
              </div>
              <div className="w-full bg-[#111118] rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${overview ? Math.round((overview.subscribers.unsubscribed / Math.max(1, overview.subscribers.total)) * 100) : 0}%` }} />
              </div>
            </div>
          </div>

          {overview?.lastCampaign && (
            <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#55556a] mb-2">Latest Campaign</p>
              <p className="text-sm text-[#e2e2ea] font-medium truncate">{overview.lastCampaign.subject}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#55556a]">
                <span>👁 {overview.lastCampaign.opens} opens</span>
                <span>🔗 {overview.lastCampaign.clicks} clicks</span>
                <span>{new Date(overview.lastCampaign.sentAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)]">
          <h3 className="text-sm font-medium text-[#9090a8]">Campaign Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.04)] text-xs text-[#55556a]">
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-right px-4 py-3 font-medium">Delivered</th>
                <th className="text-right px-4 py-3 font-medium">Opens</th>
                <th className="text-right px-4 py-3 font-medium">Clicks</th>
                <th className="text-right px-4 py-3 font-medium">Open Rate</th>
                <th className="text-right px-4 py-3 font-medium">CTR</th>
                <th className="text-right px-4 py-3 font-medium">Unsub</th>
                <th className="text-right px-4 py-3 font-medium">Bounces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#55556a]">No campaigns sent yet</td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-[#0a0a14] transition-colors">
                    <td className="px-4 py-3 text-[#e2e2ea] max-w-[200px] truncate">{c.subject}</td>
                    <td className="px-4 py-3 text-right text-[#e2e2ea]">{c.sentCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[#9090a8]">{c.opens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[#9090a8]">{c.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={c.openRate > 30 ? "text-green-400" : c.openRate > 15 ? "text-yellow-400" : "text-red-400"}>
                        {c.openRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={c.ctr > 5 ? "text-green-400" : c.ctr > 2 ? "text-yellow-400" : "text-red-400"}>
                        {c.ctr}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#55556a]">{c.unsubscribes}</td>
                    <td className="px-4 py-3 text-right text-[#55556a]">{c.bounces}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
