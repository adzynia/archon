import {
  ArchitectureInput,
  ArchitectureModel,
  ArchitectureIssue,
  CodeProfile,
} from '@archon/shared';
import { LLMMessage } from './client';

/**
 * Step 1: Extract structured ArchitectureModel from raw architecture document
 */
export function buildExtractionPrompt(input: ArchitectureInput): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert software architect. Your task is to analyze architecture documents and extract a structured model.

Extract the following from the provided architecture document:
- Overall context and purpose
- All components (services, databases, queues, caches, frontends, jobs, external APIs)
- For each component: name, type, description, tech stack, data stored, and dependencies (sync vs async)
- Cross-cutting concerns (logging, monitoring, auth, resilience)

CRITICAL: You MUST respond with ONLY a valid JSON object. Do NOT include any explanatory text, markdown formatting, or code fences. Start your response with { and end with }.

Return ONLY valid JSON matching this TypeScript interface:

interface ArchitectureModel {
  context: string;
  components: {
    id: string;
    name: string;
    type: 'service' | 'db' | 'queue' | 'cache' | 'frontend' | 'job' | 'external-api';
    description: string;
    techStack?: string[];
    dataStored?: string[];
    syncDependencies: string[];
    asyncDependencies: string[];
  }[];
  crossCuttingConcerns: {
    logging?: string;
    monitoring?: string;
    auth?: string;
    resilience?: string;
  };
}

Use kebab-case for component IDs (e.g., "user-service", "postgres-db").`,
    },
    {
      role: 'user',
      content: `Architecture Document:

${input.rawText}

${input.sections.length > 0 ? `\nSections found:\n${input.sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n')}` : ''}

${input.diagrams.length > 0 ? `\nDiagrams found:\n${input.diagrams.map(d => `Type: ${d.type}\n\`\`\`\n${d.raw}\n\`\`\``).join('\n\n')}` : ''}

Please extract the architecture model as JSON.`,
    },
  ];
}

/**
 * Step 2: Detect architecture issues and risks
 */
export function buildIssueDetectionPrompt(
  model: ArchitectureModel,
  codeProfile?: CodeProfile
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert software architect performing architecture reviews.

Analyze the provided architecture model and detect potential issues across these categories:
- scalability: bottlenecks, single points of failure, scaling limitations
- reliability: fault tolerance, retry logic, circuit breakers, data consistency
- security: authentication gaps, authorization, data encryption, secrets management
- data: data modeling issues, migration risks, backup/recovery gaps
- observability: logging, monitoring, tracing, alerting gaps
- devex: development workflow issues, testing gaps, deployment complexity

CRITICAL: You MUST respond with ONLY a valid JSON array. Do NOT include any explanatory text, markdown formatting, or code fences. Start your response with [ and end with ].

For each issue found, return JSON matching this TypeScript interface:

interface ArchitectureIssue {
  id: string;
  title: string;
  description: string;
  category: 'scalability' | 'reliability' | 'security' | 'data' | 'observability' | 'devex';
  severity: 'low' | 'medium' | 'high';
  componentsInvolved: string[];
  recommendation: string;
  effortEstimate: 'S' | 'M' | 'L';
}

Return an array of issues as valid JSON. If no issues found, return empty array [].`,
    },
    {
      role: 'user',
      content: `Architecture Model:
${JSON.stringify(model, null, 2)}

${
  codeProfile
    ? `Code Profile:
${JSON.stringify(codeProfile, null, 2)}`
    : ''
}

Please analyze and return detected issues as JSON array.`,
    },
  ];
}

/**
 * Step 3: Generate human-readable architecture review report
 */
export function buildReportGenerationPrompt(
  model: ArchitectureModel,
  issues: ArchitectureIssue[]
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert software architect writing architecture review reports.

Generate a comprehensive Markdown report with:
1. Executive Summary (2-3 paragraphs)
2. Architecture Overview (brief description of components and flow)
3. Key Findings (grouped by severity: high, medium, low)
4. Recommendations Overview (prioritized action items)
5. Detailed Issue Analysis (each issue with context and remediation steps)

The report should be professional, actionable, and developer-friendly.

CRITICAL: You MUST respond with ONLY a valid JSON object. Do NOT include any explanatory text, markdown formatting, or code fences. Start your response with { and end with }.

Return a JSON object with:
{
  "summary": "2-3 sentence executive summary",
  "recommendationsOverview": "Prioritized recommendations as a string",
  "fullReportMarkdown": "Complete Markdown report"
}`,
    },
    {
      role: 'user',
      content: `Architecture Model:
${JSON.stringify(model, null, 2)}

Detected Issues:
${JSON.stringify(issues, null, 2)}

Please generate the architecture review report as JSON.`,
    },
  ];
}
