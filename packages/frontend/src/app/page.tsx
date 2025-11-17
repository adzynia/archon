'use client';

import { useState } from 'react';
import { ReviewRequest, ArchitectureReview } from '@archon/shared';
import { InputForm } from '../components/InputForm';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ReviewResults } from '../components/ReviewResults';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [architectureText, setArchitectureText] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<ArchitectureReview | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReview(null);

    try {
      const request: ReviewRequest = {
        architectureText,
        repoUrl: repoUrl.trim() || undefined,
        model: model || undefined,
      };

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to create review';
        throw new Error(errorMessage);
      }

      const reviewData: ArchitectureReview = await response.json();
      setReview(reviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <svg className={styles.logo} fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Archon</h1>
        <p className={styles.subtitle}>AI-Powered Architecture Review</p>
        <p className={styles.description}>
          Get intelligent insights and recommendations for your system architecture
        </p>
      </header>

      <main className={styles.main}>
        <InputForm
          architectureText={architectureText}
          repoUrl={repoUrl}
          model={model}
          loading={loading}
          onArchitectureTextChange={setArchitectureText}
          onRepoUrlChange={setRepoUrl}
          onModelChange={setModel}
          onSubmit={handleSubmit}
        />

        {error && (
          <div className={styles.error}>
            <div className={styles.errorIcon}>
              <svg fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className={styles.errorTitle}>Error</h3>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && review && <ReviewResults review={review} />}
      </main>

      <footer className={styles.footer}>
        <p>
          Powered by AI • Built with TypeScript, Next.js, and Fastify •{' '}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
