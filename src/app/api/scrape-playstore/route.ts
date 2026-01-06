import { NextRequest, NextResponse } from "next/server";
import gplay from "google-play-scraper";
import { uploadToAppwrite } from "@/lib/appwrite-storage";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ScrapeRequest {
  appId: string;
  limit: number;
  rating?: string; // 'all' | '1' | '2' | '3' | '4' | '5'
  sort?: string;   // 'newest' | 'rating' | 'helpful'
  lang?: string;   // 'id' | 'en'
}

export async function POST(req: NextRequest) {
  try {
    const body: ScrapeRequest = await req.json();
    const { appId, limit = 100, rating = 'all', sort = 'newest', lang = 'id' } = body;

    if (!appId || !appId.trim()) {
      return NextResponse.json({ ok: false, error: "App ID is required" }, { status: 400 });
    }

    // Map sort parameter
    const sortMapping: Record<string, number> = {
      newest: 1, // gplay.sort.NEWEST
      rating: 2, // gplay.sort.RATING
      helpful: 3, // gplay.sort.HELPFULNESS
    };

    // Scrape reviews from Google Play
    const reviewsData = await gplay.reviews({
      appId,
      num: limit,
      sort: sortMapping[sort] || 1,
      lang: lang === 'id' ? 'in' : 'en',
    });

    let reviews = reviewsData.data || [];

    // Filter by rating if needed
    if (rating !== 'all') {
      const targetRating = parseInt(rating);
      reviews = reviews.filter((r) => (r as {score: number}).score === targetRating);
    }

    if (reviews.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: "No reviews found for this app" 
      }, { status: 404 });
    }

    // Transform to CSV format  
    const csvRows = reviews.map((r) => ({
      userName: (r as {userName?: string}).userName || '',
      rating: (r as {score?: number}).score || 0,
      reviewText: (r as {text?: string}).text || '',
      date: (r as {date?: Date | string}).date ? new Date((r as {date: Date | string}).date).toISOString() : '',
      thumbsUp: (r as {thumbsUp?: number}).thumbsUp || 0,
      version: (r as {version?: string}).version || '',
      replyText: (r as {replyText?: string}).replyText || '',
      replyDate: (r as {replyDate?: Date | string}).replyDate ? new Date((r as {replyDate: Date | string}).replyDate).toISOString() : '',
    }));

    // Calculate stats
    const ratingDist = csvRows.reduce((acc: Record<string, number>, r: Record<string, unknown>) => {
      const rating = r.rating as number;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const avgRating = csvRows.reduce((sum: number, r: Record<string, unknown>) => sum + (r.rating as number), 0) / csvRows.length;

    const stats = {
      avgRating: parseFloat(avgRating.toFixed(2)),
      ratingDistribution: ratingDist,
    };

    // Create CSV content
    const headers = Object.keys(csvRows[0]).join(',');
    const rows = csvRows.map((row: Record<string, unknown>) => 
      Object.values(row).map((val: unknown) => 
        typeof val === 'string' && val.includes(',') 
          ? `"${val.replace(/"/g, '""')}"` 
          : val
      ).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    // Save to temp file
    const jobId = crypto.randomUUID();
    const filename = `${jobId}-playstore-reviews.csv`;
    const tempDir = path.join(process.cwd(), 'tmp');
    
    // Ensure tmp directory exists
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, csvContent, 'utf-8');

    // Read file as Buffer for Appwrite upload
    const fileBuffer = await fs.readFile(filePath);

    // Upload to Appwrite
    const { fileId, url } = await uploadToAppwrite(fileBuffer, filename);

    // Delete local temp file
    await fs.unlink(filePath);

    return NextResponse.json({
      ok: true,
      jobId,
      count: csvRows.length,
      appwriteFileId: fileId,
      appwriteUrl: url,
      preview: csvRows.slice(0, 10),
      stats,
    });

  } catch (error: unknown) {
    console.error("Play Store scraping error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to scrape reviews";
    return NextResponse.json({ 
      ok: false, 
      error: errorMessage
    }, { status: 500 });
  }
}
