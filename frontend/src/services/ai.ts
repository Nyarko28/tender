import { api } from './api';

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
    return response.data.data;
  },

  // Get AI evaluation suggestion for a bid
  evaluateBid: async (bidId: number, tenderId: number): Promise<AIBidEvaluation> => {
    const response = await api.post('/ai/evaluate-bid', {
      bid_id: bidId,
      tender_id: tenderId,
    });
    return response.data.data;
  },

  // Compare all bids for a tender
  compareBids: async (tenderId: number): Promise<AIBidComparison> => {
    const response = await api.post('/ai/compare-bids', {
      tender_id: tenderId,
    });
    return response.data.data;
  },

  // Get supplier risk analysis
  getSupplierRisk: async (supplierId: number): Promise<AISupplierRisk> => {
    const response = await api.post('/ai/supplier-risk', {
      supplier_id: supplierId,
    });
    return response.data.data;
  },

  // Chat with ProcureAI
  chat: async (message: string, history: AIChatMessage[] = []): Promise<AIChatResponse> => {
    const response = await api.post('/ai/chat', {
      message,
      history,
    });
    return response.data.data;
  },
};

export default aiService;
