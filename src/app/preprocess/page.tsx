"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Globe, Moon, Sun, ArrowRight, Loader2 } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import api from '@/lib/api';
import type { PreprocessOptions, PreprocessResult } from '@/lib/types';

export default function PreprocessPage() {
  const [lang, setLang] = useState<"id" | "en">('id');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLang((localStorage.getItem('language') as "id" | "en") || 'id');
      setDark(localStorage.getItem('darkMode') === 'true');
    }
  }, []);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const [options, setOptions] = useState<PreprocessOptions>({
    removeStopwords: true,
    language: lang,
    lowercase: true,
    removeSpecialChars: true
  });

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PreprocessResult | null>(null);

  const t = {
    id: {
      title: "Preprocessing Data",
      subtitle: "Bersihkan dan siapkan data untuk analisis",
      options: "Opsi Preprocessing",
      removeStopwords: "Hapus Stopwords",
      lowercase: "Ubah ke Lowercase",
      removeSpecial: "Hapus Karakter Spesial",
      language: "Bahasa",
      preview: "Preview",
      before: "Sebelum",
      after: "Sesudah",
      process: "Proses Data",
      processing: "Memproses...",
      next: "Lanjut ke Analisis",
      stats: "Statistik"
    },
    en: {
      title: "Data Preprocessing",
      subtitle: "Clean and prepare data for analysis",
      options: "Preprocessing Options",
      removeStopwords: "Remove Stopwords",
      lowercase: "Convert to Lowercase",
      removeSpecial: "Remove Special Characters",
      language: "Language",
      preview: "Preview",
      before: "Before",
      after: "After",
      process: "Process Data",
      processing: "Processing...",
      next: "Continue to Analysis",
      stats: "Statistics"
    }
  };

  const text = t[lang];

  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-500";

  const handleProcess = async () => {
    setProcessing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 150);

    try {
      // Mock file for demo
      const mockFile = new File(["mock content"], "data.csv", { type: "text/csv" });
      const result = await api.preprocess(mockFile, options);
      
      setProgress(100);
      setResult(result);
      
      // Store for next page
      localStorage.setItem('preprocessedData', JSON.stringify(result));
    } catch (error) {
      console.error(error);
    } finally {
      clearInterval(progressInterval);
      setProcessing(false);
    }
  };

  const sampleBefore = "Aplikasi ini SANGAT bagus!!! Saya suka sekali!!!";
  const sampleAfter = options.removeSpecialChars 
    ? "aplikasi sangat bagus saya suka"
    : "aplikasi ini sangat bagus saya suka sekali";

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <Link href="/upload">
                <button className={`p-2 rounded-lg border transition-colors ${cardBg} hover:bg-opacity-80 active:scale-95`}>
                  <ArrowLeft size={16} className={textSecondary} />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className={`text-2xl font-semibold ${textPrimary}`}>{text.title}</h1>
                <p className={`text-sm mt-1 ${textSecondary}`}>{text.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg border ${cardBg} active:scale-95`}>
                {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className={textSecondary} />}
              </button>
              <button onClick={() => { const newLang = lang === "id" ? "en" : "id"; setLang(newLang); setOptions({...options, language: newLang}); localStorage.setItem('language', newLang); }} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border ${cardBg} ${textPrimary} active:scale-95`}>
                <Globe size={14} />
                <span>{lang === "id" ? "EN" : "ID"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Options */}
          <div className={`rounded-xl p-6 border ${cardBg}`}>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
              <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
                <Settings size={18} className="text-white" />
              </div>
              <h2 className={`text-base font-semibold ${textPrimary}`}>{text.options}</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-medium ${textPrimary}`}>{text.removeStopwords}</span>
                <input type="checkbox" checked={options.removeStopwords} onChange={(e) => setOptions({...options, removeStopwords: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-medium ${textPrimary}`}>{text.lowercase}</span>
                <input type="checkbox" checked={options.lowercase} onChange={(e) => setOptions({...options, lowercase: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-medium ${textPrimary}`}>{text.removeSpecial}</span>
                <input type="checkbox" checked={options.removeSpecialChars} onChange={(e) => setOptions({...options, removeSpecialChars: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              </label>

              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>{text.language}</label>
                <select value={options.language} onChange={(e) => setOptions({...options, language: e.target.value as 'id' | 'en'})} className={`w-full h-10 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${dark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}`}>
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className={`rounded-xl p-6 border ${cardBg}`}>
            <h3 className={`text-base font-semibold ${textPrimary} mb-4`}>{text.preview}</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium ${textSecondary} mb-2`}>{text.before}</label>
                <div className={`p-3 rounded-lg text-sm ${dark ? "bg-slate-700" : "bg-gray-100"} ${textPrimary}`}>
                  {sampleBefore}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight size={20} className={textSecondary} />
              </div>

              <div>
                <label className={`block text-xs font-medium ${textSecondary} mb-2`}>{text.after}</label>
                <div className={`p-3 rounded-lg text-sm ${dark ? "bg-purple-900/20 border border-purple-800" : "bg-purple-50 border border-purple-200"} text-purple-700 dark:text-purple-300`}>
                  {sampleAfter}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing */}
        {processing && (
          <div className={`rounded-xl p-6 mb-6 border ${cardBg}`}>
            <ProgressBar progress={progress} status={text.processing} color="purple" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`rounded-xl p-6 mb-6 border ${cardBg}`}>
            <h3 className={`text-base font-semibold ${textPrimary} mb-4`}>{text.stats}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.stats.totalRows}</div>
                <div className={`text-xs ${textSecondary} mt-1`}>Total Rows</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.stats.avgTextLength.original.toFixed(1)}</div>
                <div className={`text-xs ${textSecondary} mt-1`}>Avg Length (Before)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.stats.avgTextLength.cleaned.toFixed(1)}</div>
                <div className={`text-xs ${textSecondary} mt-1`}>Avg Length (After)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{((1 - result.stats.avgTextLength.cleaned / result.stats.avgTextLength.original) * 100).toFixed(0)}%</div>
                <div className={`text-xs ${textSecondary} mt-1`}>Reduction</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/upload" className="flex-1">
            <button className={`w-full h-11 px-4 text-sm font-medium rounded-lg border ${cardBg} ${textPrimary} hover:bg-opacity-80`}>
              {lang === "id" ? "Kembali" : "Back"}
            </button>
          </Link>
          {!result ? (
            <button onClick={handleProcess} disabled={processing} className={`flex-1 h-11 px-4 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 flex items-center justify-center gap-2`}>
              {processing && <Loader2 size={16} className="animate-spin" />}
              <span>{text.process}</span>
            </button>
          ) : (
            <Link href="/analyze" className="flex-1">
              <button className="w-full h-11 px-4 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                <span>{text.next}</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
