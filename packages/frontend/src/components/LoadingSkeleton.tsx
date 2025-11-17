'use client';

import styles from './LoadingSkeleton.module.css';

export function LoadingSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div>
          <h3 className={styles.title}>Analyzing Your Architecture</h3>
          <p className={styles.subtitle}>
            This typically takes 30-60 seconds. Our AI is reviewing your architecture document.
          </p>
        </div>
      </div>

      <div className={styles.steps}>
        <div className={`${styles.step} ${styles.active}`}>
          <div className={styles.stepIcon}>1</div>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>Parsing Document</div>
            <div className={styles.stepDescription}>
              Extracting sections, diagrams, and components
            </div>
          </div>
        </div>

        <div className={styles.step}>
          <div className={styles.stepIcon}>2</div>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>Detecting Issues</div>
            <div className={styles.stepDescription}>
              Analyzing architecture for potential problems
            </div>
          </div>
        </div>

        <div className={styles.step}>
          <div className={styles.stepIcon}>3</div>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>Generating Report</div>
            <div className={styles.stepDescription}>
              Creating comprehensive review and recommendations
            </div>
          </div>
        </div>
      </div>

      <div className={styles.skeletonCards}>
        <div className={styles.skeletonCard}>
          <div className={`${styles.skeletonLine} ${styles.title}`} />
          <div className={`${styles.skeletonLine} ${styles.full}`} />
          <div className={`${styles.skeletonLine} ${styles.medium}`} />
        </div>
        <div className={styles.skeletonCard}>
          <div className={`${styles.skeletonLine} ${styles.title}`} />
          <div className={`${styles.skeletonLine} ${styles.full}`} />
          <div className={`${styles.skeletonLine} ${styles.short}`} />
        </div>
      </div>
    </div>
  );
}
