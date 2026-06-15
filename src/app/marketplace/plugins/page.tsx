"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { PluginCard } from "@/components/marketplace/PluginCard";
import { Pagination } from "@/components/shared/Pagination";

interface Category { id: string; name: string; slug: string }

interface Plugin {
  id: string; name: string; slug: string; version: string;
  description: string; kind: string; author: string | null;
  icon: string | null; downloads: number; rating: number;
  category: string | null; license: string | null;
  repository: string | null; githubStars: number; createdAt: string;
}

interface PluginResponse {
  plugins: Plugin[]; total: number; page: number; limit: number; totalPages: number;
}

export default function PluginListingPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedKind, setSelectedKind] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PluginResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1) }, [debouncedSearch, selectedCategory, selectedKind]);

  useEffect(() => {
    if (!categories.length) {
      fetch("/api/marketplace/categories").then(r => r.json()).then(setCategories).catch(() => {});
    }
  }, [categories.length]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedKind) params.set("kind", selectedKind);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/marketplace/plugins?${params}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setData(d); setError(null); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) });
  }, [debouncedSearch, selectedCategory, selectedKind, page, retryCount]);

  const kinds = ["esm", "mcp", "wasm"];

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e2e2ea] mb-2">Plugins</h1>
        <p className="text-[#9090a8]">Extend CortexPrism with powerful plugins.</p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search plugins by name, description, or capabilities..."
            className="w-full pl-10 pr-10 py-3 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-[#e2e2ea] placeholder:text-[#55556a] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#e2e2ea]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Section */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-[#e2e2ea] uppercase tracking-wider">Categories</h3>
            {selectedCategory && (
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                1 selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategory(""); setPage(1) }}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 border ${
                !selectedCategory
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/20"
                  : "bg-[#0f0f15] text-[#9090a8] border-[rgba(255,255,255,0.07)] hover:border-indigo-500/30 hover:text-[#e2e2ea]"
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 border ${
                  selectedCategory === cat.slug
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/20"
                    : "bg-[#0f0f15] text-[#9090a8] border-[rgba(255,255,255,0.07)] hover:border-indigo-500/30 hover:text-[#e2e2ea]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Kind Filter Section */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-[#e2e2ea] uppercase tracking-wider">Plugin Type</h3>
            {selectedKind && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                1 selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {kinds.map(k => {
              const kindColorMap: Record<string, string> = {
                esm: "indigo",
                mcp: "emerald",
                wasm: "purple"
              };
              const color = kindColorMap[k];
              const bgColor = color === "indigo" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/20" 
                            : color === "emerald" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/20"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-500/20";
              
              return (
                <button
                  key={k}
                  onClick={() => { setSelectedKind(selectedKind === k ? "" : k); setPage(1) }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                    selectedKind === k
                      ? bgColor
                      : "bg-[#0f0f15] text-[#9090a8] border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea]"
                  }`}
                >
                  {k.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {data && !loading && (
        <p className="text-sm text-[#55556a] mb-4">
          Showing {data.plugins.length} of {data.total} plugin{data.total !== 1 ? "s" : ""}
          {selectedCategory && categories.find(c => c.slug === selectedCategory) && (
            <> in <span className="text-[#9090a8]">{categories.find(c => c.slug === selectedCategory)!.name}</span></>
          )}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-[#18181f] mb-3" />
              <div className="h-4 bg-[#18181f] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#18181f] rounded w-full mb-1" />
              <div className="h-3 bg-[#18181f] rounded w-2/3 mb-4" />
              <div className="flex justify-between">
                <div className="h-3 bg-[#18181f] rounded w-16" />
                <div className="h-3 bg-[#18181f] rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 opacity-30">⚠️</div>
          <p className="text-lg text-[#9090a8] mb-1">Failed to load plugins</p>
          <p className="text-sm text-[#55556a]">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); setRetryCount(c => c + 1) }}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : data && data.plugins.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.plugins.map(plugin => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 opacity-30">🔌</div>
          <p className="text-lg text-[#9090a8] mb-1">No plugins found</p>
          <p className="text-sm text-[#55556a]">
            {search || selectedCategory || selectedKind
              ? "Try adjusting your search or filters"
              : "No plugins are published yet. Check back later."}
          </p>
          {(search || selectedCategory || selectedKind) && (
            <button
              onClick={() => { setSearch(""); setSelectedCategory(""); setSelectedKind(""); setPage(1) }}
              className="mt-4 px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
