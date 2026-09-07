export interface MemoryItem {
  id: string;
  title: string | null;
  summary: string | null;
  status: string;
  createdAt: string;
}

export interface SearchResultItem {
  id: string;
  text: string;
  similarity: number;
  updatedAt: string;
}

export interface RecallResponse {
  answer: string;
  results: SearchResultItem[];
  profile: {
    static: string[];
    dynamic: string[];
  };
}

export interface ApiError {
  error: string;
}
