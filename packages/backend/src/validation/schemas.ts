import { z } from 'zod';

/**
 * Validation schema for ReviewRequest
 */
export const reviewRequestSchema = z.object({
  architectureText: z
    .string()
    .min(1, 'Architecture text is required')
    .max(100000, 'Architecture text is too large (max 100KB)'),
  repoUrl: z
    .string()
    .url('Invalid repository URL')
    .optional()
    .or(z.literal(''))
    .transform(val => (val === '' ? undefined : val)),
  model: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform(val => (val === '' ? undefined : val)),
});

export type ValidatedReviewRequest = z.infer<typeof reviewRequestSchema>;
