import { FastifyInstance } from 'fastify';
import { ReviewService } from '../services/review';
import { ReviewStorage } from '../services/storage';
import { parseArchitectureDocument } from '../services/parser';
import { reviewRequestSchema } from '../validation/schemas';
import { ZodError } from 'zod';

export async function reviewRoutes(
  fastify: FastifyInstance,
  options: {
    reviewService: ReviewService;
    storage: ReviewStorage;
  }
) {
  const { reviewService, storage } = options;

  /**
   * POST /api/reviews
   * Create a new architecture review
   */
  fastify.post('/api/reviews', async (request, reply) => {
    try {
      // Validate request body with Zod
      const validatedBody = reviewRequestSchema.parse(request.body);
      const { architectureText, repoUrl, model } = validatedBody;

      // Parse architecture document
      const input = parseArchitectureDocument(architectureText);

      // TODO: If repoUrl is provided, clone and analyze the repository
      // For now, we skip repo analysis
      const codeProfile = repoUrl ? undefined : undefined;

      // Perform review (3-stage LLM pipeline)
      const review = await reviewService.performReview(input, codeProfile, model);

      // Store review
      await storage.save(review);

      // Return review
      return reply.code(201).send(review);
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        return reply.code(400).send({
          error: 'Validation error',
          details: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      // Handle Groq API errors (rate limits, authentication, etc.)
      if (error && typeof error === 'object' && 'error' in error) {
        const groqError = error as { error?: { message?: string } };
        if (groqError.error?.message) {
          fastify.log.error(error);
          return reply.code(500).send({
            error: 'API Error',
            details: groqError.error.message,
          });
        }
      }

      // Handle other errors
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to generate architecture review',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  /**
   * GET /api/reviews/:id
   * Retrieve a stored architecture review
   */
  fastify.get<{ Params: { id: string } }>('/api/reviews/:id', async (request, reply) => {
    const { id } = request.params;

    const review = await storage.findById(id);

    if (!review) {
      return reply.code(404).send({
        error: 'Review not found',
      });
    }

    return reply.send(review);
  });

  /**
   * GET /api/reviews
   * List all reviews (for debugging/testing)
   */
  fastify.get('/api/reviews', async (request, reply) => {
    const reviews = await storage.findAll();
    return reply.send(reviews);
  });
}
