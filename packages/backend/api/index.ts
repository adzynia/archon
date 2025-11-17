import { fastify } from 'fastify';
import cors from '@fastify/cors';
import { ReviewService } from '../src/services/review';
import { ReviewStorage } from '../src/services/storage';
import { GroqLLMClient } from '../src/llm/client';
import { reviewRoutes } from '../src/routes/reviews';

// Create Fastify app
const app = fastify({
  logger: false, // Disable logging for serverless
});

// Initialize services
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error('GROQ_API_KEY environment variable is required');
}

const llmClient = new GroqLLMClient(apiKey);
const reviewService = new ReviewService(llmClient);
const storage = new ReviewStorage();

// Register plugins and routes
app.register(cors, {
  origin: true,
});

app.register(reviewRoutes, { reviewService, storage });

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// Export for Vercel serverless
export default async (req: unknown, res: unknown) => {
  await app.ready();
  app.server.emit('request', req, res);
};
