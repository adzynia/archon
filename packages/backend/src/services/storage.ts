import { ArchitectureReview } from '@archon/shared';

/**
 * In-memory storage for MVP
 * Can be easily swapped for database later
 */
export class ReviewStorage {
  private reviews: Map<string, ArchitectureReview> = new Map();

  async save(review: ArchitectureReview): Promise<void> {
    this.reviews.set(review.id, review);
  }

  async findById(id: string): Promise<ArchitectureReview | null> {
    return this.reviews.get(id) || null;
  }

  async findAll(): Promise<ArchitectureReview[]> {
    return Array.from(this.reviews.values());
  }
}
