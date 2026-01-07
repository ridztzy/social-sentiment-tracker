"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileUp, Database, Globe, Moon, Sun, ArrowRight } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { mockRecentJobs } from '@/lib/mockData';
import type { DataJob } from '@/lib/types';

export default function UploadPage() {
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

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedJob, setSelectedJob] = useState<DataJob | null>(null);
  const [recentJobs] = useState<DataJob[]>(mockRecentJobs);

  const t = {
    id: {
      title: "Upload Data",
      subtitle: "Upload file CSV atau pilih dari hasil scraping",
      uploadNew: "Upload File Baru",
      selectExisting: "Pilih dari Data Sebelumnya",
      fileSelected: "File dipilih",
      dataSelected: "Data dipilih",
      next: "Lanjut ke Preprocessing",
      cancel: "Batal",
      noRecentData: "Belum ada data tersimpan"
    },
    en: {
      title: "Upload Data",
      subtitle: "Upload CSV file or select from scraping results",
      uploadNew: "Upload New File",
      selectExisting: "Select from Previous Data",
      fileSelected: "File selected",
      dataSelected: "Data selected",
      next: "Continue to Preprocessing",
      cancel: "Cancel",
      noRecentData: "No saved data yet"
    }
  };

  const text = t[lang];

  const bg = dark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = dark ? "text-slate-100" : "text-gray-900";
  const textSecondary = dark ? "text-slate-400" : "text-gray-500";

  const handleProceed = () => {
    // Store selected data in localStorage for next page
    if (uploadedFile) {
      localStorage.setItem('currentData', JSON.stringify({
        source: 'upload',
        fileName: uploadedFile.name
      }));
    } else if (selectedJob) {
      localStorage.setItem('currentData', JSON.stringify({
        source: 'scraping',
        jobId: selectedJob.id,
        jobName: selectedJob.name
      }));
    }
    
    // Navigate to preprocess page
    window.location.href = '/preprocess';
  };

  const canProceed = uploadedFile !== null || selectedJob !== null;

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 transition-colors duration-300 ${bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <Link href="/dashboard">
                <button
                  className={`p-2 rounded-lg border transition-colors ${cardBg} hover:bg-opacity-80 active:scale-95`}
                  title={lang === "id" ? "Kembali" : "Back"}
                >
                  <ArrowLeft size={16} className={textSecondary} />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className={`text-2xl font-semibold ${textPrimary}`}>{text.title}</h1>
                <p className={`text-sm mt-1 ${textSecondary}`}>{text.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-lg border transition-colors ${cardBg} active:scale-95`}
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

        {/* Upload Section */}
        <div className={`rounded-xl p-6 mb-6 border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileUp size={18} className="text-white" />
            </div>
            <h2 className={`text-base font-semibold ${textPrimary}`}>{text.uploadNew}</h2>
          </div>

          <FileUpload
            onFileSelect={(file) => {
              setUploadedFile(file);
              setSelectedJob(null); // Clear selection from previous data
            }}
            disabled={selectedJob !== null}
          />

          {uploadedFile && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <FileUp size={16} className="text-blue-600 dark:text-blue-400" />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  {text.fileSelected}: {uploadedFile.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* OR Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${bg} ${textSecondary}`}>OR</span>
          </div>
        </div>

        {/* Select from Recent */}
        <div className={`rounded-xl p-6 mb-6 border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <h2 className={`text-base font-semibold ${textPrimary}`}>{text.selectExisting}</h2>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Database size={40} className={`mx-auto mb-3 ${textSecondary}`} />
              <p className={`text-sm ${textSecondary}`}>{text.noRecentData}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => {
                    setSelectedJob(job);
                    setUploadedFile(null); // Clear uploaded file
                  }}
                  disabled={uploadedFile !== null}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all text-left
                    ${selectedJob?.id === job.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : uploadedFile
                        ? 'border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 dark:border-slate-700 hover:border-green-400'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium ${textPrimary}`}>{job.name}</h3>
                      <p className={`text-sm ${textSecondary} mt-1`}>
                        {job.dataCount} rows • {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedJob?.id === job.id && (
                      <div className="text-green-600 dark:text-green-400">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <button className={`w-full h-11 px-4 text-sm font-medium rounded-lg border transition-colors ${cardBg} ${textPrimary} hover:bg-opacity-80`}>
              {text.cancel}
            </button>
          </Link>
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className={`
              flex-1 h-11 px-4 text-sm font-medium rounded-lg transition-all
              ${canProceed
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }
              flex items-center justify-center gap-2
            `}
          >
            <span>{text.next}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
