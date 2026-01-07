// Mock data for development/testing

import type {
  SentimentResult,
  SentimentStats,
  PreprocessedData,
  CSVData,
  DataJob
} from './types';

// ==================== Sample CSV Data ====================

export const mockCSVData: CSVData[] = [
  {
    id: 1,
    userName: 'Ahmad',
    reviewText: 'Aplikasi ini sangat bagus dan membantu!',
    rating: 5,
    date: '2024-01-05'
  },
  {
    id: 2,
    userName: 'Budi',
    reviewText: 'Aplikasi jelek, sering error dan lambat.',
    rating: 1,
    date: '2024-01-04'
  },
  {
    id: 3,
    userName: 'Citra',
    reviewText: 'Biasa saja, tidak terlalu istimewa.',
    rating: 3,
    date: '2024-01-03'
  },
  {
    id: 4,
    userName: 'Dewi',
    reviewText: 'Sangat recommended! UI nya bagus dan user friendly.',
    rating: 5,
    date: '2024-01-02'
  },
  {
    id: 5,
    userName: 'Eko',
    reviewText: 'Mengecewakan, banyak bug dan fitur tidak jalan.',
    rating: 2,
    date: '2024-01-01'
  }
];

// ==================== Preprocessed Data ====================

export const mockPreprocessedData: PreprocessedData[] = [
  {
    ...mockCSVData[0],
    original_text: 'Aplikasi ini sangat bagus dan membantu!',
    cleaned_text: 'aplikasi sangat bagus membantu'
  },
  {
    ...mockCSVData[1],
    original_text: 'Aplikasi jelek, sering error dan lambat.',
    cleaned_text: 'aplikasi jelek sering error lambat'
  },
  {
    ...mockCSVData[2],
    original_text: 'Biasa saja, tidak terlalu istimewa.',
    cleaned_text: 'biasa terlalu istimewa'
  },
  {
    ...mockCSVData[3],
    original_text: 'Sangat recommended! UI nya bagus dan user friendly.',
    cleaned_text: 'sangat recommended ui bagus user friendly'
  },
  {
    ...mockCSVData[4],
    original_text: 'Mengecewakan, banyak bug dan fitur tidak jalan.',
    cleaned_text: 'mengecewakan banyak bug fitur jalan'
  }
];

// ==================== Sentiment Results ====================

export const mockSentimentResults: SentimentResult[] = [
  {
    sentiment: 'Positive',
    score: 3,
    confidence: 0.85,
    comparative: 0.6,
    positive: ['bagus', 'membantu'],
    negative: []
  },
  {
    sentiment: 'Negative',
    score: -4,
    confidence: 0.9,
    comparative: -0.8,
    positive: [],
    negative: ['jelek', 'error', 'lambat']
  },
  {
    sentiment: 'Neutral',
    score: 0,
    confidence: 0.5,
    comparative: 0,
    positive: [],
    negative: []
  },
  {
    sentiment: 'Positive',
    score: 5,
    confidence: 0.95,
    comparative: 0.83,
    positive: ['recommended', 'bagus', 'friendly'],
    negative: []
  },
  {
    sentiment: 'Negative',
    score: -5,
    confidence: 0.92,
    comparative: -0.83,
    positive: [],
    negative: ['mengecewakan', 'bug']
  }
];

// ==================== Sentiment Statistics ====================

export const mockSentimentStats: SentimentStats = {
  total: 5,
  positive: 2,
  negative: 2,
  neutral: 1,
  distribution: {
    positive: '40.00',
    negative: '40.00',
    neutral: '20.00'
  }
};

// ==================== Recent Jobs ====================

export const mockRecentJobs: DataJob[] = [
  {
    id: 'job-001',
    name: 'WhatsApp Reviews',
    type: 'scraping',
    status: 'completed',
    createdAt: '2024-01-05T10:30:00Z',
    dataCount: 150,
    csvUrl: '/mock/whatsapp-reviews.csv'
  },
  {
    id: 'job-002',
    name: 'Instagram Reviews',
    type: 'scraping',
    status: 'completed',
    createdAt: '2024-01-04T15:20:00Z',
    dataCount: 200,
    csvUrl: '/mock/instagram-reviews.csv'
  },
  {
    id: 'job-003',
    name: 'Custom Upload',
    type: 'upload',
    status: 'completed',
    createdAt: '2024-01-03T09:15:00Z',
    dataCount: 75,
    csvUrl: '/mock/custom-data.csv'
  }
];
