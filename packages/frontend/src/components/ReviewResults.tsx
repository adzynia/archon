'use client';

import { useState } from 'react';
import { ArchitectureReview } from '@archon/shared';
import ReactMarkdown from 'react-markdown';
import { IssueCard } from './IssueCard';
import styles from './ReviewResults.module.css';

interface ReviewResultsProps {
  review: ArchitectureReview;
}

export function ReviewResults({ review }: ReviewResultsProps) {
  const [expandedSections, setExpandedSections] = useState({
    components: false,
    fullReport: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className={styles.title}>Architecture Review Complete</h2>
            <div className={styles.meta}>
              <span>Review ID: {review.id}</span>
              <span className={styles.separator}>•</span>
              <span>{new Date(review.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg className={styles.sectionIcon} fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Executive Summary
        </h3>
        <div className={styles.summaryBox}>
          <p className={styles.summaryText}>{review.summary}</p>
        </div>
      </section>

      {/* Architecture Components */}
      <section className={styles.section}>
        <button
          className={styles.collapsibleHeader}
          onClick={() => toggleSection('components')}
          aria-expanded={expandedSections.components}
        >
          <div className={styles.sectionTitleWrapper}>
            <svg className={styles.sectionIcon} fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className={styles.sectionTitle}>
              Architecture Components ({review.architectureModel.components.length})
            </h3>
          </div>
          <svg
            className={`${styles.chevron} ${expandedSections.components ? styles.expanded : ''}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.components && (
          <div className={styles.componentsList}>
            <div className={styles.contextBox}>
              <strong>Context:</strong> {review.architectureModel.context}
            </div>
            <div className={styles.components}>
              {review.architectureModel.components.map(comp => (
                <div key={comp.id} className={styles.component}>
                  <div className={styles.componentHeader}>
                    <span className={styles.componentName}>{comp.name}</span>
                    <span className={styles.componentType}>{comp.type}</span>
                  </div>
                  <p className={styles.componentDesc}>{comp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Issues Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg className={styles.sectionIcon} fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Issues Found ({review.issues.length})
        </h3>
        {review.issues.length === 0 ? (
          <div className={styles.noIssues}>
            <svg className={styles.noIssuesIcon} fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No issues detected. Excellent architecture!</p>
          </div>
        ) : (
          <div className={styles.issues}>
            {review.issues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>

      {/* Recommendations Overview */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg className={styles.sectionIcon} fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Recommendations Overview
        </h3>
        <div className={styles.recommendationsBox}>
          <p>{review.recommendationsOverview}</p>
        </div>
      </section>

      {/* Full Report */}
      <section className={styles.section}>
        <button
          className={styles.collapsibleHeader}
          onClick={() => toggleSection('fullReport')}
          aria-expanded={expandedSections.fullReport}
        >
          <div className={styles.sectionTitleWrapper}>
            <svg className={styles.sectionIcon} fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className={styles.sectionTitle}>Full Detailed Report</h3>
          </div>
          <svg
            className={`${styles.chevron} ${expandedSections.fullReport ? styles.expanded : ''}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.fullReport && (
          <div className={styles.markdownContent}>
            <ReactMarkdown>{review.fullReportMarkdown}</ReactMarkdown>
          </div>
        )}
      </section>
    </div>
  );
}
