"use client";

import { useEffect, useState } from "react";
import { Send, Trash2, Users, Megaphone, AlertCircle, CheckCircle, XCircle, RefreshCw, Upload, Plus, Eye, EyeOff, Monitor, Pencil, FlaskConical } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

type Subscriber = {
  id: string;
  email: string;
  status: string;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
};

type Campaign = {
  id: string;
  subject: string;
  status: string;
  sentCount: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  sentAt: string | null;
  createdAt: string;
};

type Tab = "subscribers" | "campaigns";

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
      </div>

      {tab === "subscribers" ? <SubscribersPanel showMsg={showMsg} /> : <CampaignsPanel showMsg={showMsg} />}
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
                    <p className="text-sm text-[#e2e2ea] font-medium">{s.email}</p>
                    <p className="text-xs text-[#55556a]">
                      {s.subscribedAt
                        ? `Subscribed ${new Date(s.subscribedAt).toLocaleDateString()}`
                        : `Created ${new Date(s.createdAt).toLocaleDateString()}`}
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

  const fetchCampaigns = (p = 1) => {
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
  };

  useEffect(() => {
    fetchCampaigns(page);
  }, [page]);

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
        body: JSON.stringify({ subject, content }),
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
        setShowForm(true);
        setShowPreview(true);
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
        showMsg("success", `Campaign sent! Delivered: ${data.sent}, Failed: ${data.failed}`);
        fetchCampaigns();
      } else {
        showMsg("error", data.error || "Failed to send");
      }
    } catch {
      showMsg("error", "Connection error");
    }
    setSending(null);
  };

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
          <Button onClick={() => { setEditingId(null); setShowForm(true); }} size="sm">
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
                      {c.status}
                    </span>
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

      {showPreview && !showForm && previewHtml && (
        <div className="mt-6 glass-card overflow-hidden">
          <div className="p-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#55556a]" />
              <span className="text-xs font-medium text-[#9090a8]">Campaign Preview</span>
            </div>
            <button onClick={() => { setShowPreview(false); setPreviewHtml(""); }} className="p-1 rounded text-[#55556a] hover:text-[#e2e2ea] transition-colors">
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
