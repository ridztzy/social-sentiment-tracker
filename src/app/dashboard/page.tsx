"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Upload, 
  FileText, 
  BarChart3, 
  Sparkles,
  Globe,
  Moon,
  Sun,
  ShoppingBag
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { mockRecentJobs } from '@/lib/mockData';
import type { DataJob } from '@/lib/types';

export default function DashboardPage() {
  // Language & Dark Mode (same as playstore page)
  const [lang, setLang] = useState<"id" | "en">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as "id" | "en") || 'id';
    }
    return 'id';
  });

  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  const [recentJobs] = useState<DataJob[]>(mockRecentJobs);

  const t = {
    id: {
      title: "Data Mining Workflow",
      subtitle: "Platform user-friendly untuk analisis sentimen",
      quickActions: "Aksi Cepat",
      recentJobs: "Aktivitas Terbaru",
      scrapeData: "Scrape Data",
      scrapeDesc: "Ambil data dari Play Store",
      uploadData: "Upload CSV",
      uploadDesc: "Upload file CSV Anda",
      analyzeData: "Analisis Sentimen",
      analyzeDesc: "Analisis sentiment ulasan",
      tryModel: "Coba Model",
      tryModelDesc: "Prediksi text baru",
      noJobs: "Belum ada aktivitas",
      viewAll: "Lihat Semua"
    },
    en: {
      title: "Data Mining Workflow",
      subtitle: "User-friendly platform for sentiment analysis",
      quickActions: "Quick Actions",
      recentJobs: "Recent Activity",
      scrapeData: "Scrape Data",
      scrapeDesc: "Get data from Play Store",
      uploadData: "Upload CSV",
      uploadDesc: "Upload your CSV file",
      analyzeData: "Analyze Sentiment",
      analyzeDesc: "Analyze review sentiment",
      tryModel: "Try Model",
      tryModelDesc: "Predict new text",
      noJobs: "No activity yet",
      viewAll: "View All"
    }
  };

  const text = t[lang];

  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-500";

  const quickActions = [
    {
      title: text.scrapeData,
      desc: text.scrapeDesc,
      icon: <ShoppingBag size={24} />,
      color: 'green' as const,
      href: '/playstore'
    },
    {
      title: text.uploadData,
      desc: text.uploadDesc,
      icon: <Upload size={24} />,
      color: 'blue' as const,
      href: '/upload'
    },
    {
      title: text.analyzeData,
      desc: text.analyzeDesc,
      icon: <BarChart3 size={24} />,
      color: 'purple' as const,
      href: '/analyze'
    },
    {
      title: text.tryModel,
      desc: text.tryModelDesc,
      icon: <Sparkles size={24} />,
      color: 'yellow' as const,
      href: '/predict'
    }
  ];

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
                {text.title}
              </h1>
              <p className={`text-base ${textSecondary}`}>
                {text.subtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-lg border transition-colors ${cardBg} active:scale-95`}
                title={dark ? "Light Mode" : "Dark Mode"}
              >
                {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className={textSecondary} />}
              </button>
              <button
                onClick={() => setLang(lang === "id" ? "en" : "id")}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${cardBg} ${textPrimary} active:scale-95`}
              >
                <Globe size={16} />
                <span className="font-medium">{lang === "id" ? "EN" : "ID"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>
            {text.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href}>
                <div className={`
                  ${cardBg} border rounded-xl p-6 
                  hover:shadow-lg hover:scale-105 transition-all cursor-pointer
                  active:scale-100
                `}>
                  <div className={`
                    inline-flex p-3 rounded-lg mb-4
                    ${action.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : ''}
                    ${action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
                    ${action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : ''}
                    ${action.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : ''}
                  `}>
                    {action.icon}
                  </div>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${textSecondary}`}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              {text.recentJobs}
            </h2>
            {recentJobs.length > 0 && (
              <button className="text-sm text-green-600 dark:text-green-400 hover:underline">
                {text.viewAll}
              </button>
            )}
          </div>

          {recentJobs.length === 0 ? (
            <div className={`${cardBg} border rounded-xl p-12 text-center`}>
              <Database size={48} className={`mx-auto mb-4 ${textSecondary}`} />
              <p className={`text-base ${textSecondary}`}>
                {text.noJobs}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className={`${cardBg} border rounded-xl p-4 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        p-2 rounded-lg
                        ${job.type === 'scraping' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : ''}
                        ${job.type === 'upload' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
                        ${job.type === 'analysis' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : ''}
                      `}>
                        {job.type === 'scraping' && <ShoppingBag size={20} />}
                        {job.type === 'upload' && <Upload size={20} />}
                        {job.type === 'analysis' && <BarChart3 size={20} />}
                      </div>
                      <div>
                        <h3 className={`font-medium ${textPrimary}`}>
                          {job.name}
                        </h3>
                        <p className={`text-sm ${textSecondary}`}>
                          {job.dataCount} rows • {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${job.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : ''}
                        ${job.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : ''}
                        ${job.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : ''}
                      `}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
