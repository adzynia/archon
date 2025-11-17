'use client';

import { ReactNode, useState } from 'react';
import styles from './ComingSoonTooltip.module.css';

interface ComingSoonTooltipProps {
  children: ReactNode;
  message?: string;
}

export function ComingSoonTooltip({ children, message = 'Coming soon' }: ComingSoonTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label={message}
    >
      {children}
      {showTooltip && <div className={styles.tooltip}>{message}</div>}
    </div>
  );
}
