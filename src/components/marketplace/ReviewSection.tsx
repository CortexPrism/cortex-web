"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate } from "@/lib/utils";
import { Star, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

interface Rating {
  id: string;
  rating: number;
  review: string | null;
  user: { id: string; username: string; avatar: string | null };
  createdAt: string;
}

interface ReviewSectionProps {
  itemId: string;
  type: "plugin" | "agent";
}

const accentConfig = {
  plugin: {
    icon: "text-indigo-400",
    button: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20",
  },
  agent: {
    icon: "text-purple-400",
    button: "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20",
  },
};

export function ReviewSection({ itemId, type }: ReviewSectionProps) {
  const { user } = useAuth();
  const t = useTranslations("marketplaceList");
  const accent = accentConfig[type];
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchRatings = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketplace/${type}s/${itemId}/reviews`);
      const data = await res.json();
      setRatings(data.ratings || []);
      setAverageRating(data.averageRating);
      setTotalRatings(data.totalRatings);
    } catch {}
  }, [itemId, type]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleSubmit = async () => {
    if (userRating === 0) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/marketplace/${type}s/${itemId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: userRating, review: userReview || undefined }),
      });
      setUserReview("");
      setShowForm(false);
      await fetchRatings();
    } catch {}
    setSubmitting(false);
  };

  const placeholder = type === "plugin" ? t("pluginReviewPlaceholder") : t("agentReviewPlaceholder");
  const emptyText = type === "plugin" ? t("pluginReviewEmpty") : t("agentReviewEmpty");

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#e2e2ea] flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${accent.icon}`} />
          {t("reviews", { count: totalRatings })}
        </h2>
        {averageRating > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="text-sm text-[#55556a]">({averageRating.toFixed(1)})</span>
          </div>
        )}
      </div>

      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className={`mb-4 px-4 py-2 text-sm rounded-lg ${accent.button} transition-colors`}
        >
          {ratings.some(r => r.user.id === user.id) ? t("updateReview") : t("writeReview")}
        </button>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-[#0a0a0f] rounded-lg border border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                className={`p-1 transition-colors ${star <= userRating ? "text-yellow-400" : "text-[#333]"}`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
          <textarea
            value={userReview}
            onChange={e => setUserReview(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || userRating === 0}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
            <button
              onClick={() => { setShowForm(false); setUserRating(0); setUserReview(""); }}
              className="px-4 py-2 text-sm rounded-lg text-[#55556a] hover:text-[#e2e2ea] transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {ratings.length === 0 ? (
        <p className="text-sm text-[#55556a] text-center py-6">{t("noReviews")} {emptyText}</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {ratings.map((r) => (
            <div key={r.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#e2e2ea]">{r.user.username}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-yellow-400 fill-current" : "text-[#333]"}`} />
                  ))}
                </div>
              </div>
              {r.review && <p className="text-sm text-[#9090a8]">{r.review}</p>}
              <p className="text-xs text-[#55556a] mt-1">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
