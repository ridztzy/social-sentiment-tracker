"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Globe, Moon, Sun, Send, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import type { PredictionResult } from '@/lib/types';

export default function PredictPage() {
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

  const [text, setText] = useState('');
  const [preprocess, setPreprocess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const translations = {
    id: {
      title: "Prediksi Sentimen",
      subtitle: "Coba model dengan text baru",
      inputLabel: "Masukkan Text",
      placeholder: "Contoh: Aplikasi ini sangat bagus dan membantu!",
      preprocess: "Preprocessing Otomatis",
      predict: "Prediksi",
      predicting: "Memprediksi...",
      result: "Hasil Prediksi",
      sentiment: "Sentimen",
      score: "Score",
      confidence: "Confidence",
      processedText: "Text Setelah Preprocessing",
      tryAnother: "Coba Lagi",
      examples: "Contoh Text"
    },
    en: {
      title: "Sentiment Prediction",
      subtitle: "Try model with new text",
      inputLabel: "Enter Text",
      placeholder: "Example: This app is very good and helpful!",
      preprocess: "Auto Preprocessing",
      predict: "Predict",
      predicting: "Predicting...",
      result: "Prediction Result",
      sentiment: "Sentiment",
      score: "Score",
      confidence: "Confidence",
      processedText: "Preprocessed Text",
      tryAnother: "Try Again",
      examples: "Example Texts"
    }
  };

  const t = translations[lang];

  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-500";

  const exampleTexts = lang === "id" ? [
    "Aplikasi ini sangat bagus dan membantu!",
    "Aplikasi jelek, sering error dan lambat.",
    "Biasa saja, tidak terlalu istimewa."
  ] : [
    "This app is very good and helpful!",
    "Bad app, often crashes and slow.",
    "Just okay, nothing special."
  ];

  const handlePredict = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await api.predict({ text, preprocess });
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'Positive') return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500';
    if (sentiment === 'Negative') return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500';
    return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-500';
  };

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <Link href="/analyze">
                <button className={`p-2 rounded-lg border ${cardBg} hover:bg-opacity-80 active:scale-95`}>
                  <ArrowLeft size={16} className={textSecondary} />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className={`text-2xl font-semibold ${textPrimary}`}>{t.title}</h1>
                <p className={`text-sm mt-1 ${textSecondary}`}>{t.subtitle}</p>
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

        {/* Input Form */}
        <div className={`rounded-xl p-6 mb-6 border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <h2 className={`text-base font-semibold ${textPrimary}`}>{t.inputLabel}</h2>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            rows={5}
            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${dark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}`}
          />

          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preprocess}
                onChange={(e) => setPreprocess(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className={`text-sm ${textPrimary}`}>{t.preprocess}</span>
            </label>

            <button
              onClick={handlePredict}
              disabled={loading || !text.trim()}
              className={`
                h-10 px-6 rounded-lg font-medium text-sm transition-all
                ${loading || !text.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
                }
                flex items-center gap-2
              `}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.predicting}</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{t.predict}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Example Texts */}
        <div className={`rounded-xl p-6 mb-6 border ${cardBg}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>{t.examples}</h3>
          <div className="space-y-2">
            {exampleTexts.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setText(example)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${dark ? "border-slate-700 hover:bg-slate-700" : "border-gray-200 hover:bg-gray-50"}`}
              >
                <p className={`text-sm ${textPrimary}`}>{example}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-6 border ${cardBg}`}>
            <h3 className={`text-base font-semibold ${textPrimary} mb-4`}>{t.result}</h3>
            
            {/* Sentiment Badge */}
            <div className="mb-6">
              <label className={`block text-xs font-medium ${textSecondary} mb-2`}>{t.sentiment}</label>
              <div className={`inline-block px-6 py-3 rounded-full border-2 ${getSentimentColor(result.prediction.sentiment)}`}>
                <span className="text-lg font-bold">{result.prediction.sentiment}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-xs font-medium ${textSecondary} mb-2`}>{t.score}</label>
                <div className={`p-4 rounded-lg ${dark ? "bg-slate-700" : "bg-gray-100"}`}>
                  <span className={`text-2xl font-bold ${textPrimary}`}>{result.prediction.score.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium ${textSecondary} mb-2`}>{t.confidence}</label>
                <div className={`p-4 rounded-lg ${dark ? "bg-slate-700" : "bg-gray-100"}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${result.prediction.confidence * 100}%` }} />
                    </div>
                    <span className={`text-sm font-medium ${textPrimary}`}>{(result.prediction.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Processed Text */}
            {result.input.processed !== result.input.original && (
              <div>
                <label className={`block text-xs font-medium ${textSecondary} mb-2`}>{t.processedText}</label>
                <div className={`p-4 rounded-lg text-sm ${dark ? "bg-slate-700" : "bg-gray-100"} ${textPrimary}`}>
                  {result.input.processed}
                </div>
              </div>
            )}

            {/* Try Again Button */}
            <button
              onClick={() => {
                setText('');
                setResult(null);
              }}
              className="w-full mt-6 h-11 px-4 text-sm font-medium rounded-lg border border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              {t.tryAnother}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
