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

const initialCameras: CameraView[] = [];

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
