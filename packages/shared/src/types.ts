// Request from client
export interface ReviewRequest {
  architectureText: string; // required
  repoUrl?: string; // optional
  model?: string; // optional - which LLM model to use
}

// Parsed input
export interface ArchitectureInput {
  rawText: string;
  sections: {
    title: string;
    content: string;
  }[];
  diagrams: {
    type: 'plantuml' | 'mermaid' | 'unknown';
    raw: string;
  }[];
}

// Extracted architecture model (from LLM step 1)
export interface ArchitectureModel {
  context: string;
  components: {
    id: string;
    name: string;
    type: 'service' | 'db' | 'queue' | 'cache' | 'frontend' | 'job' | 'external-api';
    description: string;
    techStack?: string[];
    dataStored?: string[];
    syncDependencies: string[]; // component ids
    asyncDependencies: string[]; // component ids
  }[];
  crossCuttingConcerns: {
    logging?: string;
    monitoring?: string;
    auth?: string;
    resilience?: string;
  };
}

export type IssueCategory =
  | 'scalability'
  | 'reliability'
  | 'security'
  | 'data'
  | 'observability'
  | 'devex';

export interface ArchitectureIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: 'low' | 'medium' | 'high';
  componentsInvolved: string[]; // component ids
  recommendation: string;
  effortEstimate: 'S' | 'M' | 'L'; // S=days, M=weeks, L=months
}

// Code profile from repo analysis (for later)
export interface CodeProfile {
  languages: string[];
  frameworks: string[];
  serviceCountEstimate: number;
  infraHints: string[];
  notes: string[];
}

export interface ArchitectureReview {
  id: string;
  summary: string;
  architectureModel: ArchitectureModel;
  issues: ArchitectureIssue[];
  recommendationsOverview: string;
  fullReportMarkdown: string;
  createdAt: string;
}
