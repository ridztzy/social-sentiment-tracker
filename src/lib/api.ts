// API Service Layer dengan Mock Data Support

import type {
  PreprocessOptions,
  PreprocessResult,
  SentimentAnalysisResult,
  PredictionRequest,
  PredictionResult,
  CSVData
} from './types';

import {
  mockPreprocessedData,
  mockSentimentResults,
  mockSentimentStats
} from './mockData';

// ==================== Configuration ====================

// Toggle antara mock data (dev) dan real API (production)
const USE_MOCK_DATA = true; // Set false saat backend ready
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// ==================== Utilities ====================

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== API Functions ====================

export const api = {
  /**
   * Preprocess CSV data
   */
  async preprocess(
    file: File,
    options: PreprocessOptions
  ): Promise<PreprocessResult> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(1500);

      return {
        ok: true,
        data: mockPreprocessedData,
        preview: mockPreprocessedData.slice(0, 5),
        stats: {
          totalRows: mockPreprocessedData.length,
          avgTextLength: {
            original: 45.2,
            cleaned: 28.5
          }
        }
      };
    }

    // Real API call
    const formData = new FormData();
    formData.append('file', file);
    formData.append('textColumn', 'reviewText');
    formData.append('lang', options.language);

    const res = await fetch(`${BACKEND_URL}/api/preprocess`, {
      method: 'POST',
      body: formData
    });

    return res.json();
  },

  /**
   * Analyze sentiment for batch of texts
   */
  async analyzeSentiment(texts: string[]): Promise<SentimentAnalysisResult> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(2000);

      return {
        ok: true,
        results: mockSentimentResults,
        stats: mockSentimentStats,
        preview: mockSentimentResults.slice(0, 10)
      };
    }

    // Real API call
    const res = await fetch(`${BACKEND_URL}/api/sentiment/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts })
    });

    return res.json();
  },

  /**
   * Predict sentiment for single text
   */
  async predict(request: PredictionRequest): Promise<PredictionResult> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(800);

      // Simple sentiment detection for demo
      const text = request.text.toLowerCase();
      let sentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
      let score = 0;

      const positiveWords = ['bagus', 'baik', 'recommended', 'mantap', 'sukses', 'hebat'];
      const negativeWords = ['jelek', 'buruk', 'lambat', 'error', 'bug', 'mengecewakan'];

      positiveWords.forEach(word => {
        if (text.includes(word)) {
          score += 1;
        }
      });

      negativeWords.forEach(word => {
        if (text.includes(word)) {
          score -= 1;
        }
      });

      // Determine sentiment based on final score
      if (score > 0) {
        sentiment = 'Positive';
      } else if (score < 0) {
        sentiment = 'Negative';
      }

      return {
        ok: true,
        input: {
          original: request.text,
          processed: request.preprocess 
            ? text.replace(/[^a-z0-9\s]/gi, '').trim()
            : request.text
        },
        prediction: {
          sentiment,
          score,
          confidence: Math.min(Math.abs(score) / 5, 1),
          comparative: score / 10,
          positive: sentiment === 'Positive' ? ['bagus'] : [],
          negative: sentiment === 'Negative' ? ['jelek'] : []
        }
      };
    }

    // Real API call
    const res = await fetch(`${BACKEND_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    return res.json();
  }
};

export default api;
