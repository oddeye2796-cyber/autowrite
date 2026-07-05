export interface EvaluationCriterion {
  criterion: string;
  importance: "상" | "중" | "하" | string;
  strategy: string;
}

export interface ProposalSection {
  sectionId: string;
  parentTitle: string; // e.g. "I. 제안 개요 및 사업 이해"
  subTitle: string;    // e.g. "1.1 제안 목적 및 배경"
  keyFocus: string;    // What to write
  estimatedPages: number;
  estimatedWords: number;
  content?: string;    // Generated rich markdown text
  isGenerating?: boolean;
  isDone?: boolean;
  error?: string;
}

export interface ProposalOutline {
  projectTitle: string;
  projectGoal: string;
  companyStrengthRecommendation: string;
  evaluationCriteria: EvaluationCriterion[];
  sections: ProposalSection[];
}

export interface GenerationProgress {
  totalSections: number;
  completedSections: number;
  currentPageCount: number; // Simulated page count scaling to ~300 pages
  statusText: string;
  isBulkGenerating: boolean;
}
