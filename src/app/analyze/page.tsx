"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Download, Sparkles, Globe, Moon, Sun } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import StatsCard from '@/components/StatsCard';
import DataTable from '../playstore/components/DataTable';
import api from '@/lib/api';
import type { SentimentAnalysisResult } from '@/lib/types';

export default function AnalyzePage() {
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

  const [result, setResult] = useState<SentimentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock data
    async function analyze() {
      try {
        const res = await api.analyzeSentiment(['sample text']);
        setResult(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    analyze();
  }, []);

  const t = {
    id: {
      title: "Analisis Sentimen",
      subtitle: "Hasil analisis sentiment dari data Anda",
      overview: "Ringkasan",
      total: "Total Data",
      positive: "Positif",
      negative: "Negatif",
      neutral: "Netral",
      distribution: "Distribusi Sentimen",
      download: "Unduh Hasil",
      tryPrediction: "Coba Prediksi Baru",
      dataPreview: "Preview Data"
    },
    en: {
      title: "Sentiment Analysis",
      subtitle: "Sentiment analysis results from your data",
      overview: "Overview",
      total: "Total Data",
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral",
      distribution: "Sentiment Distribution",
      download: "Download Results",
      tryPrediction: "Try New Prediction",
      dataPreview: "Data Preview"
    }
  };

  const text = t[lang];

  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-500";

  if (loading || !result) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className={textSecondary}>Loading...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: text.positive, value: result.stats.positive, color: '#10b981' },
    { name: text.negative, value: result.stats.negative, color: '#ef4444' },
    { name: text.neutral, value: result.stats.neutral, color: '#6b7280' }
  ];

  const barData = [
    { name: text.positive, count: result.stats.positive },
    { name: text.negative, count: result.stats.negative },
    { name: text.neutral, count: result.stats.neutral }
  ];

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <Link href="/preprocess">
                <button className={`p-2 rounded-lg border ${cardBg} hover:bg-opacity-80 active:scale-95`}>
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
              <button onClick={() => { const newLang = lang === "id" ? "en" : "id"; setLang(newLang); localStorage.setItem('language', newLang); }} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border ${cardBg} ${textPrimary} active:scale-95`}>
                <Globe size={14} />
                <span>{lang === "id" ? "EN" : "ID"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title={text.total}
            value={result.stats.total}
            icon={<BarChart3 size={24} />}
            color="blue"
          />
          <StatsCard
            title={text.positive}
            value={`${result.stats.distribution.positive}%`}
            subtitle={`${result.stats.positive} ${lang === "id" ? "data" : "items"}`}
            icon={<span>😊</span>}
            color="green"
          />
          <StatsCard
            title={text.negative}
            value={`${result.stats.distribution.negative}%`}
            subtitle={`${result.stats.negative} ${lang === "id" ? "data" : "items"}`}
            icon={<span>😢</span>}
            color="red"
          />
          <StatsCard
            title={text.neutral}
            value={`${result.stats.distribution.neutral}%`}
            subtitle={`${result.stats.neutral} ${lang === "id" ? "data" : "items"}`}
            icon={<span>😐</span>}
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className={`rounded-xl p-6 border ${cardBg}`}>
            <h3 className={`text-base font-semibold ${textPrimary} mb-4`}>{text.distribution} (Pie)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: dark ? "#1e293b" : "#ffffff", border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`, borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className={`rounded-xl p-6 border ${cardBg}`}>
            <h3 className={`text-base font-semibold ${textPrimary} mb-4`}>{text.distribution} (Bar)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#e5e7eb"} />
                <XAxis dataKey="name" stroke={dark ? "#94a3b8" : "#6b7280"} style={{ fontSize: "12px" }} />
                <YAxis stroke={dark ? "#94a3b8" : "#6b7280"} style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: dark ? "#1e293b" : "#ffffff", border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`, borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className={`rounded-xl p-6 mb-6 border ${cardBg}`}>
          <h3 className={`text-base font-semibold ${textPrimary} mb-4`}>{text.dataPreview}</h3>
          <DataTable
            data={result.preview.map((r, i) => ({
              No: i + 1,
              Sentiment: r.sentiment,
              Score: r.score.toFixed(2),
              Confidence: `${(r.confidence * 100).toFixed(1)}%`,
              Positive: r.positive.join(', ') || '-',
              Negative: r.negative.join(', ') || '-'
            }))}
            dark={dark}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            cardBg={cardBg}
            inputBg={dark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}
            borderColor={dark ? "border-slate-700" : "border-gray-100"}
            subtleBg={dark ? "bg-slate-700" : "bg-gray-100"}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className={`flex-1 h-11 px-4 text-sm font-medium rounded-lg border ${cardBg} ${textPrimary} hover:bg-opacity-80 flex items-center justify-center gap-2`}>
            <Download size={16} />
            <span>{text.download}</span>
          </button>
          <Link href="/predict" className="flex-1">
            <button className="w-full h-11 px-4 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
              <Sparkles size={16} />
              <span>{text.tryPrediction}</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
