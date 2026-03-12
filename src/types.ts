export type ViewState = 'landing' | 'auth' | 'dashboard' | 'editor';

export interface User {
  id: string;
  name: string;
  avatar: string;
  credits: number;
  isVip: boolean;
}

export interface VideoTask {
  id: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  model: string;
  duration: number;
  resolution: string;
  ratio: string;
  mode: string;
  createdAt: number;
  referenceImages?: string[];
}
