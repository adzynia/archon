import { nanoid } from 'nanoid';
import {
  ArchitectureInput,
  ArchitectureModel,
  ArchitectureIssue,
  ArchitectureReview,
  CodeProfile,
} from '@archon/shared';
import { LLMClient } from '../llm/client';
import {
  buildExtractionPrompt,
  buildIssueDetectionPrompt,
  buildReportGenerationPrompt,
} from '../llm/prompts';

export class ReviewService {
  constructor(private llmClient: LLMClient) {}

  /**
   * Clean LLM response by removing markdown code fences, thinking tags, and preambles
   */
  private cleanJsonResponse(response: string): string {
    let cleaned = response.trim();

    // Remove <think>...</think> tags if present (common in reasoning models)
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Remove common preambles like "Here's the JSON:" or "Here is the response:"
    cleaned = cleaned.replace(/^(?:Here'?s?\s+(?:the\s+)?(?:JSON|response|architecture|report)[\s:]*)/i, '').trim();

    // Remove markdown code fences if present
    if (cleaned.startsWith('```')) {
      // Remove opening fence (```json or ```)
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '');
      // Remove closing fence
      cleaned = cleaned.replace(/\n?```\s*$/, '');
    }

    return cleaned.trim();
  }

  /**
   * Parse JSON with error handling for control characters
   */
  private parseJsonSafely<T>(jsonString: string, context: string): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      // If parsing fails due to control characters, try to fix them
      if (error instanceof SyntaxError && error.message.includes('control character')) {
        try {
          // Replace literal newlines, tabs, and other control characters within strings
          // This regex finds strings and replaces control characters inside them
          const fixed = jsonString.replace(
            /"([^"\\]*(\\.[^"\\]*)*)"/g,
            (match) => {
              return match
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t')
                .replace(/[\x00-\x1F\x7F]/g, ''); // Remove other control characters
            }
          );
          return JSON.parse(fixed) as T;
        } catch (fixError) {
          // If fixing didn't work, throw original error with more context
          throw new Error(`Failed to parse ${context} from LLM response: ${error}`);
        }
      }
      throw new Error(`Failed to parse ${context} from LLM response: ${error}`);
    }
  }

  /**
   * Step 1: Extract structured ArchitectureModel from parsed input
   */
  async extractArchitectureModel(input: ArchitectureInput): Promise<ArchitectureModel> {
    const messages = buildExtractionPrompt(input);
    const response = await this.llmClient.complete(messages, {
      temperature: 0.3,
      maxTokens: 4096,
    });

    // Clean and parse JSON response
    const cleaned = this.cleanJsonResponse(response);
    return this.parseJsonSafely<ArchitectureModel>(cleaned, 'ArchitectureModel');
  }

  /**
   * Step 2: Detect architecture issues and risks
   */
  async detectIssues(
    model: ArchitectureModel,
    codeProfile?: CodeProfile
  ): Promise<ArchitectureIssue[]> {
    const messages = buildIssueDetectionPrompt(model, codeProfile);
    const response = await this.llmClient.complete(messages, {
      temperature: 0.5,
      maxTokens: 4096,
    });

    const cleaned = this.cleanJsonResponse(response);
    return this.parseJsonSafely<ArchitectureIssue[]>(cleaned, 'ArchitectureIssues');
  }

  /**
   * Step 3: Generate human-readable architecture review report
   */
  async generateReport(
    model: ArchitectureModel,
    issues: ArchitectureIssue[]
  ): Promise<{ summary: string; recommendationsOverview: string; fullReportMarkdown: string }> {
    const messages = buildReportGenerationPrompt(model, issues);
    const response = await this.llmClient.complete(messages, {
      temperature: 0.7,
      maxTokens: 8192,
    });

    const cleaned = this.cleanJsonResponse(response);
    return this.parseJsonSafely<{
      summary: string;
      recommendationsOverview: string;
      fullReportMarkdown: string;
    }>(cleaned, 'Report');
  }

  /**
   * Full pipeline: parse → extract → detect → generate
   */
  async performReview(
    input: ArchitectureInput,
    codeProfile?: CodeProfile,
    model?: string
  ): Promise<ArchitectureReview> {
    // If a specific model is requested, create a new client with that model
    let clientToUse = this.llmClient;
    if (model) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is required');
      }
      const { GroqLLMClient } = await import('../llm/client');
      clientToUse = new GroqLLMClient(apiKey, model);
    }

    // Temporarily swap the client
    const originalClient = this.llmClient;
    this.llmClient = clientToUse;

    try {
      // Step 1: Extract model
      const architectureModel = await this.extractArchitectureModel(input);

      // Step 2: Detect issues
      const issues = await this.detectIssues(architectureModel, codeProfile);

      // Step 3: Generate report
      const { summary, recommendationsOverview, fullReportMarkdown } = await this.generateReport(
        architectureModel,
        issues
      );

      // Construct review
      const review: ArchitectureReview = {
        id: nanoid(),
        summary,
        architectureModel,
        issues,
        recommendationsOverview,
        fullReportMarkdown,
        createdAt: new Date().toISOString(),
      };

      return review;
    } finally {
      // Restore original client
      this.llmClient = originalClient;
    }
  }
}
