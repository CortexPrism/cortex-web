"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "@/i18n/routing";
import { slugify } from "@/lib/utils";
import { Plus, Edit2, Trash2, Eye, Save, X, Globe, FileText } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { username: string } | null;
}

export default function AdminBlogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    tagsInput: "",
    published: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchPosts = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch(`/api/blog?limit=50`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {
      // silently fail
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") fetchPosts();
  }, [user, fetchPosts]);

  function resetForm() {
    setForm({ title: "", slug: "", content: "", excerpt: "", coverImage: "", tagsInput: "", published: false });
    setEditingPost(null);
    setCreating(false);
    setError("");
  }

  function startEdit(post: BlogPost) {
    setEditingPost(post);
    setCreating(false);
    setError("");
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      tagsInput: post.tags.join(", "),
      published: post.published,
    });
  }

  function handleTitleChange(title: string) {
    const autoSlug = slugify(title);
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug === slugify(f.title) || f.slug === "" ? autoSlug : f.slug,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt || undefined,
      coverImage: form.coverImage || undefined,
      tags: form.tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      published: form.published,
    };

    try {
      const token = localStorage.getItem("token");
      let res: Response;

      if (editingPost) {
        res = await fetch(`/api/blog/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      resetForm();
      fetchPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setDeleteConfirm(null);
      if (editingPost?.id === id) resetForm();
      fetchPosts();
    } catch {
      setError("Failed to delete post");
    }
  }

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  const showEditor = creating || editingPost;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2ea]">Blog Posts</h1>
          <p className="text-sm text-[#55556a] mt-1">Manage blog articles</p>
        </div>
        {!showEditor && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
          <button onClick={() => setError("")} className="ml-2 hover:text-red-200"><X className="w-3 h-3 inline" /></button>
        </div>
      )}

      {showEditor ? (
        <div className="glass-card rounded-xl p-6 border border-[rgba(255,255,255,0.07)] space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-[#e2e2ea]">
              {editingPost ? "Edit Post" : "New Post"}
            </h2>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg text-[#55556a] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title"
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="post-url-slug"
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#55556a] mb-1">Excerpt</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Brief description for cards and SEO"
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Cover Image URL</label>
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tagsInput}
                onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.target.value }))}
                placeholder="tutorial, ai, agents"
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#55556a] mb-1">Content (Markdown / MDX)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Write your post content in markdown..."
              rows={16}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 transition-colors font-mono resize-y"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 rounded border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] accent-indigo-500"
              />
              <span className="text-sm text-[#e2e2ea]">Published</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.title || !form.slug || !form.content}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg accent-gradient text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : editingPost ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm rounded-lg border border-[rgba(255,255,255,0.12)] text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : listLoading ? (
        <div className="text-center py-12 text-[#55556a]">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-[#55556a] mx-auto mb-3" />
          <p className="text-[#9090a8] mb-1">No blog posts yet</p>
          <p className="text-sm text-[#55556a]">Create your first post to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] hover:border-indigo-500/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#e2e2ea] truncate">{post.title}</span>
                  {post.published ? (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs text-green-400">
                      <Globe className="w-3 h-3" /> Published
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs text-yellow-400">
                      <FileText className="w-3 h-3" /> Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[#55556a]">
                  <span>{post.slug}</span>
                  {post.tags.length > 0 && <span>{post.tags.join(", ")}</span>}
                  {post.author && <span>by {post.author.username}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-[#55556a] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  onClick={() => startEdit(post)}
                  className="p-2 rounded-lg text-[#55556a] hover:text-indigo-400 hover:bg-[#111118] transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(post.id)}
                  className="p-2 rounded-lg text-[#55556a] hover:text-red-400 hover:bg-[#111118] transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {deleteConfirm === post.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
                  <div className="glass-card p-6 rounded-xl border border-[rgba(255,255,255,0.07)] max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[#e2e2ea] mb-1 font-medium">Delete &quot;{post.title}&quot;?</p>
                    <p className="text-sm text-[#9090a8] mb-4">This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 text-sm rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-sm rounded-lg border border-[rgba(255,255,255,0.12)] text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
