import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";
import { AdvancedSearchParams } from "@/lib/schemas/search-schema";

export interface LegacyAdvancedSearchFilters {
  name?: string;
  type?: string;
  size?: {
    min?: number;
    max?: number;
  };
  dateCreated?: {
    from?: string;
    to?: string;
  };
  provider?: number;
}

export interface SmartSearchResult {
  parsedQuery: {
    filters: LegacyAdvancedSearchFilters;
    originalPrompt: string;
  };
  results: File[];
}

export const searchApi = {
  rawSearch: async (query: string): Promise<File[]> => {
    const res = await apiRequest("POST", "/api/search/raw", { query });
    return await res.json();
  },

  advancedSearch: async (filters: AdvancedSearchParams): Promise<File[]> => {
    const res = await apiRequest("POST", "/api/search/advanced", { filters });
    return await res.json();
  },

  smartSearch: async (prompt: string): Promise<SmartSearchResult> => {
    const res = await apiRequest("POST", "/api/search/smart", { prompt });
    return await res.json();
  }
};
