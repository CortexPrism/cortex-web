"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/shared/SearchInput";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/shared/Badge";
import { X } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  publishedAt: string | null;
  readTime?: number;
  viewCount?: number;
  author: { username: string; avatar: string | null; displayName: string | null } | null;
}

const SKELETON_COUNT = 6;

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.07)]">
      <div className="aspect-video bg-[#111118] animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-[#111118] animate-pulse" />
          <div className="h-5 w-12 rounded-full bg-[#111118] animate-pulse" />
        </div>
        <div className="h-6 w-3/4 rounded bg-[#111118] animate-pulse" />
        <div className="h-4 w-full rounded bg-[#111118] animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-[#111118] animate-pulse" />
        <div className="flex gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="h-3 w-20 rounded bg-[#111118] animate-pulse" />
          <div className="h-3 w-24 rounded bg-[#111118] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function BlogListingPage() {
  const t = useTranslations("blogList");

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ posts: BlogPost[]; total: number; page: number; totalPages: number } | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [selectedTag]);

  useEffect(() => {
    fetch("/api/blog/tags")
      .then((r) => r.json())
      .then((d) => { if (d.tags) setAllTags(d.tags); })
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedTag) params.set("tag", selectedTag);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/blog?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedTag, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, retryCount]);

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#e2e2ea] mb-3">
          {t("heading")}
        </h1>
        <p className="text-[#9090a8] max-w-2xl">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("searchPlaceholder")}
          className="flex-1 max-w-md"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {selectedTag && (
            <button
              onClick={() => setSelectedTag("")}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              <X className="w-3 h-3" />
              {t("clearFilters")}
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
            >
              <Badge
                variant={selectedTag === tag ? "indigo" : "default"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-[#9090a8] mb-4">{t("loadFailed")}</p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="px-4 py-2 text-sm rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
          >
            {t("retry")}
          </button>
        </div>
      ) : data && data.posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#9090a8] text-lg mb-2">{t("noPosts")}</p>
          <p className="text-[#55556a] text-sm">
            {debouncedSearch || selectedTag
              ? t("noPostsDesc")
              : t("checkBack")}
          </p>
          {(debouncedSearch || selectedTag) && (
            <button
              onClick={() => { setSearch(""); setSelectedTag(""); }}
              className="mt-4 px-4 py-2 text-sm rounded-lg border border-[rgba(255,255,255,0.12)] text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data!.posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            page={data!.page}
            totalPages={data!.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
