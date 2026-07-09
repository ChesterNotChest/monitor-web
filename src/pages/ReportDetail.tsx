import { useParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { mockReportRows } from '../data/mock';

const columns = ['序号','发生时间','所属视图','告警事件','告警级别','处理状态','操作'];
const sevLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };
const statusColor: Record<string,string> = { '已处理':'var(--color-success)','标记误报':'var(--color-neutral)' };

export default function ReportDetail() {
  const { date } = useParams<{ date: string }>();

  return (
    <div style={{padding:'var(--space-6)',height:'100%',overflow:'auto'}}>
      <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',overflow:'hidden'}}>
        <div style={{padding:'var(--space-4) var(--space-6)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <h2 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)'}}>日报详情 · {date}</h2>
        </div>

        {/* Table */}
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'var(--bg-elevated)'}}>
              {columns.map((col,i)=>(
                <th key={col} style={{padding:'var(--space-3) var(--space-4)',textAlign:i===0||i===6?'center':'left',
                  fontSize:'var(--text-sm)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)',
                  borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                  {col}
                  {(i>=1&&i<=4)&&<span style={{marginLeft:4,fontSize:10,color:'var(--text-disabled)'}}>▼</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockReportRows.map((row,i)=>(
              <tr key={row.seq} style={{background:i%2===0?'var(--bg-canvas)':'transparent'}}>
                <td style={{padding:'var(--space-3) var(--space-4)',textAlign:'center',fontSize:'var(--text-base)',color:'var(--text-primary)'}}>{row.seq}</td>
                <td style={{padding:'var(--space-3) var(--space-4)',fontSize:'var(--text-base)',fontFamily:'var(--font-mono)',color:'var(--text-primary)'}}>{row.time}</td>
                <td style={{padding:'var(--space-3) var(--space-4)',fontSize:'var(--text-base)',color:'var(--text-primary)'}}>{row.camera}</td>
                <td style={{padding:'var(--space-3) var(--space-4)',fontSize:'var(--text-base)',color:'var(--text-primary)'}}>{row.event}</td>
                <td style={{padding:'var(--space-3) var(--space-4)'}}><Badge level={row.severity}>{sevLabel[row.severity]}</Badge></td>
                <td style={{padding:'var(--space-3) var(--space-4)',fontSize:'var(--text-base)',color:statusColor[row.status]||'var(--color-success)',fontWeight:'var(--font-medium)'}}>{row.status}</td>
                <td style={{padding:'var(--space-3) var(--space-4)',textAlign:'center'}}>
                  <span style={{color:'var(--color-info)',cursor:'pointer',fontSize:'var(--text-base)'}}>查看详情</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
