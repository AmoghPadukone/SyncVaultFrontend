import { File } from '@shared/schema';

// Search mode
export type SearchMode = 'raw' | 'advanced' | 'smart';

// Raw search params
export interface RawSearchParams {
  query: string;
}

// Advanced search filters
export interface AdvancedSearchFilters {
  name?: string;
  type?: string | string[];
  size?: {
    min?: number;
    max?: number;
  };
  dateCreated?: {
    from?: Date;
    to?: Date;
  };
  provider?: number | number[];
  tags?: string[];
}

// Smart search result
export interface SmartSearchResult {
  parsedQuery: {
    filters: AdvancedSearchFilters;
    originalPrompt: string;
  };
  results: File[];
}

// Search history item
export interface SearchHistoryItem {
  id: string;
  query: string;
  mode: SearchMode;
  timestamp: Date;
  resultCount: number;
}

// Search suggestions
export interface SearchSuggestion {
  type: 'recent' | 'file' | 'folder' | 'popular';
  text: string;
  value: string;
}

// Date range preset
export enum DateRangePreset {
  Today = 'today',
  Yesterday = 'yesterday',
  LastWeek = 'last_week',
  LastMonth = 'last_month',
  LastYear = 'last_year',
  Custom = 'custom',
}
