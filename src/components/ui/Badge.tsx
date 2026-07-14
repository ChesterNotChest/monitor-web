import type { ReactNode } from 'react';

interface BadgeProps { level: 'danger' | 'warning' | 'caution' | 'success' | 'info' | 'neutral'; children: ReactNode; }

const colorMap = {
  danger: { bg:'var(--color-danger-dim)',fg:'var(--color-danger)' },
  warning: { bg:'var(--color-warning-dim)',fg:'var(--color-warning)' },
  caution: { bg:'var(--color-caution-dim)',fg:'var(--color-caution)' },
  success: { bg:'var(--color-success-dim)',fg:'var(--color-success)' },
  info: { bg:'var(--color-info-dim)',fg:'var(--color-info)' },
  neutral: { bg:'rgba(107,114,128,.15)',fg:'var(--color-neutral)' },
};

export function Badge({ level, children }: BadgeProps) {
  const c = colorMap[level];
  return (
    <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 8px',
      borderRadius:'var(--radius-full)',fontSize:'var(--text-xs)',fontWeight:'var(--font-semibold)',
      lineHeight:1.4,whiteSpace:'nowrap',background:c.bg,color:c.fg }}>
      {children}
    </span>
  );
}
