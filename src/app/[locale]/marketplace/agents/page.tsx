"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { Pagination } from "@/components/shared/Pagination";
import { ArrowUpDown } from "lucide-react";

interface Category { id: string; name: string; slug: string }

interface Agent {
  id: string; name: string; slug: string; version: string;
  description: string; provider: string | null; model: string | null;
  author: string | null; icon: string | null; downloads: number;
  rating: number; tags: string[]; category: string | null;
  repository: string | null; githubStars: number; createdAt: string;
}

interface AgentResponse {
  agents: Agent[]; total: number; page: number; limit: number; totalPages: number;
}

const SORT_OPTIONS = [
  { value: "downloads", labelKey: "sortDownloads" as const },
  { value: "rating", labelKey: "sortRating" as const },
  { value: "newest", labelKey: "sortNewest" as const },
  { value: "name", labelKey: "sortName" as const },
];

export default function AgentListingPage() {
  const t = useTranslations("marketplaceList");
  const searchParams = useSearchParams();
  const router = useRouter();
  const isInitialMount = useRef(true);

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentProvider = searchParams.get("provider") || "";
  const currentSort = searchParams.get("sort") || "downloads";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(currentSearch);
  const [data, setData] = useState<AgentResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const search = updates.search !== undefined ? updates.search : currentSearch;
    const category = updates.category !== undefined ? updates.category : currentCategory;
    const provider = updates.provider !== undefined ? updates.provider : currentProvider;
    const sort = updates.sort !== undefined ? updates.sort : currentSort;
    const page = updates.page !== undefined ? updates.page : "1";

    if (search) sp.set("search", search);
    if (category) sp.set("category", category);
    if (provider) sp.set("provider", provider);
    if (sort && sort !== "downloads") sp.set("sort", sort);
    if (page && page !== "1") sp.set("page", page);

    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [currentSearch, currentCategory, currentProvider, currentSort, router]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (searchInput !== debouncedSearch) return;
    if (debouncedSearch !== currentSearch) {
      updateURL({ search: debouncedSearch || undefined, page: "1" });
    }
  }, [debouncedSearch, searchInput, currentSearch, updateURL]);

  useEffect(() => {
    if (!categories.length) {
      fetch("/api/marketplace/categories").then(r => r.json()).then(setCategories).catch(() => {});
    }
  }, [categories.length]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    if (currentCategory) params.set("category", currentCategory);
    if (currentProvider) params.set("provider", currentProvider);
    if (currentSort && currentSort !== "downloads") params.set("sort", currentSort);
    params.set("page", String(currentPage));
    params.set("limit", "12");

    fetch(`/api/marketplace/agents?${params}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => {
        setData(d);
        const providerList: string[] = [];
        d.agents.forEach((a: Agent) => { if (a.provider && !providerList.includes(a.provider)) providerList.push(a.provider) });
        setProviders(providerList);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [currentSearch, currentCategory, currentProvider, currentSort, currentPage, fetchKey]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e2e2ea] mb-2">{t("heading_agents")}</h1>
        <p className="text-[#9090a8]">{t("subtitle_agents")}</p>
      </div>

      <div className="space-y-5 mb-8">
        <SearchBar
          value={searchInput}
          onChange={(v) => setSearchInput(v)}
          placeholder={t("searchPlaceholderAgents")}
        />

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-[#e2e2ea] uppercase tracking-wider">{t("categories")}</h3>
            {currentCategory && (
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">1 selected</span>
            )}
          </div>
          <CategoryFilter
            categories={categories}
            selected={currentCategory}
            onSelect={(slug) => updateURL({ category: slug || undefined, page: "1" })}
          />
        </div>

        {providers.length > 0 && (
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-[#e2e2ea] uppercase tracking-wider">{t("aiProviders")}</h3>
              {currentProvider && (
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">1 selected</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {providers.map(p => (
                <button
                  key={p}
                  onClick={() => updateURL({ provider: currentProvider === p ? undefined : p, page: "1" })}
                  className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 border font-medium ${
                    currentProvider === p
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-500/20"
                      : "bg-[#0f0f15] text-[#9090a8] border-[rgba(255,255,255,0.07)] hover:border-purple-500/30 hover:text-[#e2e2ea]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        {data && !loading && (
          <p className="text-sm text-[#55556a]">
            {t("showing")} {data.agents.length} of {data.total} agent{data.total !== 1 ? "s" : ""}
            {currentProvider && <> from <span className="text-[#9090a8]">{currentProvider}</span></>}
          </p>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#55556a]" />
          <select
            value={currentSort}
            onChange={(e) => updateURL({ sort: e.target.value, page: "1" })}
            className="text-sm bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-1.5 text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-[#18181f] mb-3" />
              <div className="h-4 bg-[#18181f] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#18181f] rounded w-full mb-1" />
              <div className="h-3 bg-[#18181f] rounded w-2/3 mb-4" />
              <div className="flex gap-1 mb-3">
                <div className="h-5 bg-[#18181f] rounded-full w-14" />
                <div className="h-5 bg-[#18181f] rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 opacity-30">⚠️</div>
          <p className="text-lg text-[#9090a8] mb-1">{t("loadFailed")}</p>
          <p className="text-sm text-[#55556a]">{error}</p>
          <button
            onClick={() => { setError(null); setFetchKey(k => k + 1); }}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      ) : data && data.agents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(p) => updateURL({ page: String(p) })}
          />
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 opacity-30">🤖</div>
          <p className="text-lg text-[#9090a8] mb-1">{t("noResults")}</p>
          <p className="text-sm text-[#55556a]">
            {currentSearch || currentCategory || currentProvider
              ? t("noResultsDesc")
              : t("checkBack")}
          </p>
          {(currentSearch || currentCategory || currentProvider) && (
            <button
              onClick={() => updateURL({ search: undefined, category: undefined, provider: undefined, page: "1" })}
              className="mt-4 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
