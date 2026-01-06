import { NextRequest } from "next/server";
import { z } from "zod";
import { runTweetHarvest } from "@/lib/scrape";
import { readCsvAsJson } from "@/lib/csv";
import { uploadToAppwrite } from "@/lib/appwrite-storage";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const Schema = z.object({
  token: z.string().min(20),
  filename: z.string().default("data.csv"),
  searchKeyword: z.string().min(3),
  limit: z.number().int().min(1).max(5000).default(500),
  tab: z.enum(["LATEST", "TOP"]).optional(),
});

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
      };

      try {
        const bodyText = await req.text();
        const body = Schema.parse(JSON.parse(bodyText));

        const jobId = crypto.randomUUID();
        const safeFilename = `${jobId}-${body.filename.replace(/[^\w.\-]/g, "_")}`;

        send("log", `[INIT] Job ID: ${jobId}`);
        send("log", `[INIT] Filename: ${safeFilename}`);

        const { file } = await runTweetHarvest({
          token: body.token,
          filename: safeFilename,
          searchKeyword: body.searchKeyword,
          limit: body.limit,
          tab: body.tab ?? "LATEST",
          onLog: (msg) => send("log", msg),
        });

        send("log", `[READ] Reading CSV file...`);
        const rows = await readCsvAsJson(file);
        send("log", `[READ] Found ${rows.length} rows`);

        // Upload to Appwrite
        send("log", `[APPWRITE] Uploading to Appwrite Storage...`);
        const fileBuffer = await fs.readFile(file);
        const { fileId, url } = await uploadToAppwrite(fileBuffer, safeFilename);
        send("log", `[APPWRITE] Upload complete - File ID: ${fileId}`);

        const meta = {
          jobId,
          csvPath: file, // Keep for preprocessing
          appwriteFileId: fileId,
          appwriteUrl: url,
          createdAt: new Date().toISOString(),
          searchKeyword: body.searchKeyword,
          limit: body.limit,
          tab: body.tab ?? "LATEST",
        };

        const metaPath = path.join(process.cwd(), "tweets-data", `${jobId}.json`);
        await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf-8");
        send("log", `[SAVE] Metadata saved`);

        send("result", {
          ok: true,
          jobId,
          count: rows.length,
          preview: rows.slice(0, 50),
          appwriteFileId: fileId,
          appwriteUrl: url,
        });

        send("done", null);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        send("log", `[ERROR] ${message}`);
        send("result", { ok: false, error: message });
        send("done", null);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
