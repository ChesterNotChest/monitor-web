import { useLocation, useNavigate, matchPath } from 'react-router-dom';

const labelMap: Record<string,string> = {
  main:'主面板',view:'实时监控',edit:'电子围栏',replay:'事件回放',
  log:'日志',report:'报表','weekly-report':'周报',
  users:'用户管理',characters:'人物管理',equipment:'设备信息','exception-settings':'异常设置',
};

// Build breadcrumbs from a path, using source info from state
function buildCrumbs(pathname: string, source?: string): {label:string;path?:string}[] {
  const result: {label:string;path?:string}[] = [];

  // If we have a source, trace back from it
  if (source && source!==pathname) {
    const srcParts = source.split('/').filter(Boolean);
    let acc = '';
    for (const p of srcParts) {
      acc += '/' + p;
      result.push({ label: labelMap[p]||p, path: acc });
    }
  }

  // Add current page segments
  const parts = pathname.split('/').filter(Boolean);
  let acc = '';
  for (const p of parts) {
    acc += '/' + p;
    // Skip if already covered by source
    if (result.find(r=>r.path===acc)) continue;
    if (p.match(/^\d{4}-\d{2}-\d{2}$/)) {
      result.push({ label: p });
    } else if (p.startsWith('event-') || p.startsWith('alert-')) {
      result.push({ label: `事件回放` });
    } else if (p.match(/^\d+$/)) {
      result.push({ label: `第${p}周` });
    } else if (p==='replay') {
      result.push({ label: '事件回放' }); // no path - replay has no list page
    } else {
      result.push({ label: labelMap[p]||p, path: acc });
    }
  }

  // Deduplicate consecutive same labels
  return result.filter((r,i)=>i===0||r.label!==result[i-1].label);
}

export function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const source = (location.state as any)?.from;
  const crumbs = buildCrumbs(location.pathname, source);

  return (
    <div style={{ display:'flex',alignItems:'center',gap:'var(--space-2)',
      padding:'var(--space-3) var(--space-6)',background:'var(--bg-canvas)',
      borderBottom:'1px solid rgba(255,255,255,.04)',fontSize:'var(--text-sm)',color:'var(--text-secondary)',minHeight:44 }}>
      <button onClick={()=>navigate('/main')}
        style={{color:'var(--text-secondary)',background:'none',border:'none',fontSize:'var(--text-sm)',cursor:'pointer',
          padding:'2px var(--space-1)',borderRadius:'var(--radius-sm)'}}>
        监控
      </button>
      {crumbs.map((c,i) => {
        const isLast = i===crumbs.length-1;
        return (
          <span key={i} style={{display:'flex',alignItems:'center',gap:'var(--space-2)'}}>
            <span style={{color:'var(--text-disabled)',fontSize:'var(--text-xs)'}}>/</span>
            {isLast ? (
              <span style={{color:'var(--text-primary)',fontWeight:'var(--font-medium)'}}>{c.label}</span>
            ) : (
              <button onClick={()=>c.path&&navigate(c.path)}
                style={{color:'var(--text-secondary)',background:'none',border:'none',fontSize:'var(--text-sm)',cursor:c.path?'pointer':'default',
                  padding:'2px var(--space-1)',borderRadius:'var(--radius-sm)'}}>
                {c.label}
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
