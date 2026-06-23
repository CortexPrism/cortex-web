"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/shared/Badge";
import { MdxContent } from "@/components/docs/MdxContent";
import {
  BookOpen, Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2,
  Save, X, Eye, Tag, MessageSquare, Hash, Loader2,
} from "lucide-react";

interface KbArticle {
  id: string;
  title: string;
  slug: string;
  section: string;
  content: string;
  description: string | null;
  tags: string[];
  published: boolean;
  sortOrder: number;
  viewCount: number;
  updatedAt: string;
  createdAt: string;
  createdBy: string | null;
  author: { username: string; avatar: string | null; displayName: string | null } | null;
}

interface KbSection {
  section: string;
  count: number;
}

const SECTION_LABELS: Record<string, string> = {
  "knowledge-base": "Knowledge Base",
  "getting-started": "Getting Started",
  architecture: "Architecture",
  "developer-guide": "Developer Guide",
  cli: "CLI Reference",
  "design-docs": "Design Docs",
};

interface KbComment {
  id: string;
  articleId: string;
  userId: string | null;
  content: string;
  createdAt: string;
  author: { username: string; avatar: string | null; displayName: string | null } | null;
}

interface Stats {
  total: number;
  published: number;
  drafts: number;
}

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  confirmVariant,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: "red" | "indigo";
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="glass-card p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-[#e2e2ea] mb-2">{title}</h3>
        <p className="text-sm text-[#9090a8] mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea]">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            confirmVariant === "indigo"
              ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
          }`}>
            {confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminKnowledgeBasePage() {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, drafts: 0 });
  const [allTags, setAllTags] = useState<string[]>([]);
  const [sections, setSections] = useState<KbSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    section: "knowledge-base",
    content: "",
    description: "",
    tagsInput: "",
    published: true,
    sortOrder: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [commentsId, setCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<KbComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchArticles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (search) params.set("search", search);
    if (tagFilter) params.set("tag", tagFilter);
    if (sectionFilter) params.set("section", sectionFilter);
    const res = await fetch(`/api/admin/knowledge-base?${params}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
      setStats(data.stats);
      setAllTags(data.tags || []);
      setSections(data.sections || []);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [page, search, tagFilter, sectionFilter, token]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const fetchComments = useCallback(async (articleId: string) => {
    setCommentsLoading(true);
    const res = await fetch(`/api/admin/knowledge-base/${articleId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const article = await res.json();
      setComments(article.comments || []);
    }
    setCommentsLoading(false);
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const resetForm = () => {
    setForm({ title: "", slug: "", section: "knowledge-base", content: "", description: "", tagsInput: "", published: true, sortOrder: 0 });
    setFormErrors({});
    setEditingId(null);
    setPreviewTab("edit");
  };

  const openCreate = () => {
    resetForm();
    setView("create");
  };

  const openEdit = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/knowledge-base/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const article: KbArticle = await res.json();
      setForm({
        title: article.title,
        slug: article.slug,
        section: article.section || "knowledge-base",
        content: article.content,
        description: article.description || "",
        tagsInput: (article.tags || []).join(", "),
        published: article.published,
        sortOrder: article.sortOrder,
      });
      setEditingId(article.id);
      setView("edit");
    }
  };

  const openComments = async (id: string) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    setCommentsId(id);
    fetchComments(id);
  };

  const handleTitleChange = (title: string) => {
    if (view === "create") {
      setForm(prev => ({ ...prev, title, slug: slugify(title) }));
    } else {
      setForm(prev => ({ ...prev, title }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const isCreate = view === "create";
    const url = isCreate
      ? "/api/admin/knowledge-base"
      : `/api/admin/knowledge-base/${editingId}`;
    const method = isCreate ? "POST" : "PUT";

    const payload = {
      title: form.title,
      slug: form.slug,
      section: form.section,
      content: form.content,
      description: form.description || undefined,
      tags: form.tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      published: form.published,
      sortOrder: form.sortOrder,
    };

    setActionLoading("save");
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setView("list");
      resetForm();
      fetchArticles();
    } else {
      if (typeof data.error === "string") {
        setFormErrors({ general: data.error });
      } else if (typeof data.error === "object") {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(data.error)) {
          if (Array.isArray(msgs)) fieldErrors[key] = msgs[0];
        }
        setFormErrors(fieldErrors);
      }
    }
    setActionLoading(null);
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    setActionLoading("delete");
    const res = await fetch(`/api/admin/knowledge-base/${deleteId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchArticles();
    }
    setDeleteId(null);
    setActionLoading(null);
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId || !commentsId || !token) return;
    const article = articles.find(a => a.id === commentsId);
    if (!article) return;
    setActionLoading("deleteComment");
    await fetch(`/api/knowledge-base/${article.slug}/comments/${deleteCommentId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    fetchComments(commentsId);
    setDeleteCommentId(null);
    setActionLoading(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2ea]">Knowledge Base</h1>
          <p className="text-[#9090a8] text-sm">
            {stats.total} articles ({stats.published} published, {stats.drafts} drafts)
          </p>
        </div>
        {view === "list" && !commentsId && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
            <Plus className="w-4 h-4" /> New Article
          </button>
        )}
        {commentsId && (
          <button onClick={() => setCommentsId(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea] transition-colors">
            <X className="w-4 h-4" /> Back to Articles
          </button>
        )}
      </div>

      {commentsId ? (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Comments
            <span className="text-sm font-normal text-[#55556a]">
              &mdash; {articles.find(a => a.id === commentsId)?.title}
            </span>
          </h2>
          {commentsLoading ? (
            <div className="text-center py-8 text-[#55556a]">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-[#55556a]">No comments yet on this article.</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#55556a]">
                      {comment.author?.displayName || comment.author?.username || "Anonymous"}
                      {" "}&middot;{" "}
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setDeleteCommentId(comment.id)}
                      className="p-1 rounded text-[#55556a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-[#9090a8] whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : view === "list" ? (
        <>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 w-full bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]"
                placeholder="Search articles..." />
            </div>
          </form>

          {sections.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              <button
                type="button"
                onClick={() => { setSectionFilter(""); setPage(1); }}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${!sectionFilter ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-[#111118] text-[#55556a] border-[rgba(255,255,255,0.07)] hover:text-[#9090a8]"}`}
              >
                All ({stats.total})
              </button>
              {sections.map(s => (
                <button
                  key={s.section}
                  type="button"
                  onClick={() => { setSectionFilter(sectionFilter === s.section ? "" : s.section); setPage(1); }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${sectionFilter === s.section ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-[#111118] text-[#55556a] border-[rgba(255,255,255,0.07)] hover:text-[#9090a8]"}`}
                >
                  {SECTION_LABELS[s.section] || s.section} ({s.count})
                </button>
              ))}
            </div>
          )}

          {allTags.length > 0 && !sectionFilter && (
              <div className="flex gap-1.5 flex-wrap items-center">
                <button
                  type="button"
                  onClick={() => { setTagFilter(""); setPage(1); }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${!tagFilter ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-[#111118] text-[#55556a] border-[rgba(255,255,255,0.07)] hover:text-[#9090a8]"}`}
                >
                  All
                </button>
                {allTags.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTagFilter(tagFilter === t ? "" : t); setPage(1); }}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${tagFilter === t ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-[#111118] text-[#55556a] border-[rgba(255,255,255,0.07)] hover:text-[#9090a8]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

          {loading ? (
            <div className="text-center py-12 text-[#55556a]">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : articles.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <BookOpen className="w-8 h-8 text-[#55556a] mx-auto mb-3" />
              <p className="text-[#9090a8]">No knowledge base articles found.</p>
              <button onClick={openCreate} className="mt-4 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20">
                Create your first article
              </button>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.07)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider hidden sm:table-cell">Slug</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider hidden xl:table-cell">Section</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider hidden lg:table-cell">Tags</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider hidden md:table-cell">Views</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-b border-[rgba(255,255,255,0.07)] last:border-0 hover:bg-[#0d0d14] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#e2e2ea] text-sm">{article.title}</div>
                        {article.description && (
                          <div className="text-xs text-[#55556a] mt-0.5 line-clamp-1">{article.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#9090a8] font-mono hidden sm:table-cell">{article.slug}</td>
                      <td className="px-4 py-3 text-xs text-[#55556a] hidden xl:table-cell">
                        {SECTION_LABELS[article.section] || article.section}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={article.published ? "green" : "yellow"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.map((t) => (
                            <span key={t} className="inline-flex items-center px-1.5 py-0.5 text-[10px] rounded bg-[#18181f] text-[#55556a] border border-[rgba(255,255,255,0.05)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#55556a] hidden md:table-cell">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openComments(article.id)}
                            className="p-1.5 rounded-lg text-[#9090a8] hover:text-indigo-400 hover:bg-[#18181f] transition-colors"
                            title="Comments">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(article.id)}
                            className="p-1.5 rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#18181f] transition-colors"
                            title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(article.id)}
                            className="p-1.5 rounded-lg text-[#9090a8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[#55556a]">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {formErrors.general}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9090a8] mb-1">Title</label>
                <input type="text" value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                  placeholder="Article title" />
                {formErrors.title && <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#9090a8] mb-1">Slug</label>
                  <input type="text" value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] font-mono focus:outline-none focus:border-indigo-500/50"
                    placeholder="article-slug" />
                  {formErrors.slug && <p className="text-xs text-red-400 mt-1">{formErrors.slug}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9090a8] mb-1">Section</label>
                  <select value={form.section}
                    onChange={e => setForm(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50">
                    {Object.entries(SECTION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9090a8] mb-1">Tags</label>
                <div className="relative">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#55556a]" />
                  <input type="text" value={form.tagsInput}
                    onChange={e => setForm(prev => ({ ...prev, tagsInput: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50"
                    placeholder="guide, ai, configuration" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9090a8] mb-1">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50 h-20 resize-y"
                  placeholder="Short description for listing pages" />
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published}
                    onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[#111118] accent-indigo-500" />
                  <span className="text-sm text-[#9090a8]">Published</span>
                </label>

                <div>
                  <label className="block text-xs font-medium text-[#55556a] mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder}
                    onChange={e => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-24 px-3 py-1.5 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-[#9090a8] flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Content (Markdown)
                </label>
                <div className="flex gap-1 ml-auto">
                  <button type="button" onClick={() => setPreviewTab("edit")}
                    className={`px-2.5 py-1 text-xs rounded flex items-center gap-1 transition-colors ${previewTab === "edit" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-[#55556a] hover:text-[#9090a8] border border-transparent"}`}>
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button type="button" onClick={() => setPreviewTab("preview")}
                    className={`px-2.5 py-1 text-xs rounded flex items-center gap-1 transition-colors ${previewTab === "preview" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-[#55556a] hover:text-[#9090a8] border border-transparent"}`}>
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>
              </div>
              {previewTab === "edit" ? (
                <textarea value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] font-mono focus:outline-none focus:border-indigo-500/50 h-[420px] resize-y"
                  placeholder="Write Markdown content..." />
              ) : (
                <div className="w-full h-[420px] bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg overflow-y-auto p-6">
                  {form.content ? (
                    <MdxContent content={form.content} />
                  ) : (
                    <p className="text-sm text-[#55556a]">Nothing to preview. Start writing Markdown content.</p>
                  )}
                </div>
              )}
              {formErrors.content && <p className="text-xs text-red-400 mt-1">{formErrors.content}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.07)]">
            <button type="submit" disabled={actionLoading === "save"}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors disabled:opacity-50">
              {actionLoading === "save" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {view === "create" ? "Create Article" : "Save Changes"}
            </button>
            <button type="button" onClick={() => { setView("list"); resetForm(); }}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea] transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Article"
          message="Are you sure you want to delete this article? This action cannot be undone and will also delete all associated comments."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {deleteCommentId && (
        <ConfirmDialog
          title="Delete Comment"
          message="Are you sure you want to delete this comment?"
          confirmLabel="Delete"
          confirmVariant="red"
          onConfirm={handleDeleteComment}
          onCancel={() => setDeleteCommentId(null)}
        />
      )}
    </div>
  );
}
