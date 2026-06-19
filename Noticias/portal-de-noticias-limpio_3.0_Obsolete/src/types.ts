export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string[]; // Set of clean paragraphs for reader mode
  source: string;
  url?: string;     // URL if it's an external traditional article
  date: string;
  category: "Tecnología" | "Economía" | "Entretenimiento" | "Otros Temas" | string;
  readTime: string;
  imageUrl?: string;
  isTrending?: boolean;
  isTraditional?: boolean; // True if it belongs to Google News traditional grid
}

export interface FinancialTicker {
  name: string;
  value: string | number;
  change: string;
  isUp: boolean;
  url?: string;      // Direct verification URL on Yahoo Finance
}

export interface FinancialData {
  timestamp: string;
  indices: FinancialTicker[];
  currencies: FinancialTicker[];
  cryptos: FinancialTicker[];
}
