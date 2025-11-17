import Groq from 'groq-sdk';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMClient {
  complete(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string>;
}

export class GroqLLMClient implements LLMClient {
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string = 'compound') {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async complete(
    messages: LLMMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    const { temperature = 0.7, maxTokens = 4096 } = options;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }
}
