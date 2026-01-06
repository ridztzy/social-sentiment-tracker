import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import { getAppwriteDownloadUrl } from "@/lib/appwrite-storage";

const Schema = z.object({
  file: z.string().min(1),
  source: z.enum(["local", "appwrite"]).optional().default("local"),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = Schema.parse({ 
      file: url.searchParams.get("file"),
      source: url.searchParams.get("source") as "local" | "appwrite" | undefined,
    });

    // If Appwrite source, redirect to Appwrite download URL
    if (q.source === "appwrite") {
      const appwriteUrl = getAppwriteDownloadUrl(q.file);
      return NextResponse.redirect(appwriteUrl);
    }

    // Default: serve from local (backward compatibility)
    const safe = q.file.replace(/[^a-zA-Z0-9_./-]/g, "_");
    const filePath = path.join(process.cwd(), "tweets-data", safe);

    const buf = await fs.readFile(filePath);

    return new NextResponse(buf, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${path.basename(safe)}"`,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
