"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Download, Check, X, ArrowLeft, Globe, Moon, Sun, Search, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Translations
const translations = {
  id: {
    title: "Analisis Ulasan Play Store",
    subtitle: "Scraping & analisis sentiment ulasan aplikasi",
    dataCollection: "Pengumpulan Data",
    appId: "App ID / Package Name",
    appIdPlaceholder: "Contoh: com.whatsapp atau com.instagram.android",
    reviewCount: "Jumlah Reviews",
    filterRating: "Filter Rating",
    sortBy: "Urutkan",
    allRatings: "Semua Rating",
    fiveStars: "5 Bintang",
    fourStars: "4 Bintang",
    threeStars: "3 Bintang",
    twoStars: "2 Bintang",
    oneStar: "1 Bintang",
    newest: "Terbaru",
    mostHelpful: "Paling Membantu",
    highRating: "Rating Tertinggi",
    scraping: "Scraping...",
    scrapeReviews: "Scrape Reviews",
    collected: "Berhasil mengumpulkan",
    reviews: "reviews",
    error: "Error",
    downloadCsv: "Unduh CSV",
    ratingDistribution: "Distribusi Rating",
    avgRating: "Rating Rata-rata",
    showPreview: "Tampilkan Preview",
    hidePreview: "Tutup Preview",
    // New search-related translations
    inputMode: "Mode Input",
    searchByName: "Cari Nama App",
    directInput: "Input Langsung",
    searchPlaceholder: "Ketik nama app, contoh: TikTok",
    selectApp: "Pilih aplikasi dari hasil",
    searching: "Mencari...",
    noResults: "Tidak ada hasil ditemukan",
    searchResults: "Hasil Pencarian",
  },
  en: {
    title: "Play Store Reviews Analysis",
    subtitle: "Scraping & sentiment analysis of app reviews",
    dataCollection: "Data Collection",
    appId: "App ID / Package Name",
    appIdPlaceholder: "e.g: com.whatsapp or com.instagram.android",
    reviewCount: "Number of Reviews",
    filterRating: "Filter Rating",
    sortBy: "Sort By",
    allRatings: "All Ratings",
    fiveStars: "5 Stars",
    fourStars: "4 Stars",
    threeStars: "3 Stars",
    twoStars: "2 Stars",
    oneStar: "1 Star",
    newest: "Newest",
    mostHelpful: "Most Helpful",
    highRating: "Highest Rating",
    scraping: "Scraping...",
    scrapeReviews: "Scrape Reviews",
    collected: "Successfully collected",
    reviews: "reviews",
    error: "Error",
    downloadCsv: "Download CSV",
    ratingDistribution: "Rating Distribution",
    avgRating: "Average Rating",
    showPreview: "Show Preview",
    hidePreview: "Hide Preview",
    // New search-related translations
    inputMode: "Input Mode",
    searchByName: "Search App Name",
    directInput: "Direct Input",
    searchPlaceholder: "Type app name, e.g: TikTok",
    selectApp: "Select app from results",
    searching: "Searching...",
    noResults: "No results found",
    searchResults: "Search Results",
  },
};

interface ScrapeResult {
  ok: boolean;
  jobId?: string;
  count?: number;
  appwriteFileId?: string;
  appwriteUrl?: string;
  preview?: Record<string, unknown>[];
  stats?: {
    avgRating: number;
    ratingDistribution: Record<string, number>;
  };
  error?: string;
}

interface AppSearchResult {
  appId: string;
  title: string;
  icon: string;
  scoreText: string;
  developer: string;
}

