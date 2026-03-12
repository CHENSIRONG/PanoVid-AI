import React, { createContext, useContext, useState } from 'react';
import { ViewState, User, VideoTask } from './types';

interface AppContextType {
  view: ViewState;
  setView: (v: ViewState) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  tasks: VideoTask[];
  addTask: (task: VideoTask) => void;
  updateTask: (id: string, updates: Partial<VideoTask>) => void;
  editorVideo: VideoTask | null;
  setEditorVideo: (v: VideoTask | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>({
    id: 'demo_user',
    name: '体验官',
    avatar: 'https://picsum.photos/seed/avatar/100/100',
    credits: 500,
    isVip: true
  });
  const [tasks, setTasks] = useState<VideoTask[]>([
    {
      id: 'demo_task_1',
      prompt: '航拍视角的现代化科技园区，玻璃幕墙反射着金色的夕阳，镜头平滑推进。',
      status: 'completed',
      progress: 100,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/demo1/600/400',
      model: 'Seedance 2.0 Fast',
      duration: 5,
      resolution: '1080p',
      ratio: '16:9',
      mode: 'i2v',
      createdAt: Date.now() - 3600000,
      referenceImages: ['https://picsum.photos/seed/ref1/400/400']
    }
  ]);
  const [editorVideo, setEditorVideo] = useState<VideoTask | null>(null);

  const addTask = (task: VideoTask) => setTasks(prev => [task, ...prev]);
  const updateTask = (id: string, updates: Partial<VideoTask>) => 
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  return (
    <AppContext.Provider value={{ view, setView, user, setUser, tasks, addTask, updateTask, editorVideo, setEditorVideo }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
