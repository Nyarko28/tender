// Common stop words to remove from tender titles
import { API_BASE_URL } from '@/services/api';

const STOP_WORDS = [
  'supply of',
  'purchase of',
  'consultancy for',
  'provision of',
  'request for',
  'procurement of',
  'tender for',
  'contract for',
  'services for',
  'works for',
  'delivery of',
  'installation of',
];

/**
 * Extracts a keyword from tender title by removing common stop words
 * @param title - The tender title
 * @returns The extracted keyword or null if too short
 */
export function extractKeyword(title: string | null | undefined): string | null {
  if (!title) return null;
  
  let keyword = title.toLowerCase().trim();
  
  // Remove each stop word from the beginning of the title
  for (const stopWord of STOP_WORDS) {
    if (keyword.startsWith(stopWord)) {
      keyword = keyword.slice(stopWord.length).trim();
      break; // Only remove one stop word from the start
    }
  }
  
  // Also check for stop words with different casing or trailing spaces
  for (const stopWord of STOP_WORDS) {
    const regex = new RegExp(`^${stopWord}\\s+`, 'i');
    keyword = keyword.replace(regex, '');
  }
  
  // Get the first meaningful word (after removing stop words)
  const words = keyword.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return null;
  
  // Return first 1-2 words if they're meaningful
  const meaningfulWord = words[0];
  if (meaningfulWord.length < 3) return null; // Too short
  
  return meaningfulWord;
}

/**
 * Extracts the first two meaningful words from tender title (after removing stop words)
 * @param title - The tender title
 * @returns The first two words or null if too short
 */
export function extractCleanTitle(title: string | null | undefined): string | null {
  if (!title) return null;
  
  let keyword = title.toLowerCase().trim();
  
  // Remove stop words from the beginning
  for (const stopWord of STOP_WORDS) {
    if (keyword.startsWith(stopWord)) {
      keyword = keyword.slice(stopWord.length).trim();
      break;
    }
  }
  
  // Also check for stop words with different casing or trailing spaces
  for (const stopWord of STOP_WORDS) {
    const regex = new RegExp(`^${stopWord}\\s+`, 'i');
    keyword = keyword.replace(regex, '');
  }
  
  // Get words
  const words = keyword.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return null;
  
  // Take first two words
  const firstTwo = words.slice(0, 2).join(' ');
  if (firstTwo.length < 3) return null;
  
  return firstTwo;
}

/**
 * Generates a dynamic Unsplash image URL based on tender title and category
 * @param tender - The tender object with id, title, and category_name
 * @returns A unique tender-specific image URL (served by backend)
 */
export function getTenderImage(tender: { id?: number; title?: string | null; category_name?: string | null } | undefined): string {
  if (!tender) return '';
  try {
    // Step 6: Replace static category images with tender-specific image endpoint.
    // This endpoint is deterministic + cached permanently server-side.
    if (!tender.id) return '';
    // Use absolute API base URL so it works across environments (local dev / Vercel with separate backend)
    return `${API_BASE_URL}/tenders/image?id=${tender.id}`;
  } catch {
    return getFallbackImage(tender);
  }
}

/**
 * Returns a fallback image URL for when the main image fails to load
 * @param tender - The tender object with id, title, and category_name
 * @returns A generic fallback image URL
 */
export function getFallbackImage(tender: { id?: number; title?: string | null; category_name?: string | null } | undefined): string {
  if (!tender) return '';
  const title = tender.title || 'Tender';
  const colors = ['1e40af', '7c3aed', '0f766e', 'b45309', '334155', '0ea5e9'];
  const idx = (tender.id ?? 0) % colors.length;
  const bg = colors[idx];
  const text = encodeURIComponent(title.slice(0, 32));
  // Solid, reliable placeholder that never 404s
  return `https://placehold.co/800x400/${bg}/ffffff?text=${text}`;
}

export const categoryAssets: Record<string, { image: string; color: string }> = {
  'IT & Technology': {
    image: '',
    color: '#3b82f6',
  },
  Construction: {
    image: '',
    color: '#f59e0b',
  },
  'Health & Medical': {
    image: '',
    color: '#10b981',
  },
  'Office Supplies': {
    image: '',
    color: '#8b5cf6',
  },
  Consultancy: {
    image: '',
    color: '#ec4899',
  },
  'Transport & Logistics': {
    image: '',
    color: '#f97316',
  },
  'Food & Catering': {
    image: '',
    color: '#14b8a6',
  },
  'Security Services': {
    image: '',
    color: '#6b7280',
  },
  'Cleaning Services': {
    image: '',
    color: '#84cc16',
  },
  Other: {
    image: '',
    color: '#94a3b8',
  },
};

export function getCategoryAsset(categoryName: string | null | undefined) {
  if (!categoryName) return categoryAssets['Other'];
  return categoryAssets[categoryName] ?? categoryAssets['Other'];
}
