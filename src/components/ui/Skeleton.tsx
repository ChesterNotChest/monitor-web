interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row';
  count?: number;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

const variantStyles = {
  text: { height:'16px',borderRadius:'var(--radius-sm)',marginBottom:'var(--space-2)' },
  card: { height:'180px',borderRadius:'var(--radius-md)',marginBottom:'var(--space-4)' },
  'table-row': { height:'50px',borderRadius:'var(--radius-sm)',marginBottom:'var(--space-1)' },
};

export function Skeleton({ variant = 'text', count = 1, width, height, style }: SkeletonProps) {
  const base = variantStyles[variant];
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          ...base,width:width||'100%',height:height||base.height,
          background:`linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,.05) 40%, var(--bg-elevated) 80%)`,
          backgroundSize:'800px 100%',animation:'shimmer 1.8s ease-in-out infinite',
          ...style,
        }} />
      ))}
    </>
  );
}
