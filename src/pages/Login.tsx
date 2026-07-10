import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !pwd) { setError('请输入账号和密码'); return; }
    setSubmitting(true);
    const ok = await login(username.trim(), pwd);
    setSubmitting(false);
    if (ok) { navigate('/main',{replace:true}); }
    else { setError('账号或密码错误'); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key==='Enter') handleLogin();
  };

  const inputStyle: React.CSSProperties = {
    width:'100%',padding:'12px 16px',background:'var(--bg-canvas)',
    border:'1px solid rgba(255,255,255,.12)',borderRadius:'var(--radius-md)',
    color:'var(--text-primary)',fontSize:'var(--text-base)',outline:'none',
  };

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',
      background:'var(--bg-canvas)'}}>
      <div style={{width:400,background:'var(--bg-surface)',borderRadius:'var(--radius-lg)',
        border:'1px solid rgba(255,255,255,.08)',padding:'var(--space-10) var(--space-8)',
        boxShadow:'var(--shadow-lg)'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'var(--space-8)'}}>
          <Zap size={48} style={{color:'var(--color-info)',marginBottom:'var(--space-3)'}}/>
          <h1 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)'}}>
            监控管理系统
          </h1>
          <p style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginTop:'var(--space-2)'}}>
            请登录您的账号
          </p>
        </div>

        {/* Form */}
        <div style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
          <div>
            <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginBottom:'var(--space-1)'}}>
              账号
            </div>
            <input
              style={inputStyle}
              placeholder="输入用户名或 admin"
              value={username}
              onChange={e=>setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div>
            <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginBottom:'var(--space-1)'}}>
              密码
            </div>
            <div style={{position:'relative'}}>
              <input
                style={{...inputStyle,paddingRight:48}}
                type={showPwd?'text':'password'}
                placeholder="输入密码（任意字符）"
                value={pwd}
                onChange={e=>setPwd(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={()=>setShowPwd(s=>!s)}
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',color:'var(--text-secondary)',cursor:'pointer',padding:4}}>
                {showPwd?<EyeOff size={18}/>:<Eye size={18}/>}
              </button>
            </div>
          </div>

          {error && (
            <div style={{color:'var(--color-danger)',fontSize:'var(--text-sm)',textAlign:'center'}}>
              {error}
            </div>
          )}

          <Button variant="primary" size="lg" style={{width:'100%',marginTop:'var(--space-2)'}}
            onClick={handleLogin} disabled={submitting}>
            {submitting ? <Loader2 size={18} style={{animation:'spin 1s linear infinite'}} /> : '登 录'}
          </Button>
        </div>

        {/* Hint */}
        <div style={{marginTop:'var(--space-6)',textAlign:'center',fontSize:'var(--text-xs)',color:'var(--text-disabled)'}}>
          测试账号: admin / 123
        </div>
      </div>
    </div>
  );
}
