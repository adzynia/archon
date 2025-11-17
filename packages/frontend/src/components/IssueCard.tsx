'use client';

import { ArchitectureIssue } from '@archon/shared';
import styles from './IssueCard.module.css';

interface IssueCardProps {
  issue: ArchitectureIssue;
}

const severityConfig = {
  high: {
    color: '#dc2626',
    bg: '#fef2f2',
    label: 'High Priority',
  },
  medium: {
    color: '#ea580c',
    bg: '#fff7ed',
    label: 'Medium Priority',
  },
  low: {
    color: '#16a34a',
    bg: '#f0fdf4',
    label: 'Low Priority',
  },
};

export function IssueCard({ issue }: IssueCardProps) {
  const config = severityConfig[issue.severity];

  return (
    <div className={styles.card} style={{ borderLeftColor: config.color }}>
      <div className={styles.header}>
        <h4 className={styles.title}>{issue.title}</h4>
        <div className={styles.badges}>
          <span
            className={styles.badge}
            style={{
              background: config.bg,
              color: config.color,
            }}
          >
            {config.label}
          </span>
          <span className={styles.badgeCategory}>{issue.category}</span>
          <span className={styles.badgeEffort}>Effort: {issue.effortEstimate}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <strong>Description:</strong> {issue.description}
        </div>

        <div className={styles.section}>
          <strong>Recommendation:</strong> {issue.recommendation}
        </div>

        {issue.componentsInvolved.length > 0 && (
          <div className={styles.components}>
            <strong>Affected Components:</strong>
            <div className={styles.componentTags}>
              {issue.componentsInvolved.map((comp, idx) => (
                <span key={idx} className={styles.componentTag}>
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
