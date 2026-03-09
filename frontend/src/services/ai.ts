import { api } from './api';

type LegacyAIResponse<T> =
  | { success: true; data: T }
  | { success: true; reply: string }
  | { success: true; reply: T }
  | { success?: boolean; data?: T; reply?: unknown; message?: string };

function parseMaybeJson<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value !== 'string') return null;

  // Some legacy endpoints return JSON encoded twice (string containing JSON string)
  const tryParse = (s: string): unknown => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  const once = tryParse(value);
  if (once && typeof once === 'object') return once as T;
  if (typeof once === 'string') {
    const twice = tryParse(once);
    if (twice && typeof twice === 'object') return twice as T;
  }
  return null;
}

function unwrapAIData<T>(resData: LegacyAIResponse<T>): T {
  if (resData && typeof resData === 'object' && 'data' in resData && (resData as any).data) {
    return (resData as any).data as T;
  }
  const parsed = parseMaybeJson<T>((resData as any)?.reply);
  if (parsed) return parsed;
  throw new Error((resData as any)?.message || 'Unexpected AI response format');
}

// Types for AI responses
export interface AITenderDraft {
  title: string;
  description: string;
  criteria: Array<{
    name: string;
    description: string;
    max_score: number;
    weight: number;
  }>;
  requirements: string[];
  tags: string[];
}

export interface AIBidEvaluation {
  scores: Array<{
    criteria_name: string;
    suggested_score: number;
    max_score: number;
    reasoning: string;
  }>;
  overall_assessment: string;
  strengths: string[];
  weaknesses: string[];
  risk_level: string;
  recommendation: string;
}

export interface AIBidComparison {
  executive_summary: string;
  recommended_supplier: string;
  recommendation_reason: string;
  comparison: Array<{
    company: string;
    bid_amount: number;
    value_for_money: string;
    technical_strength: string;
    key_advantage: string;
    key_concern: string;
    overall_rank: number;
  }>;
  market_observations: string;
  risks: string[];
  procurement_advice: string;
}

export interface AISupplierRisk {
  risk_level: string;
  risk_score: number;
  factors: Array<{
    factor: string;
    impact: string;
    note: string;
  }>;
  summary: string;
  recommendations: string[];
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  reply: string;
}

// AI Service functions
export const aiService = {
  // Generate tender draft from keywords
  generateTender: async (data: {
    keywords: string;
    category: string;
    budget: string;
    duration: string;
  }): Promise<AITenderDraft> => {
    const response = await api.post('/ai/generate-tender', data);
    return unwrapAIData<AITenderDraft>(response.data);
  },

  // Get AI evaluation suggestion for a bid
  evaluateBid: async (bidId: number, tenderId: number): Promise<AIBidEvaluation> => {
    const response = await api.post('/ai/evaluate-bid', {
      bid_id: bidId,
      tender_id: tenderId,
    });
    return unwrapAIData<AIBidEvaluation>(response.data);
  },

  // Compare all bids for a tender
  compareBids: async (tenderId: number): Promise<AIBidComparison> => {
    const response = await api.post('/ai/compare-bids', {
      tender_id: tenderId,
    });
    return unwrapAIData<AIBidComparison>(response.data);
  },

  // Get supplier risk analysis
  getSupplierRisk: async (supplierId: number): Promise<AISupplierRisk> => {
    const response = await api.post('/ai/supplier-risk', {
      supplier_id: supplierId,
    });
    return unwrapAIData<AISupplierRisk>(response.data);
  },

  // Chat with ProcureAI
  chat: async (message: string, history: AIChatMessage[] = []): Promise<AIChatResponse> => {
    const response = await api.post('/ai/chat', {
      message,
      history,
    });
    return unwrapAIData<AIChatResponse>(response.data);
  },
};

export default aiService;
