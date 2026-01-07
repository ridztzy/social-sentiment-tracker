"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Download, Check, X, ArrowLeft, Globe, Moon, Sun, Search, Package } from "lucide-react";
import { ScrapeResult, AppSearchResult } from "./types";
import { translations } from "./translations";
import RatingChart from "./components/RatingChart";
import DataTable from "./components/DataTable";

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

    const payload = {
      appId: appId.trim(),
      limit,
      rating,
      sort,
      lang,
    };

    try {
      // Call backend API directly
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      
      if (!backendUrl) {
        const warning = lang === "id"
          ? "⚠️ NEXT_PUBLIC_BACKEND_URL tidak diset di .env.local\n\nTambahkan:\nNEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com"
          : "⚠️ NEXT_PUBLIC_BACKEND_URL not set in .env.local\n\nAdd:\nNEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com";
        setScrapeRes({ ok: false, error: warning });
        setLoading(false);
        return;
      }

      // In development (localhost): use proxy to avoid CORS
      // In production (Vercel): call backend directly (proxy doesn't work)
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const apiUrl = isLocalhost 
        ? '/backend-api/api/scrape-playstore'  // Use proxy in dev
        : `${backendUrl}/api/scrape-playstore`; // Direct call in production
      
      console.log('🔄 Calling backend API:', apiUrl);
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('📡 Backend response status:', res.status);
      const data = await res.json();
      
      console.log('📦 Backend data:', data);
      
      if (data.ok) {
        console.log('✅ Backend API success!');
        setScrapeRes(data);
      } else {
        throw new Error(data.error || 'Backend API failed');
      }
    } catch (error) {
      console.error('❌ Backend API failed:', error);
      const message = error instanceof Error ? error.message : "Unknown error";
      
      const debugInfo = lang === "id" 
        ? `\n\n💡 Kemungkinan penyebab:\n1. Backend server tidak running\n2. URL backend salah\n3. CORS issue\n4. Network error` 
        : `\n\n💡 Possible causes:\n1. Backend server not running\n2. Wrong backend URL\n3. CORS issue\n4. Network error`;
      
      setScrapeRes({ 
        ok: false, 
        error: `${lang === "id" ? "Error" : "Error"}: ${message}${debugInfo}`
      });
    }

    setLoading(false);
  }

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* Top row: Back button + Title | Dark/Lang buttons */}
          <div className="flex items-start justify-between mb-3 sm:mb-0">
            <div className="flex items-start gap-2 sm:gap-3 flex-1">
              <Link href="/">
                <button
                  className={`p-2 rounded-lg border transition-colors ${cardBg} hover:bg-opacity-80 active:scale-95`}
                  title={lang === "id" ? "Kembali" : "Back"}
                >
                  <ArrowLeft size={16} className={textSecondary} />
                </button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className={`text-lg sm:text-2xl font-semibold ${textPrimary}`}>{t.title}</h1>
                <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${textSecondary}`}>{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-lg border transition-colors ${cardBg} active:scale-95`}
                title={dark ? "Light Mode" : "Dark Mode"}
              >
                {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className={textSecondary} />}
              </button>
              <button
                onClick={() => setLang(lang === "id" ? "en" : "id")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${cardBg} ${textPrimary} active:scale-95`}
              >
                <Globe size={14} />
                <span>{lang === "id" ? "EN" : "ID"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className={`rounded-xl p-4 sm:p-6 mb-4 border ${cardBg}`}>
          <div className={`flex items-center gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b ${borderColor}`}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </div>
            <h2 className={`text-sm sm:text-base font-semibold ${textPrimary}`}>{t.dataCollection}</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Input Mode Toggle */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${textPrimary}`}>{t.inputMode}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setInputMode("search");
                    setAppId("");
                    setSelectedApp(null);
                  }}
                  className={`flex-1 h-10 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                    inputMode === "search"
                      ? "bg-green-600 text-white border-green-600"
                      : `${inputBg} ${textPrimary} hover:bg-opacity-80`
                  }`}
                >
                  <Search size={16} className="shrink-0" />
                  <span className="truncate">{t.searchByName}</span>
                </button>
                <button
                  onClick={() => {
                    setInputMode("direct");
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                    setSelectedApp(null);
                  }}
                  className={`flex-1 h-10 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                    inputMode === "direct"
                      ? "bg-green-600 text-white border-green-600"
                      : `${inputBg} ${textPrimary} hover:bg-opacity-80`
                  }`}
                >
                  <Package size={16} className="shrink-0" />
                  <span className="truncate">{t.directInput}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${textPrimary}`}>{t.filterRating}</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className={`w-full h-10 sm:h-11 px-3 text-xs sm:text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
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
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${textPrimary}`}>{t.sortBy}</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={`w-full h-10 sm:h-11 px-3 text-xs sm:text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
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
              className="w-full h-11 sm:h-12 bg-green-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 transition-transform"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShoppingBag size={18} />}
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
                    {scrapeRes.appwriteUrl ? (
                      // Download from Appwrite (backend)
                      <a
                        href={scrapeRes.appwriteUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="h-9 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:scale-95 transition-transform flex items-center gap-2"
                      >
                        <Download size={14} />
                        <span>{t.downloadCsv}</span>
                      </a>
                    ) : (
                      // No download URL available
                      <button
                        disabled
                        className="h-9 px-4 bg-gray-400 text-gray-200 text-sm font-medium rounded-lg cursor-not-allowed flex items-center gap-2"
                        title={lang === "id" ? "Data tidak tersedia" : "Data not available"}
                      >
                        <Download size={14} />
                        <span>{lang === "id" ? "Download Tidak Tersedia" : "Download Unavailable"}</span>
                      </button>
                    )}
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


