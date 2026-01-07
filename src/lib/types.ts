// Shared types for Data Mining Workflow

// ==================== Data Types ====================

export interface CSVData {
  [key: string]: string | number;
}

export interface DataInfo {
  rows: number;
  columns: number;
  columnNames: string[];
  missingValues: Record<string, number>;
  preview: CSVData[];
}

// ==================== Preprocessing ====================

export interface PreprocessOptions {
  removeStopwords: boolean;
  language: 'id' | 'en';
  lowercase: boolean;
  removeSpecialChars: boolean;
}

export interface PreprocessResult {
  ok: boolean;
  data: PreprocessedData[];
  preview: PreprocessedData[];
  stats: {
    totalRows: number;
    avgTextLength: {
      original: number;
      cleaned: number;
    };
  };
  error?: string;
}

export interface PreprocessedData extends CSVData {
  original_text: string;
  cleaned_text: string;
}

// ==================== Sentiment Analysis ====================

export type SentimentLabel = 'Positive' | 'Negative' | 'Neutral';

export interface SentimentResult {
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
  comparative: number;
  positive: string[];
  negative: string[];
}

export interface SentimentAnalysisResult {
  ok: boolean;
  results: SentimentResult[];
  stats: SentimentStats;
  preview: SentimentResult[];
  error?: string;
}

export interface SentimentStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  distribution: {
    positive: string; // percentage
    negative: string;
    neutral: string;
  };
}

// ==================== Prediction ====================

export interface PredictionRequest {
  text: string;
  preprocess?: boolean;
}

export interface PredictionResult {
  ok: boolean;
  input: {
    original: string;
    processed: string;
  };
  prediction: SentimentResult;
  error?: string;
}

// ==================== API Response ====================

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== Job/Session ====================

export interface DataJob {
  id: string;
  name: string;
  type: 'scraping' | 'upload' | 'analysis';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  dataCount?: number;
  csvUrl?: string;
}
