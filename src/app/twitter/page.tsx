"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Zap, Download, Check, X, Terminal, Globe, Moon, Sun, BarChart3, PieChart, History, Calendar, Trash2, ArrowLeft } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

// Translations
const translations = {
  id: {
    title: "Analisis Sentimen Twitter",
    subtitle: "Kumpulkan tweet, proses data, dan analisis sentimen",
    dataCollection: "Pengumpulan Data",
    authToken: "Token Autentikasi",
    authTokenPlaceholder: "Masukkan token auth Twitter",
    searchKeyword: "Kata Kunci Pencarian",
    searchKeywordPlaceholder: "Contoh: banjir, gempa, aceh",
    startDate: "Tanggal Mulai",
    endDate: "Tanggal Akhir",
    language: "Bahasa Tweet",
    allLanguages: "Semua Bahasa",
    indonesian: "Indonesia",
    english: "Inggris",
    limit: "Batas",
    collecting: "Mengumpulkan...",
    collectData: "Kumpulkan Data",
    collected: "Berhasil mengumpulkan",
    tweets: "tweet",
    error: "Error",
    terminalLog: "Log Terminal",
    clear: "Hapus",
    processing: "Memproses...",
    dataProcessing: "Pemrosesan Data",
    job: "Job",
    textColumn: "Kolom Teks",
    stopwordRemoval: "Hapus Stopword",
    process: "Proses",
    input: "Input",
    output: "Output",
    empty: "Kosong",
    duplicates: "Duplikat",
    positive: "Positif",
    neutral: "Netral", 
    negative: "Negatif",
    downloadCsv: "Unduh CSV",
    availableColumns: "Kolom Tersedia",
    sentimentDistribution: "Distribusi Sentimen",
    chartView: "Tampilan Chart",
    pieChart: "Pie Chart",
    barChart: "Bar Chart",
    showPreview: "Tampilkan Preview",
    hidePreview: "Tutup Preview",
    jobHistory: "Riwayat Scraping",
    noHistory: "Belum ada riwayat scraping",
    searchHistory: "Cari keyword...",
    clearAll: "Hapus Semua",
    delete: "Hapus",
    download: "Download",
    jobs: "jobs",
    scrapingComplete: "Scraping Berhasil!",
    processingComplete: "Processing Selesai!",
    tweetsCollected: "tweets berhasil dikumpulkan untuk keyword",
    dataProcessed: "Data berhasil diproses",
    validTweets: "tweets valid",
    duplicatesRemoved: "duplikat dihapus",
  },
  en: {
    title: "Twitter Sentiment Analysis",
    subtitle: "Collect tweets, process data, and analyze sentiment",
    dataCollection: "Data Collection",
    authToken: "Auth Token",
    authTokenPlaceholder: "Enter Twitter auth token",
    searchKeyword: "Search Keyword",
    searchKeywordPlaceholder: "e.g: flood, earthquake, aceh",
    startDate: "Start Date",
    endDate: "End Date",
    language: "Tweet Language",
    allLanguages: "All Languages",
    indonesian: "Indonesian",
    english: "English",
    limit: "Limit",
    collecting: "Collecting...",
    collectData: "Collect Data",
    collected: "Successfully collected",
    tweets: "tweets",
    error: "Error",
    terminalLog: "Terminal Log",
    clear: "Clear",
    processing: "Processing...",
    dataProcessing: "Data Processing",
    job: "Job",
    textColumn: "Text Column",
    stopwordRemoval: "Stopword Removal",
    process: "Process",
    input: "Input",
    output: "Output",
    empty: "Empty",
    duplicates: "Duplicates",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    downloadCsv: "Download CSV",
    availableColumns: "Available Columns",
    sentimentDistribution: "Sentiment Distribution",
    chartView: "Chart View",
    pieChart: "Pie Chart",
    barChart: "Bar Chart",
    showPreview: "Show Preview",
    hidePreview: "Hide Preview",
    jobHistory: "Scraping History",
    noHistory: "No scraping history yet",
    searchHistory: "Search keyword...",
    clearAll: "Clear All",
    delete: "Delete",
    download: "Download",
    jobs: "jobs",
    scrapingComplete: "Scraping Complete!",
    processingComplete: "Processing Complete!",
    tweetsCollected: "tweets collected for keyword",
    dataProcessed: "Data processed successfully",
    validTweets: "valid tweets",
    duplicatesRemoved: "duplicates removed",
  },
};

