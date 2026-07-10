import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  onClick?: (() => void) | (() => Promise<void>);
  children: ReactNode;
  style?: React.CSSProperties;
}

const btnStyles: Record<string, React.CSSProperties> = {
  base: { display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'var(--space-2)',
    border:'1px solid transparent',borderRadius:'var(--btn-radius)',fontWeight:'var(--font-medium)',
    transition:'background-color 120ms ease-out, border-color 120ms ease-out, opacity 120ms ease-out, transform 80ms ease-out',
    whiteSpace:'nowrap',userSelect:'none',cursor:'pointer' },
  primary: { background:'var(--color-info)',color:'#fff' },
  secondary: { background:'transparent',borderColor:'var(--text-secondary)',color:'var(--text-primary)' },
  danger: { background:'var(--color-danger)',color:'#fff' },
  ghost: { background:'transparent',color:'var(--text-secondary)' },
};
const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height:'32px',padding:'0 var(--space-3)',fontSize:'var(--text-sm)' },
  md: { height:'40px',padding:'0 var(--space-4)',fontSize:'var(--text-base)' },
  lg: { height:'48px',padding:'0 var(--space-6)',fontSize:'var(--text-lg)' },
};

export function Button({ variant, size = 'md', loading = false, disabled = false, icon: Icon, onClick, children }: ButtonProps) {
  return (
    <button
      style={{ ...btnStyles.base, ...btnStyles[variant], ...sizeStyles[size],
        ...(disabled||loading?{opacity:.45,cursor:'not-allowed',pointerEvents:'none'}:{}),
        position:'relative' }}
      onClick={onClick}
    >
      {loading && <span style={{ position:'absolute',width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .6s linear infinite' }} />}
      {Icon && !loading && <Icon size={size==='sm'?14:size==='lg'?20:16} />}
      <span style={loading?{visibility:'hidden'}:{}}>{children}</span>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </button>
  );
}
