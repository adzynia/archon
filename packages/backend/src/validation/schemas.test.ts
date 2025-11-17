import { describe, it, expect } from 'vitest';
import { reviewRequestSchema } from './schemas';
import { ZodError } from 'zod';

describe('reviewRequestSchema', () => {
  it('should validate valid request with only architectureText', () => {
    const validRequest = {
      architectureText: 'Some architecture description',
    };

    const result = reviewRequestSchema.parse(validRequest);

    expect(result).toEqual({
      architectureText: 'Some architecture description',
      repoUrl: undefined,
    });
  });

  it('should validate valid request with architectureText and repoUrl', () => {
    const validRequest = {
      architectureText: 'Some architecture description',
      repoUrl: 'https://github.com/user/repo',
    };

    const result = reviewRequestSchema.parse(validRequest);

    expect(result).toEqual({
      architectureText: 'Some architecture description',
      repoUrl: 'https://github.com/user/repo',
    });
  });

  it('should transform empty repoUrl to undefined', () => {
    const validRequest = {
      architectureText: 'Some architecture description',
      repoUrl: '',
    };

    const result = reviewRequestSchema.parse(validRequest);

    expect(result.repoUrl).toBeUndefined();
  });

  it('should reject empty architectureText', () => {
    const invalidRequest = {
      architectureText: '',
    };

    expect(() => reviewRequestSchema.parse(invalidRequest)).toThrow(ZodError);
  });

  it('should reject missing architectureText', () => {
    const invalidRequest = {};

    expect(() => reviewRequestSchema.parse(invalidRequest)).toThrow(ZodError);
  });

  it('should reject invalid repoUrl', () => {
    const invalidRequest = {
      architectureText: 'Some architecture description',
      repoUrl: 'not-a-url',
    };

    expect(() => reviewRequestSchema.parse(invalidRequest)).toThrow(ZodError);
  });

  it('should reject architectureText that is too large', () => {
    const invalidRequest = {
      architectureText: 'a'.repeat(100001), // 100KB + 1
    };

    expect(() => reviewRequestSchema.parse(invalidRequest)).toThrow(ZodError);
  });

  it('should accept architectureText at max size', () => {
    const validRequest = {
      architectureText: 'a'.repeat(100000), // exactly 100KB
    };

    const result = reviewRequestSchema.parse(validRequest);

    expect(result.architectureText).toHaveLength(100000);
  });
});
