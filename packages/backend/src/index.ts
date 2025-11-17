import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { GroqLLMClient } from './llm/client';
import { ReviewService } from './services/review';
import { ReviewStorage } from './services/storage';
import { reviewRoutes } from './routes/reviews';

const PORT = parseInt(process.env.PORT || '3001', 10);
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY environment variable is required');
  process.exit(1);
}

const fastify = Fastify({
  logger: true,
});

// Enable CORS for frontend
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
});

// Initialize services
// Using llama-3.3-70b-versatile (updated model, replaces deprecated llama-3.1-70b-versatile)
const llmClient = new GroqLLMClient(GROQ_API_KEY, 'llama-3.3-70b-versatile');
const reviewService = new ReviewService(llmClient);
const storage = new ReviewStorage();

// Register routes
fastify.register(reviewRoutes, { reviewService, storage });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
