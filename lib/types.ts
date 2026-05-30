export enum FLAGS {
  COPILOT = "copilot",
  SUMMERIZER = "summerizer",
}

export interface HistoryData {
  createdAt: string;
  data: string;
  tag: string;
}

export interface QAEntry {
  question: string;
  answer: string;
  frameBase64?: string;
  timestamp: string;
  score?: number;
  scoreReason?: string;
}

export interface InterviewSession {
  domain: string;
  history: QAEntry[];
  startedAt: string;
}

export interface ExtractedQuestion {
  question: string;
  keywords: string[];
}

export interface RAGContext {
  pdfResults: Array<{ content: string; source: string }>;
  webResults: Array<{ title: string; content: string; url: string }>;
  combinedContext: string;
  citations: Array<{ source: string; relevance: number }>;
}

export interface RAGProcessResult {
  extractedQuestion: ExtractedQuestion | null;
  context: RAGContext;
  searchPerformed: boolean;
}

export interface Citation {
  source: string;
  relevance?: number;
  content: string;
  url?: string;
  // Extended citation metadata (used by RAG/PDF features)
  score?: number;
  sourceType?: "pdf" | "web";
  page?: number;
  startPage?: number;
  endPage?: number;
  filename?: string;
  pageRange?: string;
  contextSnippet?: string;
  contentType?: "text" | "image" | "multimodal";
}
