import { useLocation, useNavigate } from 'react-router-dom';

const pathMap: Record<string, string> = {
  main:'主面板',view:'实时监控','default/edit':'电子围栏','edit':'电子围栏',
  replay:'事件回放',log:'日志',report:'报表','weekly-report':'周报',
  users:'用户管理',characters:'人物管理',equipment:'设备信息','exception-settings':'异常设置',
};

export function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length===0) segments.push('main');

  const crumbs: { label:string; path:string }[] = [{ label:'雷霆监控', path:'/main' }];
  let acc = '';
  for (const seg of segments) {
    acc += '/' + seg;
    if (seg.match(/^\d{4}-\d{2}-\d{2}$/)) {
      crumbs.push({ label:seg, path:acc });
    } else if (seg.startsWith('event-')) {
      crumbs.push({ label:`事件 (${seg})`, path:acc });
    } else {
      crumbs.push({ label:pathMap[seg]||seg, path:acc });
    }
  }

  const last = crumbs[crumbs.length-1];

  return (
    <div style={{ display:'flex',alignItems:'center',gap:'var(--space-2)',
      padding:'var(--space-3) var(--space-6)',background:'var(--bg-canvas)',
      borderBottom:'1px solid rgba(255,255,255,.04)',fontSize:'var(--text-sm)',color:'var(--text-secondary)',minHeight:44 }}>
      {crumbs.map((c,i) => (
        <span key={c.path} style={{display:'flex',alignItems:'center',gap:'var(--space-2)'}}>
          {i>0 && <span style={{color:'var(--text-disabled)',fontSize:'var(--text-xs)'}}>/</span>}
          {c===last ? (
            <span style={{color:'var(--text-primary)',fontWeight:'var(--font-medium)'}}>{c.label}</span>
          ) : (
            <button onClick={()=>navigate(c.path)}
              style={{color:'var(--text-secondary)',background:'none',border:'none',fontSize:'var(--text-sm)',cursor:'pointer',
                padding:'2px var(--space-1)',borderRadius:'var(--radius-sm)'}}>
              {c.label}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
