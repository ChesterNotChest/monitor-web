import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Eye, Pencil, RotateCcw, ScrollText, FileText, Users, UserSquare, Monitor, AlertTriangle, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface NavItem { path: string; label: string; icon: typeof LayoutDashboard; badge?: number; }

const mainItems: NavItem[] = [
  { path:'/main',label:'主面板',icon:LayoutDashboard },{ path:'/view',label:'实时监控',icon:Eye,badge:5 },
  { path:'/view/default/edit',label:'电子围栏',icon:Pencil },{ path:'/replay/event-001',label:'事件回放',icon:RotateCcw },
];
const dataItems: NavItem[] = [
  { path:'/log',label:'日志',icon:ScrollText },{ path:'/report/2026-07-08',label:'报表',icon:FileText },
];
const adminItems: NavItem[] = [
  { path:'/users',label:'用户管理',icon:Users },{ path:'/characters',label:'人物管理',icon:UserSquare },
  { path:'/equipment',label:'设备信息',icon:Monitor },{ path:'/exception-settings',label:'异常设置',icon:AlertTriangle },
];

export function Sidebar() {
  const navigate = useNavigate(); const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed')==='true');
  useEffect(() => { localStorage.setItem('sidebar-collapsed',String(collapsed)); },[collapsed]);

  const isActive = (path: string) => {
    if (path==='/main') return location.pathname==='/main' || location.pathname==='/';
    if (path==='/view') return location.pathname==='/view' && !location.pathname.includes('/edit');
    if (path.startsWith('/replay')) return location.pathname.startsWith('/replay');
    if (path.startsWith('/report')) return location.pathname.startsWith('/report');
    return location.pathname===path || location.pathname.startsWith(path.split('/')[1]);
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.path);
    return (
      <button key={item.path}
        onClick={() => navigate(item.path)}
        title={collapsed?item.label:undefined}
        style={{ display:'flex',alignItems:'center',gap:'var(--space-3)',width:'100%',
          padding:'var(--space-3) var(--space-4)',color:active?'var(--text-primary)':'var(--text-secondary)',
          background:active?'var(--bg-hover)':'transparent',border:'none',
          borderLeft:active?'3px solid var(--color-info)':'3px solid transparent',
          fontSize:'var(--text-base)',transition:'background 120ms ease, color 120ms ease, border-color 120ms ease',
          textDecoration:'none',whiteSpace:'nowrap',cursor:'pointer',boxSizing:'border-box',textAlign:'left' }}>
        <item.icon size={20} style={{flexShrink:0}} />
        {!collapsed && (
          <>
            <span style={{flex:1,textAlign:'left'}}>{item.label}</span>
            {item.badge && item.badge>0 && (
              <span style={{background:'var(--color-danger)',color:'#fff',fontSize:11,fontWeight:'var(--font-bold)',
                minWidth:18,height:18,borderRadius:'var(--radius-full)',display:'flex',alignItems:'center',
                justifyContent:'center',padding:'0 5px',lineHeight:1}}>{item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <nav style={{ width:collapsed?'var(--sidebar-collapsed-width)':'var(--sidebar-width)',
      height:'100vh',background:'var(--bg-surface)',borderRight:'1px solid rgba(255,255,255,.06)',
      display:'flex',flexDirection:'column',transition:'width 200ms cubic-bezier(0.16,1,0.3,1)',flexShrink:0,overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:'var(--space-3)',
        padding:'var(--space-5) var(--space-4)',borderBottom:'1px solid rgba(255,255,255,.06)',minHeight:64 }}>
        <Zap size={24} style={{flexShrink:0,color:'var(--color-info)'}} />
        {!collapsed && <span style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',whiteSpace:'nowrap'}}>雷霆监控</span>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'var(--space-2) 0'}}>
        <div style={{borderBottom:'1px solid rgba(255,255,255,.04)',padding:'var(--space-1) 0'}}>{mainItems.map(renderItem)}</div>
        <div style={{borderBottom:'1px solid rgba(255,255,255,.04)',padding:'var(--space-1) 0'}}>{dataItems.map(renderItem)}</div>
        <div style={{padding:'var(--space-1) 0'}}>{adminItems.map(renderItem)}</div>
      </div>
      <div style={{padding:'var(--space-2) var(--space-4)',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <button onClick={()=>setCollapsed(c=>!c)}
          style={{display:'flex',alignItems:'center',gap:'var(--space-2)',width:'100%',
            padding:'var(--space-2)',color:'var(--text-secondary)',background:'transparent',
            border:'none',borderRadius:'var(--radius-sm)',fontSize:'var(--text-sm)',cursor:'pointer'}}>
          {collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}
          {!collapsed && <span>收起</span>}
        </button>
      </div>
    </nav>
  );
}
