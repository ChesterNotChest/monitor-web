import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScrollText, Users, UserSquare, Monitor, AlertTriangle, BarChart3, ChevronLeft, ChevronRight, Zap, LogOut, Key, Tag, FileText, Radio } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

interface NavItem { path: string; label: string; icon: typeof LayoutDashboard; badge?: number; }

const baseItems: NavItem[] = [
  { path:'/main',label:'主面板',icon:LayoutDashboard },
  { path:'/log',label:'日志',icon:ScrollText },
  { path:`/report/${new Date().toISOString().slice(0, 10)}`,label:'监控日报',icon:FileText },
  { path:'/users',label:'用户管理',icon:Users },
  { path:'/characters',label:'人物管理',icon:UserSquare },
  { path:'/equipment',label:'设备信息',icon:Monitor },
  { path:'/streams',label:'自定义流',icon:Radio },
  { path:'/exception-settings',label:'异常设置',icon:AlertTriangle },
  { path:'/detection-settings',label:'检测类型',icon:Tag },
  { path:'/event-stats',label:'事件统计',icon:BarChart3 },
];

export function Sidebar() {
  const navigate = useNavigate(); const location = useLocation();
  const { alerts } = useAlerts();
  const { user, logout } = useAuth();
  const pendingCount = alerts.length;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed')==='true');
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { localStorage.setItem('sidebar-collapsed',String(collapsed)); },[collapsed]);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(menuRef.current&&!menuRef.current.contains(e.target as Node))setUserMenu(false)};document.addEventListener('mousedown',h);return ()=>document.removeEventListener('mousedown',h)},[]);

  // Password change
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const modalInputStyle = (err: string): React.CSSProperties => ({
    width:'100%',padding:'10px 14px',background:'var(--bg-canvas)',
    border:`1px solid ${err?'var(--color-danger)':'rgba(255,255,255,.12)'}`,borderRadius:'var(--radius-md)',
    color:'var(--text-primary)',fontSize:'var(--text-base)',outline:'none',marginBottom:'var(--space-3)'
  });
  const btnCancel: React.CSSProperties = {flex:1,padding:'10px',background:'transparent',
    border:'1px solid rgba(255,255,255,.12)',borderRadius:'var(--radius-md)',
    color:'var(--text-secondary)',fontSize:'var(--text-base)',cursor:'pointer'};
  const btnConfirm: React.CSSProperties = {flex:1,padding:'10px',background:'var(--color-info)',
    border:'none',borderRadius:'var(--radius-md)',color:'#fff',fontSize:'var(--text-base)',cursor:'pointer'};

  const handleChangePwd = () => {
    setPwdError(''); setPwdSuccess('');
    if (!oldPwd) { setPwdError('请输入当前密码'); return; }
    if (!newPwd) { setPwdError('请输入新密码'); return; }
    if (newPwd.length<3) { setPwdError('新密码至少3位'); return; }
    if (newPwd!==confirmPwd) { setPwdError('两次密码不一致'); return; }
    setPwdSuccess('密码修改成功');
    setTimeout(()=>{setShowChangePwd(false);setOldPwd('');setNewPwd('');setConfirmPwd('');setPwdSuccess('');},800);
  };

  const navItems = baseItems.map(item => ({
    ...item,
    badge: item.path==='/main' ? pendingCount : undefined,
  }));

  const isActive = (path: string) => {
    if (path==='/main') return location.pathname==='/main' || location.pathname==='/';
    return location.pathname===path || location.pathname.startsWith(path+'/');
  };

  return (
    <nav style={{ width:collapsed?'var(--sidebar-collapsed-width)':'var(--sidebar-width)',
      height:'100vh',background:'var(--bg-surface)',borderRight:'1px solid rgba(255,255,255,.06)',
      display:'flex',flexDirection:'column',transition:'width 200ms cubic-bezier(0.16,1,0.3,1)',flexShrink:0,overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:'var(--space-3)',
        padding:'var(--space-5) var(--space-4)',borderBottom:'1px solid rgba(255,255,255,.06)',minHeight:64 }}>
        <Zap size={24} style={{flexShrink:0,color:'var(--color-info)'}} />
        <span style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',whiteSpace:'nowrap',display:collapsed?'none':undefined}}>监控</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'var(--space-2) 0'}}>
        {navItems.map(item => {
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
              <div style={{position:'relative',flexShrink:0}}>
                <item.icon size={20} />
                {collapsed && item.badge != null && item.badge > 0 && (
                  <span style={{position:'absolute',top:-6,right:-8,background:'var(--color-danger)',color:'#fff',
                    fontSize:10,fontWeight:'var(--font-bold)',minWidth:16,height:16,borderRadius:'var(--radius-full)',
                    display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px',lineHeight:1,
                    border:'2px solid var(--bg-surface)'}}>{item.badge}</span>
                )}
              </div>
              {!collapsed && <span style={{textAlign:'left',flex:1}}>{item.label}</span>}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span style={{background:'var(--color-danger)',color:'#fff',fontSize:11,fontWeight:'var(--font-bold)',
                  minWidth:18,height:18,borderRadius:'var(--radius-full)',display:'flex',alignItems:'center',
                  justifyContent:'center',padding:'0 5px',lineHeight:1,flexShrink:0}}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User area */}
      {user && (
        <div ref={menuRef} style={{borderTop:'1px solid rgba(255,255,255,.06)',padding:'var(--space-2) var(--space-3)',position:'relative'}}>
          <button onClick={()=>setUserMenu(o=>!o)}
            style={{display:'flex',alignItems:'center',gap:'var(--space-2)',width:'100%',padding:'var(--space-2)',
              color:'var(--text-primary)',background:'transparent',border:'none',borderRadius:'var(--radius-sm)',
              fontSize:'var(--text-sm)',cursor:'pointer'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'var(--color-info)',
              display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'var(--text-xs)',fontWeight:'var(--font-bold)',flexShrink:0}}>
              {user.username[0]}
            </div>
            <span style={{display:collapsed?'none':undefined}}>
              <span style={{flex:1,textAlign:'left'}}>{user.username}</span>
              <span style={{fontSize:10,color:'var(--text-disabled)'}}>▼</span>
            </span>
          </button>

          {/* Dropdown */}
          {userMenu && (
            <div style={{position:'absolute',bottom:'100%',left:collapsed?60:0,right:0,marginBottom:4,
              background:'var(--bg-elevated)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'var(--radius-md)',
              boxShadow:'var(--shadow-lg)',overflow:'hidden',zIndex:100,minWidth:180}}>
              <div style={{padding:'var(--space-3) var(--space-4)',borderBottom:'1px solid rgba(255,255,255,.06)',fontSize:'var(--text-sm)',color:'var(--text-secondary)'}}>
                当前: {user.username} ({user.role})
              </div>
              {/* Change password */}
              <div style={{borderTop:'1px solid rgba(255,255,255,.06)'}}>
                <button onClick={()=>{setShowChangePwd(true);setUserMenu(false);}}
                  style={{display:'flex',alignItems:'center',gap:'var(--space-2)',width:'100%',padding:'var(--space-3) var(--space-4)',
                    background:'transparent',border:'none',color:'var(--text-primary)',cursor:'pointer',fontSize:'var(--text-sm)'}}>
                  <Key size={14}/>修改密码
                </button>
              </div>
              {/* Logout */}
              <div>
                <button onClick={()=>{logout();navigate('/login',{replace:true});}}
                  style={{display:'flex',alignItems:'center',gap:'var(--space-2)',width:'100%',padding:'var(--space-3) var(--space-4)',
                    background:'transparent',border:'none',color:'var(--color-danger)',cursor:'pointer',fontSize:'var(--text-sm)'}}>
                  <LogOut size={14}/>退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Password change modal */}
      {showChangePwd && (
        <>
          <div onClick={()=>setShowChangePwd(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:90}}/>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:100,
            background:'var(--bg-surface)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'var(--radius-lg)',
            padding:'var(--space-6)',minWidth:340,boxShadow:'var(--shadow-lg)'}}>
            <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',marginBottom:'var(--space-4)'}}>
              修改密码
            </div>
            {!pwdSuccess ? (<>
              <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginBottom:'var(--space-1)'}}>当前密码</div>
              <input type="password" placeholder="输入当前密码" value={oldPwd}
                onChange={e=>{setOldPwd(e.target.value);setPwdError('');}} autoFocus
                style={modalInputStyle(pwdError)}/>
              <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginBottom:'var(--space-1)',marginTop:'var(--space-3)'}}>新密码</div>
              <input type="password" placeholder="输入新密码（至少3位）" value={newPwd}
                onChange={e=>{setNewPwd(e.target.value);setPwdError('');}}
                style={modalInputStyle(pwdError)}/>
              <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginBottom:'var(--space-1)',marginTop:'var(--space-3)'}}>确认新密码</div>
              <input type="password" placeholder="再次输入新密码" value={confirmPwd}
                onChange={e=>{setConfirmPwd(e.target.value);setPwdError('');}}
                onKeyDown={e=>{if(e.key==='Enter')handleChangePwd();}}
                style={modalInputStyle(pwdError)}/>
              {pwdError && <div style={{fontSize:'var(--text-xs)',color:'var(--color-danger)',marginTop:'var(--space-3)'}}>{pwdError}</div>}
              <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-4)'}}>
                <button onClick={()=>setShowChangePwd(false)} style={btnCancel}>取消</button>
                <button onClick={handleChangePwd} style={btnConfirm}>确认修改</button>
              </div>
            </>) : (
              <div style={{textAlign:'center',color:'var(--color-success)',fontSize:'var(--text-lg)',fontWeight:'var(--font-medium)',padding:'var(--space-8)'}}>
                ✓ 密码修改成功
              </div>
            )}
          </div>
        </>
      )}

      <div style={{padding:'var(--space-2) var(--space-4)',borderTop:user?'none':'1px solid rgba(255,255,255,.06)'}}>
        <button onClick={()=>setCollapsed(c=>!c)}
          style={{display:'flex',alignItems:'center',gap:'var(--space-2)',width:'100%',
            padding:'var(--space-2)',color:'var(--text-secondary)',background:'transparent',
            border:'none',borderRadius:'var(--radius-sm)',fontSize:'var(--text-sm)',cursor:'pointer'}}>
          {collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}
          <span style={{display:collapsed?'none':undefined}}>收起</span>
        </button>
      </div>
    </nav>
  );
}
