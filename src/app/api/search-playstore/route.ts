import { NextRequest, NextResponse } from "next/server";
import gplay from "google-play-scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchResult {
  appId: string;
  title: string;
  icon: string;
  scoreText: string;
  developer: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || !query.trim()) {
      return NextResponse.json({ 
        ok: false, 
        error: "Search query is required" 
      }, { status: 400 });
    }

    // Search apps on Google Play
    const results = await gplay.search({
      term: query.trim(),
      num: 10, // Limit to top 10 results
      lang: 'id',
      country: 'id',
    });

    if (!results || results.length === 0) {
      return NextResponse.json({
        ok: true,
        results: [],
      });
    }

    // Map to simplified response
    const searchResults: SearchResult[] = results.map((app) => ({
      appId: (app as { appId?: string }).appId || '',
      title: (app as { title?: string }).title || '',
      icon: (app as { icon?: string }).icon || '',
      scoreText: (app as { scoreText?: string }).scoreText || 'N/A',
      developer: (app as { developer?: string }).developer || '',
    }));

    return NextResponse.json({
      ok: true,
      results: searchResults,
    });

  } catch (error: unknown) {
    console.error("Play Store search error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search apps";
    return NextResponse.json({ 
      ok: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
