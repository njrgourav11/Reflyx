// Common types and structured JSON contracts for all agents

export interface Correlated {
  correlationId?: string;
}

// 1) Codebase Analyzer
export interface CodebaseAnalyzerInput extends Correlated {
  sources: {
    paths?: string[];          // local paths to scan
    repoUrl?: string;          // remote repository URL
    docs?: string[];           // documentation text or URLs
    manifests?: { [path: string]: string }; // package.json, etc.
  };
  options?: {
    languageFilters?: string[];
    includeSecurityScan?: boolean;
    includePerfScan?: boolean;
  };
}

export interface AnalyzerInventoryItem {
  name: string;
  type: 'module' | 'component' | 'service' | 'route' | 'lib' | 'config' | 'schema';
  path?: string;
  dependencies?: string[];
  dependents?: string[];
}

export interface IssueItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file?: string;
  line?: number;
  remediation?: string;
}

export interface RecommendationItem {
  id: string;
  summary: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  rationale: string;
  effort: 'S' | 'M' | 'L';
  impact: 'low' | 'medium' | 'high';
}

export interface CodebaseAnalyzerOutput extends Correlated {
  executiveSummary: string;
  inventory: AnalyzerInventoryItem[];
  dependencies: { external: string[]; internal: string[] };
  relationships: { from: string; to: string; type: string }[];
  technicalDebt: {
    metrics: { files: number; linesOfCode: number; avgFileSize: number; hotspots: number };
    issues: IssueItem[];
  };
  security: { issues: IssueItem[] };
  performance: { hotspots: IssueItem[] };
  recommendations: RecommendationItem[];
  generatedAt: string;
}

// 2) Architecture & SDLC Planning
export interface ArchitecturePlanningInput extends Correlated {
  stakeholders?: string[];
  requirements?: string[];
  constraints?: string[];
}

export interface ArchitecturePlanningOutput extends Correlated {
  questionnaire: string[];
  stakeholderAnalysis: { role: string; interests: string[]; influence: 'low'|'medium'|'high' }[];
  technicalSpecs: { requirement: string; acceptanceCriteria: string[] }[];
  diagrams: { type: 'component'|'deployment'|'dataflow'|'api'; notation: 'mermaid'; content: string }[];
  databaseSchema: { entities: { name: string; fields: { name: string; type: string; constraints?: string[] }[]; relations?: string[] }[] };
  timeline: { phase: string; start?: string; end?: string; gates: string[] }[];
  risks: { id: string; description: string; likelihood: 'L'|'M'|'H'; impact: 'L'|'M'|'H'; mitigation: string }[];
  techStack: { area: string; choice: string; justification: string }[];
  generatedAt: string;
}

// 3) Production Code Generator
export interface CodeGeneratorInput extends Correlated {
  specs: ArchitecturePlanningOutput;
  userStories?: { id: string; story: string; acceptanceCriteria: string[] }[];
}

export interface GeneratedArtifact {
  path: string;
  language: string;
  description?: string;
  content: string;
}

export interface CodeGeneratorOutput extends Correlated {
  summary: string;
  artifacts: GeneratedArtifact[];
  notes: string[];
  generatedAt: string;
}

// 4) Code Quality & Bug Resolution
export interface BugResolutionInput extends Correlated {
  targets: { path: string; content?: string }[];
}

export interface DiffItem {
  file: string;
  beforeExcerpt?: string;
  afterExcerpt?: string;
  patch?: string;
}

export interface BugResolutionOutput extends Correlated {
  findings: IssueItem[];
  refactorings: DiffItem[];
  performanceImprovements: IssueItem[];
  securityFixes: IssueItem[];
  explanations: string[];
  generatedAt: string;
}

// 5) Quality Assurance & Testing
export interface TestingInput extends Correlated {
  targetBasePath: string;
  apiBaseUrl?: string;
}

export interface TestingOutput extends Correlated {
  strategy: string;
  unitTests: GeneratedArtifact[];
  integrationTests: GeneratedArtifact[];
  e2eTests: GeneratedArtifact[];
  loadTests: GeneratedArtifact[];
  coverageGoals: { statement: number; branch: number; function: number; lines: number };
  ciCdPipeline: GeneratedArtifact[];
  generatedAt: string;
}

// 6) Orchestrator
export interface OrchestratorInput extends Correlated {
  projectName: string;
  initialRequirements: string[];
}

export interface OrchestratorOutput extends Correlated {
  steps: { name: string; status: 'ok'|'error'; summary: string }[];
  artifacts: GeneratedArtifact[];
  reports: {
    analysis?: CodebaseAnalyzerOutput;
    planning?: ArchitecturePlanningOutput;
    generation?: CodeGeneratorOutput;
    fixing?: BugResolutionOutput;
    testing?: TestingOutput;
  };
  generatedAt: string;
}