interface ScrapeResult {
  ok: boolean;
  jobId?: string;
  count?: number;
  preview?: Record<string, unknown>[];
  appwriteFileId?: string;
  appwriteUrl?: string;
  error?: string;
}

interface JobHistory {
  jobId: string;
  keyword: string;
  date: string;
  count: number;
  appwriteFileId: string;
  appwriteUrl: string;
  status: "success" | "failed";
}

interface PreprocessResult {
  ok: boolean;
  jobId?: string;
  inputCount?: number;
  outputCount?: number;
  droppedEmpty?: number;
  droppedDup?: number;
  dist?: { Positif: number; Netral: number; Negatif: number };
  download?: string;
  appwriteUrl?: string;
  appwriteFileId?: string;
  preview?: Record<string, unknown>[];
  error?: string;
}


export default function Page() {
  const tokenRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // UI Language
  const [lang, setLang] = useState<"id" | "en">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as "id" | "en") || 'id';
    }
    return 'id';
  });
  const t = translations[lang];
  
  // Save language to localStorage
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
  
  // Save dark mode and apply to document
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);
  
  // Search form
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tweetLang, setTweetLang] = useState("id");
  const [limit, setLimit] = useState(500);
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [scrapeRes, setScrapeRes] = useState<ScrapeResult | null>(null);
  const [textCol, setTextCol] = useState("full_text");
  const [useStopwords, setUseStopwords] = useState(true);
  const [preRes, setPreRes] = useState<PreprocessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [showPreview, setShowPreview] = useState(false);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);

  // Load job history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('scrapingHistory');
    if (saved) {
      try {
        setJobHistory(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Notification helper
  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "twitter-sentiment",
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  };

  // Styles based on dark mode
  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-500";
  const inputBg = dark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900";
  const subtleBg = dark ? "bg-slate-700" : "bg-gray-100";
  const borderColor = dark ? "border-slate-700" : "border-gray-100";

  const buildSearchQuery = () => {
    let query = keyword.trim();
    if (startDate) query += ` since:${startDate}`;
    if (endDate) query += ` until:${endDate}`;
    if (tweetLang && tweetLang !== "all") query += ` lang:${tweetLang}`;
    return query;
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 10);
  };

  // Job History Functions
  const saveToHistory = (job: JobHistory) => {
    const history = [job, ...jobHistory]; // Add to beginning
    setJobHistory(history);
    localStorage.setItem('scrapingHistory', JSON.stringify(history));
  };

  const deleteJob = (jobId: string) => {
    const filtered = jobHistory.filter(j => j.jobId !== jobId);
    setJobHistory(filtered);
    localStorage.setItem('scrapingHistory', JSON.stringify(filtered));
  };

  const clearHistory = () => {
    if (confirm(lang === "id" ? "Hapus semua riwayat?" : "Clear all history?")) {
      setJobHistory([]);
      localStorage.removeItem('scrapingHistory');
    }
  };

  async function runScrape() {
    const token = tokenRef.current?.value ?? "";
    if (!token) return alert("Token wajib diisi");
    if (!keyword.trim()) return alert("Kata kunci wajib diisi");

    setLoading(true);
    setScrapeRes(null);
    setPreRes(null);
    setJobId(null);
    setLogs([]);
    
    const searchQuery = buildSearchQuery();
    addLog(`Query: ${searchQuery}`);
    addLog("Memulai proses scraping...");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          searchKeyword: searchQuery,
          limit,
          filename: "tweets.csv",
          tab: "LATEST",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.type === "log") addLog(json.data);
              else if (json.type === "result") {
                setScrapeRes(json.data);
                if (json.data?.ok) {
                  setJobId(json.data.jobId);
                  // Save to history
                  if (json.data.appwriteFileId && json.data.appwriteUrl) {
                    saveToHistory({
                      jobId: json.data.jobId,
                      keyword: searchQuery,
                      date: new Date().toISOString(),
                      count: json.data.count || 0,
                      appwriteFileId: json.data.appwriteFileId,
                      appwriteUrl: json.data.appwriteUrl,
                      status: "success"
                    });
                  }
                  
                  // Send notification
                  const message = `${json.data.count} ${t.tweetsCollected} "${searchQuery}"`;
                  sendNotification(t.scrapingComplete, message);
                }
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addLog(`Error: ${message}`);
      setScrapeRes({ ok: false, error: message });
    }

    setLoading(false);
    if (tokenRef.current) tokenRef.current.value = "";
  }

  async function runPreprocess() {
    if (!jobId) return;
    setLoading(true);
    setPreRes(null);
    addLog("Memulai preprocessing...");

    const url = `/api/preprocess?jobId=${encodeURIComponent(jobId)}&textCol=${encodeURIComponent(textCol)}&useStopwords=${useStopwords ? "1" : "0"}&dedup=1&dropEmpty=1`;
    const res = await fetch(url);
    const data = await res.json();
    setLoading(false);
    setPreRes(data);
    
    if (data.ok) {
      addLog(`Preprocessing selesai: ${data.outputCount} tweets diproses`);
      addLog(`Sentimen: +${data.dist?.Positif ?? 0} / ~${data.dist?.Netral ?? 0} / -${data.dist?.Negatif ?? 0}`);
      
      // Send notification
      const message = `${t.dataProcessed}. ${data.outputCount} ${t.validTweets}, ${data.droppedDup} ${t.duplicatesRemoved}`;
      sendNotification(t.processingComplete, message);
    } else {
      addLog(`Error preprocessing: ${data.error}`);
    }
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

        {/* Section 1: Data Collection */}
        <div className={`rounded-xl p-6 mb-4 border ${cardBg}`}>
          <div className={`flex items-center gap-3 mb-5 pb-4 border-b ${borderColor}`}>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search size={18} className="text-white" />
            </div>
            <h2 className={`text-base font-semibold ${textPrimary}`}>{t.dataCollection}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.authToken}</label>
              <input
                ref={tokenRef}
                type="password"
                className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                placeholder={t.authTokenPlaceholder}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.searchKeyword}</label>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                placeholder={t.searchKeywordPlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.startDate}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.endDate}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.language}</label>
                <select
                  value={tweetLang}
                  onChange={(e) => setTweetLang(e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                >
                  <option value="all">{t.allLanguages}</option>
                  <option value="id">{t.indonesian}</option>
                  <option value="en">{t.english}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>{t.limit}</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(+e.target.value)}
                  className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                  min={1}
                  max={5000}
                />
              </div>
            </div>

            <button
              onClick={runScrape}
              disabled={loading}
              className="w-full h-11 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
              <span>{loading ? t.collecting : t.collectData}</span>
            </button>
          </div>

          {scrapeRes && (
            <div className="mt-4 space-y-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${scrapeRes.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {scrapeRes.ok ? <Check size={16} /> : <X size={16} />}
                <span>{scrapeRes.ok ? `${t.collected} ${scrapeRes.count?.toLocaleString()} ${t.tweets}` : `${t.error}: ${scrapeRes.error}`}</span>
              </div>
              
              {scrapeRes.ok && scrapeRes.preview && scrapeRes.preview.length > 0 && (
                <>
                  {/* Preview Toggle Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`w-full h-10 px-4 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${dark ? "bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600" : "bg-white hover:bg-gray-50 text-gray-900 border-gray-300"}`}
                    >
                      <span>{showPreview ? t.hidePreview : t.showPreview}</span>
                      <span>{showPreview ? "▲" : "▼"}</span>
                    </button>
                  </div>
                  
                  {/* Data Preview Table */}
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
            </div>
          )}
        </div>

        {/* Terminal Log */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-xl mb-4 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800">
              <Terminal size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-400">{t.terminalLog}</span>
              <button onClick={() => setLogs([])} className="ml-auto text-xs text-gray-500 hover:text-gray-300">
                {t.clear}
              </button>
            </div>
            <div ref={terminalRef} className="p-4 max-h-48 overflow-y-auto font-mono text-xs leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className={log.includes("Error") || log.includes("[FAIL]") ? "text-red-400" : log.includes("selesai") || log.includes("[DONE]") ? "text-green-400" : "text-gray-300"}>
                  {log}
                </div>
              ))}
              {loading && <div className="text-gray-500 animate-pulse">{t.processing}</div>}
            </div>
          </div>
        )}

        {/* Section 2: Processing */}
        <div className={`rounded-xl p-6 mb-4 border ${cardBg}`}>
          <div className={`flex items-center gap-3 mb-5 pb-4 border-b ${borderColor}`}>
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <h2 className={`text-base font-semibold ${textPrimary}`}>{t.dataProcessing}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${subtleBg}`}>
              <span className={textSecondary}>{t.job}:</span>
              <code className="font-mono text-blue-500 font-medium">{jobId ?? "—"}</code>
            </div>

            <input
              value={textCol}
              onChange={(e) => setTextCol(e.target.value)}
              className={`h-9 w-36 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputBg}`}
              placeholder={t.textColumn}
            />

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useStopwords}
                onChange={(e) => setUseStopwords(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className={textPrimary}>{t.stopwordRemoval}</span>
            </label>

            <button
              onClick={runPreprocess}
              disabled={!jobId || loading}
              className="ml-auto h-9 px-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={14} />}
              <span>{loading ? t.processing : t.process}</span>
            </button>
          </div>

          {preRes?.ok && (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-5">
                <StatBox label={t.input} value={preRes.inputCount ?? 0} dark={dark} />
                <StatBox label={t.output} value={preRes.outputCount ?? 0} dark={dark} />
                <StatBox label={t.empty} value={preRes.droppedEmpty ?? 0} dark={dark} />
                <StatBox label={t.duplicates} value={preRes.droppedDup ?? 0} dark={dark} />
                <StatBox label={t.positive} value={preRes.dist?.Positif ?? 0} variant="green" dark={dark} />
                <StatBox label={t.neutral} value={preRes.dist?.Netral ?? 0} variant="blue" dark={dark} />
                <StatBox label={t.negative} value={preRes.dist?.Negatif ?? 0} variant="red" dark={dark} />
              </div>

              {/* Chart Visualization */}
              {preRes.dist && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-semibold ${textPrimary}`}>{t.sentimentDistribution}</h3>
                    <div className={`flex items-center gap-2 p-1 rounded-lg ${subtleBg}`}>
                      <button
                        onClick={() => setChartType("pie")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          chartType === "pie"
                            ? dark
                              ? "bg-slate-600 text-white"
                              : "bg-white text-gray-900 shadow-sm"
                            : textSecondary
                        }`}
                      >
                        <PieChart size={14} />
                        <span>{t.pieChart}</span>
                      </button>
                      <button
                        onClick={() => setChartType("bar")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          chartType === "bar"
                            ? dark
                              ? "bg-slate-600 text-white"
                              : "bg-white text-gray-900 shadow-sm"
                            : textSecondary
                        }`}
                      >
                        <BarChart3 size={14} />
                        <span>{t.barChart}</span>
                      </button>
                    </div>
                  </div>
                  
                  <SentimentChart
                    data={preRes.dist}
                    type={chartType}
                    dark={dark}
                    lang={lang}
                  />
                </div>
              )}

              <div className={`flex justify-center mt-5 pt-4 border-t ${borderColor}`}>
                <a
                  href={preRes.appwriteUrl || preRes.download}
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

        {/* Job History Section */}
        {jobHistory.length > 0 && (
          <JobHistoryPanel
            history={jobHistory}
            onDelete={deleteJob}
            onClear={clearHistory}
            dark={dark}
            lang={lang}
            t={t}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            cardBg={cardBg}
            inputBg={inputBg}
            borderColor={borderColor}
            subtleBg={subtleBg}
          />
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, variant, dark }: { label: string; value: number; variant?: "green" | "blue" | "red"; dark: boolean }) {
  let bg = dark ? "bg-slate-700" : "bg-gray-50";
  let textColor = dark ? "text-slate-100" : "text-gray-900";
  
  if (variant === "green") {
    bg = dark ? "bg-green-900/50" : "bg-green-50";
    textColor = "text-green-500";
  } else if (variant === "blue") {
    bg = dark ? "bg-blue-900/50" : "bg-blue-50";
    textColor = "text-blue-500";
  } else if (variant === "red") {
    bg = dark ? "bg-red-900/50" : "bg-red-50";
    textColor = "text-red-500";
  }

  return (
    <div className={`${bg} rounded-lg p-3 text-center`}>
      <div className={`text-[10px] font-medium uppercase tracking-wide ${dark ? "text-slate-400" : "text-gray-500"}`}>{label}</div>
      <div className={`text-lg font-semibold mt-0.5 ${textColor}`}>{value.toLocaleString()}</div>
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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  // Filter data based on search
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return columns.some((col) => {
      const value = String(row[col] ?? "").toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = String(a[sortColumn] ?? "");
    const bVal = String(b[sortColumn] ?? "");
    const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedData = sortedData.slice(startIdx, endIdx);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className={`rounded-lg mt-4 ${cardBg} border`}>
      {/* Header */}
      <div className="p-4 border-b ${borderColor}">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h4 className={`text-sm font-semibold ${textPrimary}`}>📊 Preview Data ({sortedData.length} records)</h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`h-8 px-3 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className={`${subtleBg} sticky top-0`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className={`px-4 py-2 text-left font-semibold cursor-pointer hover:bg-opacity-80 ${textPrimary}`}
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{col}</span>
                    {sortColumn === col && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
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

      {/* Pagination */}
      <div className={`p-4 border-t ${borderColor} flex items-center justify-between text-xs`}>
        <div className={textSecondary}>
          Showing {startIdx + 1}-{Math.min(endIdx, sortedData.length)} of {sortedData.length}
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
                className={`px-3 py-1 rounded border ${currentPage === page ? dark ? "bg-blue-600 text-white" : "bg-blue-500 text-white" : inputBg}`}
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

function JobHistoryPanel({
  history,
  onDelete,
  onClear,
  dark,
  lang,
  t,
  textPrimary,
  textSecondary,
  cardBg,
  inputBg,
  borderColor,
  subtleBg,
}: {
  history: JobHistory[];
  onDelete: (jobId: string) => void;
  onClear: () => void;
  dark: boolean;
  lang: "id" | "en";
  t: typeof translations.id;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  inputBg: string;
  borderColor: string;
  subtleBg: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter history by search term
  const filteredHistory = history.filter(job =>
    job.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString(lang === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className={`rounded-xl p-6 border mb-4 ${cardBg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 pb-4 border-b ${borderColor}`}>
        <h3 className={`text-base font-semibold flex items-center gap-2 ${textPrimary}`}>
          <History size={18} />
          {t.jobHistory} ({filteredHistory.length} {t.jobs})
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
        >
          <Trash2 size={14} />
          {t.clearAll}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t.searchHistory}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
        />
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <p className={`text-sm text-center py-8 ${textSecondary}`}>
            {searchTerm ? (lang === "id" ? "Tidak ditemukan" : "Not found") : t.noHistory}
          </p>
        ) : (
          filteredHistory.map(job => (
            <div
              key={job.jobId}
              className={`rounded-lg p-4 border ${dark ? "bg-slate-700/50 border-slate-600" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${textPrimary}`}>
                    {lang === "id" ? "Keyword" : "Keyword"}: &ldquo;{job.keyword}&rdquo;
                  </h4>
                  <div className={`flex items-center gap-4 mt-2 text-xs ${textSecondary} flex-wrap`}>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(job.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 size={12} />
                      {job.count.toLocaleString()} tweets
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Download Button */}
                  <a
                    href={job.appwriteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${dark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                  >
                    <Download size={14} />
                    {t.download}
                  </a>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(job.jobId)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${dark ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                  >
                    <Trash2 size={14} />
                    {t.delete}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SentimentChart({ 
  data, 
  type, 
  dark, 
  lang 
}: { 
  data: { Positif: number; Netral: number; Negatif: number }; 
  type: "pie" | "bar"; 
  dark: boolean; 
  lang: "id" | "en";
}) {
  const chartData = [
    { 
      name: lang === "id" ? "Positif" : "Positive", 
      value: data.Positif,
      fill: "#10b981"
    },
    { 
      name: lang === "id" ? "Netral" : "Neutral", 
      value: data.Netral,
      fill: "#3b82f6"
    },
    { 
      name: lang === "id" ? "Negatif" : "Negative", 
      value: data.Negatif,
      fill: "#ef4444"
    },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#ef4444"];

  if (type === "pie") {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: dark ? "#1e293b" : "#ffffff",
                border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
                borderRadius: "8px",
                color: dark ? "#f1f5f9" : "#1f2937"
              }}
            />
          </RechartsPie>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={dark ? "#334155" : "#e5e7eb"}
          />
          <XAxis 
            dataKey="name" 
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
          <Legend 
            wrapperStyle={{ 
              fontSize: "12px",
              color: dark ? "#f1f5f9" : "#1f2937"
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
