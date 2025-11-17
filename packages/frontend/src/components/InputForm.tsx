'use client';

import { FormEvent } from 'react';
import { ComingSoonTooltip } from './ComingSoonTooltip';
import styles from './InputForm.module.css';

interface InputFormProps {
  architectureText: string;
  repoUrl: string;
  model: string;
  loading: boolean;
  onArchitectureTextChange: (value: string) => void;
  onRepoUrlChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function InputForm({
  architectureText,
  repoUrl,
  model,
  loading,
  onArchitectureTextChange,
  onRepoUrlChange,
  onModelChange,
  onSubmit,
}: InputFormProps) {
  const isSubmitDisabled = loading || !architectureText.trim();

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="architectureText" className={styles.label}>
          Architecture Document <span className={styles.required}>*</span>
        </label>
        <textarea
          id="architectureText"
          value={architectureText}
          onChange={e => onArchitectureTextChange(e.target.value)}
          placeholder="Paste your architecture document here (Markdown format)...

Example:
# My E-Commerce Platform

## Overview
Microservices-based architecture handling 10,000 requests/day...

## Components
- User Service (Node.js + PostgreSQL)
- Product Service (Python + MongoDB)
- Order Service (Node.js + PostgreSQL)
..."
          required
          className={styles.textarea}
          disabled={loading}
        />
        <div className={styles.helpText}>
          Supports Markdown, PlantUML, and Mermaid diagrams
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="model" className={styles.label}>
          AI Model
          <span className={styles.optional}> (optional)</span>
        </label>
        <select
          id="model"
          value={model}
          onChange={e => onModelChange(e.target.value)}
          className={styles.select}
          disabled={loading}
        >
          <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Default - Fastest)</option>
          <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast & Efficient)</option>
          <option value="qwen/qwen3-32b">Qwen3 32B (Multilingual)</option>
          <option value="openai/gpt-oss-120b">GPT-OSS 120B (Most Capable)</option>
        </select>
        <div className={styles.helpText}>
          Different models have separate rate limits
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="repoUrl" className={styles.label}>
          Repository URL
          <span className={styles.optional}> (optional)</span>
        </label>
        <ComingSoonTooltip>
          <input
            id="repoUrl"
            type="url"
            value={repoUrl}
            onChange={e => onRepoUrlChange(e.target.value)}
            placeholder="https://github.com/username/repo"
            className={`${styles.input} ${styles.disabled}`}
            disabled
            aria-label="Repository URL - Coming soon"
          />
        </ComingSoonTooltip>
        <div className={styles.helpText}>Code analysis feature coming soon</div>
      </div>

      <button
        type="submit"
        className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
        disabled={isSubmitDisabled}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            Analyzing Architecture...
          </>
        ) : (
          <>
            <svg
              className={styles.icon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Generate Architecture Review
          </>
        )}
      </button>
    </form>
  );
}
