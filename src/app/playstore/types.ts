export interface ScrapeResult {
  ok: boolean;
  jobId?: string;
  count?: number;
  appwriteFileId?: string;
  appwriteUrl?: string;
  preview?: Record<string, unknown>[];
  stats?: {
    avgRating: number;
    ratingDistribution: Record<string, number>;
  };
  error?: string;
}

export interface AppSearchResult {
  appId: string;
  title: string;
  icon: string;
  scoreText: string;
  developer: string;
}
