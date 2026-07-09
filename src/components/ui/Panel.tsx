import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface PanelProps { open: boolean; onClose: () => void; title?: string; width?: number; children: ReactNode; }

export function Panel({ open, onClose, title, width = 400, children }: PanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:40 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x:'100%',opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:'100%',opacity:0 }}
            transition={{ duration:0.25,ease:[0.16,1,0.3,1] }}
            style={{ position:'fixed',top:0,right:0,bottom:0,width,
              background:'var(--bg-surface)',borderLeft:'1px solid rgba(255,255,255,.08)',
              zIndex:50,display:'flex',flexDirection:'column',boxShadow:'var(--shadow-lg)',overflow:'hidden' }}
          >
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'var(--space-4) var(--space-6)',borderBottom:'1px solid rgba(255,255,255,.06)',flexShrink:0 }}>
              {title&&<h3 style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)'}}>{title}</h3>}
              <button onClick={onClose} style={{ display:'flex',alignItems:'center',justifyContent:'center',
                width:32,height:32,borderRadius:'var(--radius-sm)',background:'transparent',color:'var(--text-secondary)',cursor:'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex:1,overflowY:'auto',padding:'var(--space-6)' }}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
