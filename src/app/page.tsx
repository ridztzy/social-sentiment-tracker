"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Twitter, ShoppingBag, Newspaper, FileUp, Moon, Sun, ArrowRight, Globe } from "lucide-react";

// Translations
const translations = {
  id: {
    title: "Sentiment Analysis Platform",
    subtitle: "Pilih sumber data untuk scraping & analisis",
    twitterSentiment: "Twitter Sentiment",
    twitterDesc: "Analisis sentimen dari tweet real-time",
    playStoreReviews: "Play Store Reviews",
    playStoreDesc: "Scraping & analisis ulasan aplikasi Android",
    newsArticles: "News Articles",
    newsDesc: "Kumpulkan artikel berita dari berbagai sumber",
    uploadCSV: "Upload CSV",
    uploadDesc: "Upload dan proses file CSV custom",
    startScraping: "Mulai Scraping",
    comingSoon: "Coming Soon",
    platformFeatures: "Fitur Platform",
    realtimeScraping: "Real-time Scraping",
    realtimeDesc: "Kumpulkan data secara real-time dari berbagai platform",
    autoPreprocessing: "Auto Preprocessing",
    autoDesc: "Pembersihan data otomatis dan duplikat detection",
    dataVisualization: "Visualisasi Data",
    dataVizDesc: "Chart interaktif dan analisis sentimen komprehensif",
  },
  en: {
    title: "Sentiment Analysis Platform",
    subtitle: "Choose data source for scraping & analysis",
    twitterSentiment: "Twitter Sentiment",
    twitterDesc: "Analyze sentiment from real-time tweets",
    playStoreReviews: "Play Store Reviews",
    playStoreDesc: "Scraping & analysis of Android app reviews",
    newsArticles: "News Articles",
    newsDesc: "Collect news articles from various sources",
    uploadCSV: "Upload CSV",
    uploadDesc: "Upload and process custom CSV files",
    startScraping: "Start Scraping",
    comingSoon: "Coming Soon",
    platformFeatures: "Platform Features",
    realtimeScraping: "Real-time Scraping",
    realtimeDesc: "Collect data in real-time from multiple platforms",
    autoPreprocessing: "Auto Preprocessing",
    autoDesc: "Automatic data cleaning and duplicate detection",
    dataVisualization: "Data Visualization",
    dataVizDesc: "Interactive charts and comprehensive sentiment analysis",
  },
};

export default function HomePage() {
  // Dark Mode
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    }
    return false;
  });

  // Language
  const [lang, setLang] = useState<"id" | "en">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as "id" | "en") || 'id';
    }
    return 'id';
  });

  const t = translations[lang];

  // Save to localStorage when dark mode or language changes
  useEffect(() => {
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  const toggleDark = () => setDark(!dark);

  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-600";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const cardHover = dark ? "hover:bg-slate-700" : "hover:bg-gray-50";

  const scrapingSources = [
    {
      id: "twitter",
      name: t.twitterSentiment,
      description: t.twitterDesc,
      icon: Twitter,
      color: "bg-blue-500",
      href: "/twitter",
      available: true,
    },
    {
      id: "playstore",
      name: t.playStoreReviews,
      description: t.playStoreDesc,
      icon: ShoppingBag,
      color: "bg-green-500",
      href: "/playstore",
      available: true,
    },
    {
      id: "news",
      name: t.newsArticles,
      description: t.newsDesc,
      icon: Newspaper,
      color: "bg-orange-500",
      href: "#",
      available: false,
      comingSoon: true,
    },
    {
      id: "csv",
      name: t.uploadCSV,
      description: t.uploadDesc,
      icon: FileUp,
      color: "bg-purple-500",
      href: "#",
      available: false,
      comingSoon: true,
    },
  ];

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header - Same as Twitter page */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${textPrimary}`}>{t.title}</h1>
            <p className={`text-xs sm:text-sm mt-1 ${textSecondary}`}>{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
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

        {/* Cards Grid - 1 col on mobile, 2 cols on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {scrapingSources.map((source) => {
            const Icon = source.icon;
            const isClickable = source.available;

            const CardContent = (
              <div className={`relative rounded-xl p-4 sm:p-6 border transition-all duration-300 ${cardBg} ${isClickable ? cardHover + " cursor-pointer hover:shadow-md active:scale-[0.98]" : "opacity-60"}`}>
                {/* Coming Soon Badge */}
                {source.comingSoon && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${dark ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-600"}`}>
                      {t.comingSoon}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${source.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg font-semibold mb-1 ${textPrimary}`}>
                      {source.name}
                    </h3>
                    <p className={`text-xs sm:text-sm ${textSecondary} mb-2 sm:mb-3 line-clamp-2`}>
                      {source.description}
                    </p>

                    {isClickable && (
                      <div className="flex items-center gap-2 text-blue-500 text-xs sm:text-sm font-medium">
                        <span>{t.startScraping}</span>
                        <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );

            if (isClickable) {
              return (
                <Link key={source.id} href={source.href}>
                  {CardContent}
                </Link>
              );
            }

            return <div key={source.id}>{CardContent}</div>;
          })}
        </div>

        {/* Features Section */}
        <div className={`rounded-xl p-4 sm:p-6 border mb-4 ${cardBg}`}>
          <h3 className={`text-sm sm:text-base font-semibold mb-3 sm:mb-4 ${textPrimary}`}>
            ✨ {t.platformFeatures}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-xl sm:text-2xl">🚀</div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-xs sm:text-sm ${textPrimary}`}>{t.realtimeScraping}</h4>
                <p className={`text-xs mt-0.5 ${textSecondary}`}>
                  {t.realtimeDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl sm:text-2xl">🤖</div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-xs sm:text-sm ${textPrimary}`}>{t.autoPreprocessing}</h4>
                <p className={`text-xs mt-0.5 ${textSecondary}`}>
                  {t.autoDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl sm:text-2xl">📊</div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-xs sm:text-sm ${textPrimary}`}>{t.dataVisualization}</h4>
                <p className={`text-xs mt-0.5 ${textSecondary}`}>
                  {t.dataVizDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
