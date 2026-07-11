import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CameraView {
  id: string;
  name: string;
  status: 'online' | 'offline';
  videoDevice?: string;
  audioDevice?: string;
}

interface CameraCtx {
  cameras: CameraView[];
  addCamera: (cam: CameraView) => void;
  updateCamera: (id: string, updates: Partial<CameraView>) => void;
  removeCamera: (id: string) => void;
}

const Ctx = createContext<CameraCtx>({ cameras: [], addCamera: () => {}, updateCamera: () => {}, removeCamera: () => {} });

const initialCameras: CameraView[] = [
  { id:'cam-01',name:'视图01-1号车间入口',status:'online' },
  { id:'cam-02',name:'视图02-2号库房通道',status:'online' },
  { id:'cam-03',name:'视图03-3号生产线A区',status:'online' },
  { id:'cam-04',name:'视图04-4号装配线',status:'online' },
  { id:'cam-05',name:'视图05-5号原料仓库',status:'online' },
  { id:'cam-06',name:'视图06-6号成品区',status:'online' },
  { id:'cam-07',name:'视图07-7号停车场',status:'online' },
  { id:'cam-08',name:'视图08-8号围墙东段',status:'offline' },
  { id:'cam-09',name:'视图09-9号办公楼入口',status:'offline' },
];

export function CameraProvider({ children }: { children: ReactNode }) {
  const [cameras, setCameras] = useState<CameraView[]>(initialCameras);

  const addCamera = useCallback((cam: CameraView) => {
    setCameras(prev => [...prev, { ...cam, status: 'online' }]);
  }, []);

  const updateCamera = useCallback((id: string, updates: Partial<CameraView>) => {
    setCameras(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCamera = useCallback((id: string) => {
    setCameras(prev => prev.filter(c => c.id !== id));
  }, []);

  return <Ctx.Provider value={{ cameras, addCamera, updateCamera, removeCamera }}>{children}</Ctx.Provider>;
}

export function useCameras() {
  return useContext(Ctx);
}
