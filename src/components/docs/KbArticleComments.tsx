"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { MessageSquare, Send, Loader2, User } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; avatar: string | null; displayName: string | null } | null;
}

export function KbArticleComments({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/knowledge-base/${slug}/comments`);
      if (res.ok) setComments(await res.json());
    } catch {
      // silently fail
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError("");

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/knowledge-base/${slug}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content: newComment.trim() }),
    });

    if (res.ok) {
      setNewComment("");
      fetchComments();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to post comment");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-12 border-t border-[rgba(255,255,255,0.07)] pt-8">
      <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-[#55556a]">({comments.length})</span>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#18181f] flex items-center justify-center shrink-0 mt-1">
            <User className="w-4 h-4 text-[#55556a]" />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts..." : "Sign in to leave a comment..."}
              disabled={!user || submitting}
              rows={3}
              className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 resize-y disabled:opacity-50"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            {user && (
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Post Comment
              </button>
            )}
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-6 text-[#55556a]">
          <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[#55556a] text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#18181f] flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                {comment.author?.avatar ? (
                  <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#55556a]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-[#e2e2ea]">
                    {comment.author?.displayName || comment.author?.username || "Anonymous"}
                  </span>
                  <span className="text-xs text-[#55556a]">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-[#9090a8] whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
