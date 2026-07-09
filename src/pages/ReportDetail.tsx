import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Monitor, Activity, Search, CheckCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { TableFilter } from '../components/ui/TableFilter';
import { mockReportRows } from '../data/mock';

const sevLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };
const statusColor: Record<string,string> = { '已处理':'var(--color-success)','标记误报':'var(--color-neutral)' };

export default function ReportDetail() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string,string[]>>({});

  const allCameras = useMemo(()=>[...new Set(mockReportRows.map(r=>r.camera))],[]);
  const allEvents = useMemo(()=>[...new Set(mockReportRows.map(r=>r.event))],[]);
  const allSeverities = useMemo(()=>['高危','中危','低危'],[]);
  const allStatuses = useMemo(()=>[...new Set(mockReportRows.map(r=>r.status))],[]);

  const filtered = useMemo(()=>mockReportRows.filter(r=>{
    if (filters.camera?.length && !filters.camera.includes(r.camera)) return false;
    if (filters.event?.length && !filters.event.includes(r.event)) return false;
    if (filters.severity?.length && !filters.severity.includes(sevLabel[r.severity])) return false;
    if (filters.status?.length && !filters.status.includes(r.status)) return false;
    return true;
  }),[filters]);

  const setFilter = (key:string)=>(vals:string[])=>setFilters(prev=>({...prev,[key]:vals.length?vals:[]}));

  return (
    <div style={{padding:'var(--space-6)',height:'100%',overflow:'auto'}}>
      <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',overflow:'hidden'}}>
        <div style={{padding:'var(--space-4) var(--space-6)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <h2 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)'}}>日报详情 · {date}</h2>
        </div>
        <StatsBar data={mockReportRows} />
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'var(--bg-elevated)'}}>
              <th style={thStyle}>序号</th>
              <th style={thStyle}>发生时间</th>
              <th style={thStyle}><TableFilter label="所属视图" options={allCameras} selected={filters.camera||[]} onChange={setFilter('camera')}/></th>
              <th style={thStyle}><TableFilter label="告警事件" options={allEvents} selected={filters.event||[]} onChange={setFilter('event')}/></th>
              <th style={thStyle}><TableFilter label="告警级别" options={allSeverities} selected={filters.severity||[]} onChange={setFilter('severity')}/></th>
              <th style={thStyle}><TableFilter label="处理状态" options={allStatuses} selected={filters.status||[]} onChange={setFilter('status')}/></th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row,i)=>(
              <tr key={row.seq} style={{background:i%2===0?'var(--bg-canvas)':'transparent'}}>
                <td style={tdStyle}>{row.seq}</td>
                <td style={{...tdStyle,fontFamily:'var(--font-mono)'}}>{row.time}</td>
                <td style={tdStyle}>{row.camera}</td>
                <td style={tdStyle}>{row.event}</td>
                <td style={{padding:'var(--space-3) var(--space-4)'}}><Badge level={row.severity}>{sevLabel[row.severity]}</Badge></td>
                <td style={{...tdStyle,color:statusColor[row.status]||'var(--color-success)',fontWeight:'var(--font-medium)'}}>{row.status}</td>
                <td style={{padding:'var(--space-3) var(--space-4)',textAlign:'center'}}>
                  <span style={{color:'var(--color-info)',cursor:'pointer',fontSize:'var(--text-base)'}}
                    onClick={()=>navigate(`/replay/${row.eventId}`,{state:{from:`/report/${date}`,reportStatus:row.status}})}>查看详情</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding:'var(--space-3) var(--space-4)',textAlign:'left',
  fontSize:'var(--text-sm)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)',
  borderBottom:'1px solid rgba(255,255,255,.08)',whiteSpace:'nowrap' };
const tdStyle: React.CSSProperties = { padding:'var(--space-3) var(--space-4)',fontSize:'var(--text-base)',color:'var(--text-primary)' };

interface ReportStat { label:string;value:number;icon:typeof Monitor;color:string;iconColor:string }

const statDefs: ReportStat[] = [
  { label:'设备运行',value:18,icon:Monitor,color:'var(--color-info-dim)',iconColor:'var(--color-info)' },
  { label:'用户操作',value:35,icon:Activity,color:'var(--color-success-dim)',iconColor:'var(--color-success)' },
  { label:'识别结果',value:128,icon:Search,color:'var(--color-warning-dim)',iconColor:'var(--color-warning)' },
  { label:'告警处理',value:5,icon:CheckCircle,color:'var(--color-danger-dim)',iconColor:'var(--color-danger)' },
];

function StatsBar({ data }: { data: { status:string }[] }) {
  const processed = data.filter(r=>r.status==='已处理').length;
  const dynamic: ReportStat[] = statDefs.map((s,i)=>{
    if (i===0) return { ...s, value: 18 };
    if (i===1) return { ...s, value: 35 };
    if (i===2) return { ...s, value: data.length };
    return { ...s, value: processed };
  });
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--space-3)',padding:'var(--space-4) var(--space-6)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
      {dynamic.map(s=>(
        <div key={s.label} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',padding:'var(--space-3)',background:'var(--bg-canvas)',borderRadius:'var(--radius-md)'}}>
          <div style={{width:36,height:36,borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',background:s.color,color:s.iconColor,flexShrink:0}}>
            <s.icon size={18}/>
          </div>
          <div>
            <div style={{fontSize:'var(--text-xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',lineHeight:1.2}}>{s.value}</div>
            <div style={{fontSize:'var(--text-xs)',color:'var(--text-secondary)'}}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
