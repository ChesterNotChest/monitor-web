import { useLocation, useNavigate, matchPath } from 'react-router-dom';

type CrumbConfig = { pattern: string; crumbs: ({ label: string | ((p: Record<string,string>) => string); path?: string | ((p: Record<string,string>) => string) })[] };

const configs: CrumbConfig[] = [
  { pattern: '/main', crumbs: [{ label: '主面板' }] },
  { pattern: '/view/:cameraId', crumbs: [{ label: '主面板', path: '/main' }, { label: (p) => `实时监控` }] },
  { pattern: '/view/:viewId/edit', crumbs: [{ label: '主面板', path: '/main' }, { label: '实时监控', path: c=>`/view/${c.viewId}` }, { label: '电子围栏' }] },
  { pattern: '/replay/:eventId', crumbs: [{ label: '主面板', path: '/main' }, { label: (p) => `事件回放` }] },
  { pattern: '/log', crumbs: [{ label: '日志' }] },
  { pattern: '/report/:date', crumbs: [{ label: '报表', path: '/log' }, { label: (p) => p.date }] },
  { pattern: '/weekly-report/:weekNum', crumbs: [{ label: '报表', path: '/log' }, { label: (p) => `第${p.weekNum}周` }] },
  { pattern: '/users', crumbs: [{ label: '用户管理' }] },
  { pattern: '/characters', crumbs: [{ label: '人物管理' }] },
  { pattern: '/equipment', crumbs: [{ label: '设备信息' }] },
  { pattern: '/exception-settings', crumbs: [{ label: '异常设置' }] },
];

export function Breadcrumb() {
  const location = useLocation(); const navigate = useNavigate();

  // Find matching config
  let matched: CrumbConfig | undefined;
  let params: Record<string,string> = {};
  for (const cfg of configs) {
    const m = matchPath(cfg.pattern, location.pathname);
    if (m) { matched = cfg; params = m.params as Record<string,string>; break; }
  }
  if (!matched) matched = configs[0];

  return (
    <div style={{ display:'flex',alignItems:'center',gap:'var(--space-2)',
      padding:'var(--space-3) var(--space-6)',background:'var(--bg-canvas)',
      borderBottom:'1px solid rgba(255,255,255,.04)',fontSize:'var(--text-sm)',color:'var(--text-secondary)',minHeight:44 }}>
      {/* Always start with home */}
      <button onClick={()=>navigate('/main')}
        style={{color:'var(--text-secondary)',background:'none',border:'none',fontSize:'var(--text-sm)',cursor:'pointer',
          padding:'2px var(--space-1)',borderRadius:'var(--radius-sm)'}}>
        监控
      </button>

      {matched.crumbs.map((c,i) => {
        const label = typeof c.label === 'function' ? c.label(params) : c.label;
        const isLast = i === matched!.crumbs.length - 1;
        return (
          <span key={i} style={{display:'flex',alignItems:'center',gap:'var(--space-2)'}}>
            <span style={{color:'var(--text-disabled)',fontSize:'var(--text-xs)'}}>/</span>
            {isLast ? (
              <span style={{color:'var(--text-primary)',fontWeight:'var(--font-medium)'}}>{label}</span>
            ) : (
              <button onClick={()=>{const p=typeof c.path==='function'?c.path(params):c.path;if(p)navigate(p);}}
                style={{color:'var(--text-secondary)',background:'none',border:'none',fontSize:'var(--text-sm)',cursor:!!c.path?'pointer':'default',
                  padding:'2px var(--space-1)',borderRadius:'var(--radius-sm)'}}>
                {label}
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
