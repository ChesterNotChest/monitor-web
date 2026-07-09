import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface TableFilterProps { label: string; options: string[]; selected: string[]; onChange: (selected: string[]) => void; }

export function TableFilter({ label, options, selected, onChange }: TableFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',h);return ()=>document.removeEventListener('mousedown',h)},[]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(s=>s!==opt));
    else onChange([...selected, opt]);
  };

  return (
    <div ref={ref} style={{position:'relative',display:'inline-block'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'var(--text-sm)',
        fontWeight:'var(--font-semibold)',color:selected.length?'var(--color-info)':'var(--text-primary)',display:'flex',alignItems:'center',gap:4,padding:0}}>
        {label}<span style={{fontSize:10,color:'var(--text-disabled)'}}>▼</span>
        {selected.length>0&&<span style={{fontSize:10,background:'var(--color-info)',color:'#fff',borderRadius:'var(--radius-full)',minWidth:16,height:16,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>{selected.length}</span>}
      </button>
      {open && (
        <div style={{position:'absolute',top:'100%',left:0,zIndex:60,marginTop:4,minWidth:140,
          background:'var(--bg-elevated)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'var(--radius-md)',
          boxShadow:'var(--shadow-lg)',overflow:'hidden'}}>
          {options.map(opt=>(
            <div key={opt} onClick={()=>toggle(opt)}
              style={{display:'flex',alignItems:'center',gap:8,padding:'var(--space-2) var(--space-3)',
                cursor:'pointer',fontSize:'var(--text-sm)',color:'var(--text-primary)',
                background:selected.includes(opt)?'var(--bg-hover)':'transparent'}}>
              <span style={{width:16,height:16,borderRadius:2,border:`1px solid ${selected.includes(opt)?'var(--color-info)':'rgba(255,255,255,.2)'}`,
                background:selected.includes(opt)?'var(--color-info)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {selected.includes(opt)&&<Check size={12} style={{color:'#fff'}}/>}
              </span>
              {opt}
            </div>
          ))}
          {selected.length>0&&(
            <div onClick={()=>onChange([])} style={{padding:'var(--space-2) var(--space-3)',cursor:'pointer',
              borderTop:'1px solid rgba(255,255,255,.06)',fontSize:'var(--text-xs)',color:'var(--text-secondary)',textAlign:'center'}}>清除筛选</div>
          )}
        </div>
      )}
    </div>
  );
}