export default function PlayStorePage() {
  // Language
  const [lang, setLang] = useState<"id" | "en">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as "id" | "en") || 'id';
    }
    return 'id';
  });
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  // Dark Mode
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  // Form state
  const [appId, setAppId] = useState("");
  const [limit, setLimit] = useState(100);
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("newest");

  // Search state
  const [inputMode, setInputMode] = useState<"search" | "direct">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AppSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppSearchResult | null>(null);

  // Results
  const [scrapeRes, setScrapeRes] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Debounced search effect
  useEffect(() => {
    // Early return if not in search mode or empty query
    if (inputMode !== 'search' || !searchQuery.trim()) {
      // Schedule cleanup in next tick to avoid synchronous setState
      const cleanup = setTimeout(() => {
        setSearchResults([]);
        setShowResults(false);
      }, 0);
      return () => clearTimeout(cleanup);
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      setShowResults(true);
      
      try {
        const res = await fetch(`/api/search-playstore?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        
        if (data.ok) {
          setSearchResults(data.results || []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      }
      
      setSearchLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, inputMode]);

  // Styles
  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-500";
  const inputBg = dark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900";
  const subtleBg = dark ? "bg-slate-700" : "bg-gray-100";
  const borderColor = dark ? "border-slate-700" : "border-gray-100";

  async function runScrape() {
    if (!appId.trim()) {
      alert(lang === "id" ? "App ID wajib diisi" : "App ID is required");
      return;
    }

    setLoading(true);
    setScrapeRes(null);

    try {
      const res = await fetch("/api/scrape-playstore", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          appId: appId.trim(),
          limit,
          rating,
          sort,
          lang,
        }),
      });

      const data = await res.json();
      setScrapeRes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setScrapeRes({ ok: false, error: message });
    }

    setLoading(false);
  }

  return (
    <div className={`min-h-screen py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Link href="/">
              <button
                className={`p-2 rounded-lg border transition-colors ${cardBg} hover:bg-opacity-80`}
                title={lang === "id" ? "Kembali" : "Back"}
              >
                <ArrowLeft size={16} className={textSecondary} />
              </button>
            </Link>
            <div>
              <h1 className={`text-2xl font-semibold ${textPrimary}`}>{t.title}</h1>
              <p className={`text-sm mt-1 ${textSecondary}`}>{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg border transition-colors ${cardBg}`}
              title={dark ? "Light Mode" : "Dark Mode"}
            >
              {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className={textSecondary} />}
            </button>
            <button
              onClick={() => setLang(lang === "id" ? "en" : "id")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${cardBg} ${textPrimary}`}
            >
              <Globe size={14} />
              <span>{lang === "id" ? "EN" : "ID"}</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className={`rounded-xl p-6 mb-4 border ${cardBg}`}>
          <div className={`flex items-center gap-3 mb-5 pb-4 border-b ${borderColor}`}>
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <h2 className={`text-base font-semibold ${textPrimary}`}>{t.dataCollection}</h2>
          </div>

          <div className="space-y-4">
            {/* Input Mode Toggle */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>{t.inputMode}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setInputMode("search");
                    setAppId("");
                    setSelectedApp(null);
                  }}
                  className={`flex-1 h-10 px-4 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    inputMode === "search"
                      ? "bg-green-600 text-white border-green-600"
                      : `${inputBg} ${textPrimary} hover:bg-opacity-80`
                  }`}
                >
                  <Search size={16} />
                  {t.searchByName}
                </button>
                <button
                  onClick={() => {
                    setInputMode("direct");
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                    setSelectedApp(null);
                  }}
                  className={`flex-1 h-10 px-4 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    inputMode === "direct"
                      ? "bg-green-600 text-white border-green-600"
                      : `${inputBg} ${textPrimary} hover:bg-opacity-80`
                  }`}
                >
                  <Package size={16} />
                  {t.directInput}
                </button>
              </div>
            </div>

            {/* Search Mode UI */}
            {inputMode === "search" && (
              <div className="relative">
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.searchByName}</label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
                  placeholder={t.searchPlaceholder}
                />
                
                {/* Selected App Display */}
                {selectedApp && (
                  <div className={`mt-2 p-3 rounded-lg border ${dark ? "bg-slate-700 border-slate-600" : "bg-green-50 border-green-200"}`}>
                    <div className="flex items-center gap-3">
                      <img src={selectedApp.icon} alt={selectedApp.title} className="w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${textPrimary}`}>{selectedApp.title}</div>
                        <div className={`text-xs ${textSecondary}`}>{selectedApp.appId}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedApp(null);
                          setAppId("");
                        }}
                        className={`px-3 py-1 text-xs rounded-lg ${dark ? "bg-slate-600 hover:bg-slate-500" : "bg-gray-200 hover:bg-gray-300"} ${textPrimary}`}
                      >
                        ✕ {lang === "id" ? "Ganti" : "Change"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Search Results Dropdown */}
                {showResults && !selectedApp && (
                  <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-80 overflow-y-auto ${cardBg}`}>
                    {searchLoading && (
                      <div className="p-4 text-center">
                        <div className={`text-sm ${textSecondary}`}>{t.searching}</div>
                      </div>
                    )}
                    
                    {!searchLoading && searchResults.length === 0 && (
                      <div className="p-4 text-center">
                        <div className={`text-sm ${textSecondary}`}>{t.noResults}</div>
                      </div>
                    )}
                    
                    {!searchLoading && searchResults.length > 0 && (
                      <>
                        <div className={`px-3 py-2 text-xs font-semibold ${textSecondary} border-b ${borderColor}`}>
                          {t.searchResults} ({searchResults.length})
                        </div>
                        {searchResults.map((app, index) => (
                          <div
                            key={app.appId + index}
                            onClick={() => {
                              setSelectedApp(app);
                              setAppId(app.appId);
                              setShowResults(false);
                            }}
                            className={`p-3 cursor-pointer hover:bg-opacity-50 ${dark ? "hover:bg-slate-700" : "hover:bg-gray-100"} ${
                              index < searchResults.length - 1 ? `border-b ${borderColor}` : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={app.icon} alt={app.title} className="w-12 h-12 rounded-lg" />
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-semibold ${textPrimary} truncate`}>{app.title}</div>
                                <div className={`text-xs ${textSecondary} truncate`}>{app.appId}</div>
                                <div className={`text-xs ${textSecondary} mt-0.5`}>
                                  ⭐ {app.scoreText} • {app.developer}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Direct Input Mode UI */}
            {inputMode === "direct" && (
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.appId}</label>
                <input
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
                  placeholder={t.appIdPlaceholder}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>
                {t.reviewCount}: {limit}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={limit}
                onChange={(e) => setLimit(+e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span>500</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.filterRating}</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
                >
                  <option value="all">{t.allRatings}</option>
                  <option value="5">{t.fiveStars}</option>
                  <option value="4">{t.fourStars}</option>
                  <option value="3">{t.threeStars}</option>
                  <option value="2">{t.twoStars}</option>
                  <option value="1">{t.oneStar}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.sortBy}</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
                >
                  <option value="newest">{t.newest}</option>
                  <option value="rating">{t.highRating}</option>
                  <option value="helpful">{t.mostHelpful}</option>
                </select>
              </div>
            </div>

            <button
              onClick={runScrape}
              disabled={loading}
              className="w-full h-11 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShoppingBag size={16} />}
              <span>{loading ? t.scraping : t.scrapeReviews}</span>
            </button>
          </div>

          {scrapeRes && (
            <div className="mt-4 space-y-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${scrapeRes.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {scrapeRes.ok ? <Check size={16} /> : <X size={16} />}
                <span>{scrapeRes.ok ? `${t.collected} ${scrapeRes.count?.toLocaleString()} ${t.reviews}` : `${t.error}: ${scrapeRes.error}`}</span>
              </div>

              {scrapeRes.ok && scrapeRes.stats && (
                <>
                  {/* Stats */}
                  <div className={`p-4 rounded-lg ${subtleBg}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${textPrimary}`}>{t.avgRating}:</span>
                      <span className={`text-2xl font-bold ${textPrimary}`}>
                        ⭐ {scrapeRes.stats.avgRating}
                      </span>
                    </div>

                    {/* Rating Distribution Chart */}
                    <div className="mt-4">
                      <h4 className={`text-sm font-semibold mb-3 ${textPrimary}`}>{t.ratingDistribution}</h4>
                      <RatingChart
                        data={scrapeRes.stats.ratingDistribution}
                        dark={dark}
                      />
                    </div>
                  </div>

                  {/* Preview Toggle */}
                  {scrapeRes.preview && scrapeRes.preview.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`w-full h-10 px-4 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${dark ? "bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600" : "bg-white hover:bg-gray-50 text-gray-900 border-gray-300"}`}
                      >
                        <span>{showPreview ? t.hidePreview : t.showPreview}</span>
                        <span>{showPreview ? "▲" : "▼"}</span>
                      </button>

                      {showPreview && (
                        <DataTable
                          data={scrapeRes.preview}
                          dark={dark}
                          textPrimary={textPrimary}
                          textSecondary={textSecondary}
                          cardBg={cardBg}
                          inputBg={inputBg}
                          borderColor={borderColor}
                          subtleBg={subtleBg}
                        />
                      )}
                    </>
                  )}

                  {/* Download Button */}
                  <div className={`flex justify-center pt-4 border-t ${borderColor}`}>
                    <a
                      href={scrapeRes.appwriteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Download size={14} />
                      <span>{t.downloadCsv}</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingChart({ 
  data, 
  dark 
}: { 
  data: Record<string, number>; 
  dark: boolean; 
}) {
  const chartData = Object.keys(data).sort().map(key => ({
    rating: `${key} ⭐`,
    count: data[key],
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={dark ? "#334155" : "#e5e7eb"}
          />
          <XAxis 
            dataKey="rating" 
            stroke={dark ? "#94a3b8" : "#6b7280"}
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke={dark ? "#94a3b8" : "#6b7280"}
            style={{ fontSize: "12px" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: dark ? "#1e293b" : "#ffffff",
              border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: dark ? "#f1f5f9" : "#1f2937"
            }}
          />
          <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DataTable({
  data,
  dark,
  textPrimary,
  textSecondary,
  cardBg,
  inputBg,
  borderColor,
  subtleBg,
}: {
  data: Record<string, unknown>[];
  dark: boolean;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  inputBg: string;
  borderColor: string;
  subtleBg: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return columns.some((col) => {
      const value = String(row[col] ?? "").toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedData = filteredData.slice(startIdx, endIdx);

  return (
    <div className={`rounded-lg mt-4 ${cardBg} border`}>
      <div className="p-4 border-b ${borderColor}">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h4 className={`text-sm font-semibold ${textPrimary}`}>📊 Preview Data ({filteredData.length} records)</h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`h-8 px-3 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
            />
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`h-8 px-2 text-xs rounded-lg border focus:outline-none ${inputBg}`}
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className={`${subtleBg} sticky top-0`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`px-4 py-2 text-left font-semibold ${textPrimary}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className={`${dark ? "hover:bg-slate-700" : "hover:bg-gray-50"} ${idx % 2 === 0 ? "" : dark ? "bg-slate-800/50" : "bg-gray-50/50"}`}
              >
                {columns.map((col) => (
                  <td key={col} className={`px-4 py-2 ${textSecondary}`}>
                    <div className="max-w-xs truncate" title={String(row[col] ?? "")}>
                      {String(row[col] ?? "")}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`p-4 border-t ${borderColor} flex items-center justify-between text-xs`}>
        <div className={textSecondary}>
          Showing {startIdx + 1}-{Math.min(endIdx, filteredData.length)} of {filteredData.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"} ${inputBg}`}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded border ${currentPage === page ? dark ? "bg-green-600 text-white" : "bg-green-500 text-white" : inputBg}`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"} ${inputBg}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
