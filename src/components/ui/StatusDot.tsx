interface StatusDotProps { status: 'online' | 'offline' | 'alert'; pulse?: boolean; size?: 'sm' | 'md'; }

const colorMap = { online: 'var(--color-success)', offline: 'var(--color-neutral)', alert: 'var(--color-danger)' };
const sizeMap = { sm: 8, md: 12 };

export function StatusDot({ status, pulse = false, size = 'md' }: StatusDotProps) {
  const s = sizeMap[size];
  return (
    <span style={{ display:'inline-block',width:s,height:s,borderRadius:'50%',flexShrink:0,position:'relative',
      background:colorMap[status],
      boxShadow:status!=='offline'?`0 0 ${s/2}px ${colorMap[status]}`:undefined }}>
      {pulse && <span style={{ content:'""',position:'absolute',inset:-3,borderRadius:'50%',
        border:`2px solid var(--color-danger)`,animation:'pulse-ring 1.4s ease-out infinite' }} />}
    </span>
  );
}
