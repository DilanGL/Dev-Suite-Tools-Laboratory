export interface Source {
  id: string;
  title: string;
  content: string;
  addedAt: string;
  wordCount: number;
}

export interface ThematicTopic {
  id: string;
  title: string;
  timeframe: string;
  learned: string;
  foundation: string;
  necessity: string;
  influence: string;
  importance: "Crítica" | "Alta" | "Media";
  sourceIds?: string[]; // Associated studies files/sources ids
}

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailwind class name or color code
  sources: Source[];
  progress: number; // 0 to 100
  studyTimeHours: number; // simulated study time
  completedMilestones: string[]; // List of title/index completed
  thematicTimeline?: ThematicTopic[];
}

export interface KeyConcept {
  term: string;
  description: string;
  expandableContent: string;
}

export interface SummaryData {
  summary: string;
  keyConcepts: KeyConcept[];
}

export interface Milestone {
  title: string;
  date: string;
  type: "milestone" | "formula" | "concept";
  description: string;
  importance: "Crítica" | "Alta" | "Media";
}

export interface TimelineData {
  milestones: Milestone[];
}

export interface MindMapNode {
  id: string;
  label: string;
  category: "root" | "main" | "sub";
  x?: number;
  y?: number;
}

export interface MindMapEdge {
  source: string;
  target: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  citations?: string[];
  timestamp: string;
}
