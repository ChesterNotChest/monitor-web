import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  selected?: boolean;
  disabled?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Card({ selected = false, disabled = false, hoverable = false, onClick, children, className = '', style }: CardProps) {
  const isClickable = hoverable || !!onClick;
  return (
    <div
      className={className}
      style={{
        background:'var(--card-bg)',borderRadius:'var(--card-radius)',
        border: selected?'1px solid var(--color-info)':'1px solid rgba(255,255,255,.06)',
        boxShadow:selected?'0 0 0 1px var(--color-info)':undefined,
        opacity:disabled?.5:1,
        pointerEvents:disabled?'none':undefined,
        cursor:isClickable?'pointer':undefined,
        transition:'border-color 120ms ease-out, box-shadow 120ms ease-out, opacity 120ms ease-out, transform 100ms ease-out',
        padding:'var(--space-4)',
        ...style,
      }}
      onClick={disabled?undefined:onClick}
    >
      {children}
    </div>
  );
}
