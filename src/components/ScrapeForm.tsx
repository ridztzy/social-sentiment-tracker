"use client";

import { useRef, useState } from "react";

interface ScrapeResult {
  ok: boolean;
  jobId?: string;
  count?: number;
  preview?: Record<string, unknown>[];
  error?: string;
}

export default function ScrapeForm() {
  const tokenRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState(500);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!tokenRef.current?.value) {
      alert("Token wajib diisi");
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: tokenRef.current.value,   // ⬅️ dikirim sekali
        searchKeyword: keyword,
        limit,
        tab: "LATEST",
      }),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data);

    // 🔥 hapus token dari input setelah submit
    tokenRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <input
        ref={tokenRef}
        type="password"
        placeholder="Twitter Auth Token"
        className="w-full border p-2 rounded"
      />

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="aceh since:2025-11-20 until:2026-01-03 lang:id"
        className="w-full border p-2 rounded"
      />

      <input
        type="number"
        value={limit}
        onChange={(e) => setLimit(+e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={submit}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Scraping..." : "Run Scrape"}
      </button>

      {result && (
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
