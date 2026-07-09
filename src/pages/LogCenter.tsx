import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { mockLogEntries, mockReportDates, mockWeeks } from '../data/mock';

export default function LogCenter() {
  const navigate = useNavigate();
  const panelStyle: React.CSSProperties = {
    flex:1,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:'var(--space-4)',
    border:'1px solid rgba(255,255,255,.06)',overflowY:'auto'
  };
  const headerStyle: React.CSSProperties = {
    textAlign:'center',padding:'var(--space-2) var(--space-4)',marginBottom:'var(--space-3)',
    background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)',fontSize:'var(--text-xl)',fontWeight:'var(--font-semibold)'
  };

  return (
    <div style={{display:'flex',gap:'var(--space-4)',height:'100%',padding:'var(--space-4)'}}>
      {/* Daily Log */}
      <div style={panelStyle}>
        <div style={headerStyle}>本日日志</div>
        {mockLogEntries.map((e,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',
            padding:'var(--space-3)',borderRadius:'var(--radius-sm)',background:i%2===0?'var(--bg-canvas)':'transparent',
            borderBottom:'1px solid rgba(255,255,255,.04)'}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',color:'var(--text-primary)',width:48,flexShrink:0}}>{e.time}</span>
            <span style={{fontSize:'var(--text-base)',color:'var(--text-secondary)',width:60,textAlign:'center',flexShrink:0}}>{e.camera}</span>
            <span style={{flex:1,fontSize:'var(--text-base)',color:'var(--text-primary)'}}>{e.event}</span>
            <Badge level={e.status==='pending'?'warning':'success'}>{e.status==='pending'?'未处理':'已处理'}</Badge>
          </div>
        ))}
      </div>

      {/* Daily Report */}
      <div style={panelStyle}>
        <div style={headerStyle}>日报</div>
        {mockReportDates.map((d,i)=>(
          <Card key={d} hoverable onClick={()=>navigate(`/report/${d}`)} style={{marginBottom:'var(--space-2)',textAlign:'center'}}>
            <span style={{fontSize:'var(--text-lg)',color:'var(--text-primary)'}}>{d}</span>
          </Card>
        ))}
      </div>

      {/* Weekly Report */}
      <div style={panelStyle}>
        <div style={headerStyle}>周报</div>
        {mockWeeks.map((w,i)=>(
          <Card key={w.label} hoverable onClick={()=>navigate(`/weekly-report/${27 - i}`)} style={{marginBottom:'var(--space-2)',textAlign:'center'}}>
            <span style={{fontSize:'var(--text-lg)',color:'var(--text-primary)'}}>{w.label}（{w.range}）</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
