"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/shared/Badge";
import { MdxContent } from "@/components/docs/MdxContent";
import {
  BookOpen, Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2,
  Save, X, Eye,
} from "lucide-react";

interface KbArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string | null;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
  createdAt: string;
  createdBy: string | null;
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
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
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
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
            Delete
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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    description: "",
    published: true,
    sortOrder: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchArticles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/knowledge-base?${params}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
      setStats(data.stats);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [page, search, token]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const resetForm = () => {
    setForm({ title: "", slug: "", content: "", description: "", published: true, sortOrder: 0 });
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
        content: article.content,
        description: article.description || "",
        published: article.published,
        sortOrder: article.sortOrder,
      });
      setEditingId(article.id);
      setView("edit");
    }
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

    setActionLoading("save");
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2ea]">Knowledge Base</h1>
          <p className="text-[#9090a8] text-sm">
            {stats.total} articles ({stats.published} published, {stats.drafts} drafts)
          </p>
        </div>
        {view === "list" && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
            <Plus className="w-4 h-4" /> New Article
          </button>
        )}
      </div>

      {view === "list" && (
        <>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 w-full bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]"
                placeholder="Search articles..." />
            </div>
          </form>

          {loading ? (
            <div className="text-center py-12 text-[#55556a]">Loading...</div>
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#55556a] uppercase tracking-wider hidden md:table-cell">Updated</th>
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
                      <td className="px-4 py-3">
                        <Badge variant={article.published ? "green" : "yellow"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#55556a] hidden md:table-cell">
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
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
      )}

      {(view === "create" || view === "edit") && (
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

              <div>
                <label className="block text-sm font-medium text-[#9090a8] mb-1">Slug</label>
                <input type="text" value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] font-mono focus:outline-none focus:border-indigo-500/50"
                  placeholder="article-slug" />
                {formErrors.slug && <p className="text-xs text-red-400 mt-1">{formErrors.slug}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9090a8] mb-1">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50 h-20 resize-y"
                  placeholder="Short description for listing pages" />
              </div>

              <div className="flex items-center gap-6">
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
                <label className="text-sm font-medium text-[#9090a8]">Content (Markdown)</label>
                <div className="flex gap-1 ml-auto">
                  <button type="button" onClick={() => setPreviewTab("edit")}
                    className={`px-2 py-1 text-xs rounded ${previewTab === "edit" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-[#55556a] hover:text-[#9090a8]"}`}>
                    <Pencil className="w-3 h-3 inline mr-1" /> Edit
                  </button>
                  <button type="button" onClick={() => setPreviewTab("preview")}
                    className={`px-2 py-1 text-xs rounded ${previewTab === "preview" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-[#55556a] hover:text-[#9090a8]"}`}>
                    <Eye className="w-3 h-3 inline mr-1" /> Preview
                  </button>
                </div>
              </div>
              {previewTab === "edit" ? (
                <textarea value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] font-mono focus:outline-none focus:border-indigo-500/50 h-[400px] resize-y"
                  placeholder="Write Markdown content..." />
              ) : (
                <div className="w-full h-[400px] bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg overflow-y-auto p-6">
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
              <Save className="w-4 h-4" />
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
          message="Are you sure you want to delete this article? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
