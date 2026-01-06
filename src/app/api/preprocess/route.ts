import { NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";
import Papa from "papaparse";
import { readCsvAsJson } from "@/lib/csv";
import { cleanText, removeStopwords, scoreSentiment, labelFromScore } from "@/lib/preprocess";
import { uploadToAppwrite } from "@/lib/appwrite-storage";

const QuerySchema = z.object({
  jobId: z.string().min(5),
  textCol: z.string().default("full_text"),
  useStopwords: z.enum(["0", "1"]).default("1"),
  dedup: z.enum(["0", "1"]).default("1"),
  dropEmpty: z.enum(["0", "1"]).default("1"),
});

function downloadRoute(fileName: string) {
  return `/api/download?file=${encodeURIComponent(fileName)}`;
}

export async function GET(req: Request) {
  try {
    const reqUrl = new URL(req.url);
    const q = QuerySchema.parse({
      jobId: reqUrl.searchParams.get("jobId"),
      textCol: reqUrl.searchParams.get("textCol") ?? "full_text",
      useStopwords: reqUrl.searchParams.get("useStopwords") ?? "1",
      dedup: reqUrl.searchParams.get("dedup") ?? "1",
      dropEmpty: reqUrl.searchParams.get("dropEmpty") ?? "1",
    });

    const metaPath = path.join(process.cwd(), "tweets-data", `${q.jobId}.json`);
    const metaRaw = await fs.readFile(metaPath, "utf-8");
    const meta = JSON.parse(metaRaw) as { csvPath: string };

    const rows = await readCsvAsJson(meta.csvPath);

    const seen = new Set<string>();
    const processed = [];

    const dist = { Positif: 0, Netral: 0, Negatif: 0 };
    let droppedEmpty = 0;
    let droppedDup = 0;

    for (const r of rows) {
      const original = String(r?.[q.textCol] ?? "");

      if (q.dropEmpty === "1" && original.trim().length === 0) {
        droppedEmpty++;
        continue;
      }

      const cleaned0 = cleanText(original);
      const cleaned = q.useStopwords === "1" ? removeStopwords(cleaned0) : cleaned0;

      if (q.dropEmpty === "1" && cleaned.trim().length === 0) {
        droppedEmpty++;
        continue;
      }

      if (q.dedup === "1") {
        const key = cleaned || original;
        if (seen.has(key)) {
          droppedDup++;
          continue;
        }
        seen.add(key);
      }

      const score = scoreSentiment(cleaned);
      const sentiment = labelFromScore(score);
      dist[sentiment]++;

      processed.push({
        ...r,
        clean_text: cleaned,
        score,
        sentiment,
      });
    }

    // Generate CSV string
    const outName = `${q.jobId}-processed.csv`;
    const csv = Papa.unparse(processed);

    // Upload directly to Appwrite (no local save needed)
    const { fileId, url } = await uploadToAppwrite(Buffer.from(csv, "utf-8"), outName);

    // Cleanup: delete input CSV file and metadata JSON after successful processing
    try {
      await fs.unlink(meta.csvPath); // Delete input CSV
      await fs.unlink(metaPath); // Delete metadata JSON
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      ok: true,
      jobId: q.jobId,
      inputCount: rows.length,
      outputCount: processed.length,
      droppedEmpty,
      droppedDup,
      dist,
      download: downloadRoute(outName),
      appwriteUrl: url,
      appwriteFileId: fileId,
      preview: processed.slice(0, 50),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
