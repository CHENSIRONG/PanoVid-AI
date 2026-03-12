import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Image as ImageIcon, Wand2, History, 
  LogOut, Crown, Zap, Play, Edit3, Film, ArrowUp, Plus, X, RefreshCw, MoreHorizontal, Cloud, MonitorUp
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { VideoTask } from '../types';
import CloudAssetModal from './CloudAssetModal';

const MODELS = ['Seedance 2.0 Fast', '可灵 (Kling)', '豆包 (Doubao)', 'Veo', 'Sora'];
const RATIOS = ['16:9', '9:16', '21:9', '4:3', '1:1', '3:4'];
const DURATIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const RESOLUTIONS = ['720P', '1080P'];

export default function Dashboard() {
  const { user, setUser, setView, tasks, addTask, updateTask, setEditorVideo } = useAppContext();
  
  const [model, setModel] = useState(MODELS[0]);
  const [mode, setMode] = useState<'first_last' | 'multi' | 'agent'>('first_last');
  const [ratio, setRatio] = useState('16:9');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState('720P');
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const [showMention, setShowMention] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<number | 'general' | null>(null);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [storyboard, setStoryboard] = useState<{duration: number, prompt: string}[]>([{ duration: 2, prompt: '' }]);
  const [isStoryboardMode, setIsStoryboardMode] = useState(false);

  const promptRef = useRef<HTMLTextAreaElement>(null);

  const [viewMode, setViewMode] = useState<'chat' | 'history'>('chat');

  const calculateCost = () => {
    let cost = 10;
    if (mode === 'multi') cost += 10;
    if (mode === 'agent') cost += 20;
    cost += (duration - 5) * 2;
    return cost;
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrompt(val);
    if (val.endsWith('@') && images.length > 0) {
      setShowMention(true);
    } else {
      setShowMention(false);
    }
  };

  const insertMention = (index: number) => {
    setPrompt(prev => prev.slice(0, -1) + `[图片${index + 1}] `);
    setShowMention(false);
    promptRef.current?.focus();
  };

  const handleGenerate = () => {
    if (!prompt && images.length === 0) return;
    const cost = calculateCost();
    if (!user || user.credits < cost) {
      alert('积分不足，请充值！');
      return;
    }

    setUser({ ...user, credits: user.credits - cost });
    
    const newTaskId = Date.now().toString();
    const newTask: VideoTask = {
      id: newTaskId,
      prompt,
      status: 'generating',
      progress: 0,
      model,
      duration,
      resolution,
      ratio,
      mode,
      createdAt: Date.now(),
      referenceImages: [...images]
    };
    
    addTask(newTask);
    setPrompt('');
    setImages([]);

    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      if (p >= 100) {
        clearInterval(interval);
        updateTask(newTaskId, {
          status: 'completed',
          progress: 100,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnailUrl: newTask.referenceImages?.[0] || 'https://picsum.photos/seed/video/600/400',
        });
      } else {
        updateTask(newTaskId, { progress: p });
      }
    }, 200);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  const getAspectRatio = (r: string) => {
    const [w, h] = r.split(':').map(Number);
    return w && h ? `${w}/${h}` : '16/9';
  };

  const mockUpload = (index?: number | 'general') => {
    const newImg = `https://picsum.photos/seed/${Date.now()}/400/400`;
    if (index !== undefined && index !== 'general') {
      const newImages = [...images];
      newImages[index as number] = newImg;
      setImages(newImages);
    } else {
      setImages([...images, newImg]);
    }
    setUploadTarget(null);
  };

  const handleCloudSelect = (url: string) => {
    if (uploadTarget !== null) {
      if (uploadTarget !== 'general') {
        const newImages = [...images];
        newImages[uploadTarget as number] = url;
        setImages(newImages);
      } else {
        setImages([...images, url]);
      }
    }
    setUploadTarget(null);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-zinc-950 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">PanoVid AI</span>
        </div>
        
        <div className="p-4 flex-1 space-y-2">
          <button onClick={() => setViewMode('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${viewMode === 'chat' ? 'bg-violet-500/10 text-violet-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
            <Wand2 className="w-5 h-5" /> 创作空间
          </button>
          <button onClick={() => setViewMode('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${viewMode === 'history' ? 'bg-violet-500/10 text-violet-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
            <History className="w-5 h-5" /> 历史记录
          </button>
          <button onClick={() => setView('editor')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            <Film className="w-5 h-5" /> 去剪辑
          </button>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="bg-zinc-900 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <img src={user?.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-zinc-800" />
              <div>
                <div className="font-medium text-sm flex items-center gap-1">
                  {user?.name}
                  {user?.isVip && <Crown className="w-3 h-3 text-amber-400" />}
                </div>
                <div className="text-xs text-zinc-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> {user?.credits} 积分
                </div>
              </div>
            </div>
            <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors">
              充值积分 / 升级会员
            </button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative bg-[#09090b]">
        <header className="h-16 border-b border-white/10 flex items-center px-8 justify-between bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
          <h1 className="text-lg font-medium">{viewMode === 'chat' ? '视频创作' : '历史记录'}</h1>
        </header>

        {viewMode === 'history' ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {tasks.slice().reverse().map(task => (
                <div key={task.id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                  <div className="relative aspect-video bg-black group">
                    <img src={task.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="thumbnail" />
                    {task.status === 'completed' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform border border-white/10">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </button>
                      </div>
                    )}
                    {task.status === 'generating' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-violet-400 font-mono text-sm font-bold">{task.progress}%</div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-sm text-zinc-300 line-clamp-2 mb-4 flex-1">{task.prompt || '无提示词'}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-zinc-500">{new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.status === 'completed' && (
                        <button 
                          onClick={() => {
                            setEditorVideo(task);
                            setView('editor');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-medium hover:bg-violet-600/30 transition-colors"
                        >
                          去剪辑
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="col-span-full text-center py-20 text-zinc-500">
                  暂无历史记录
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Chat History Area */}
            <div id="chat-history" className="flex-1 overflow-y-auto p-8 space-y-10 pb-48 scroll-smooth">
          {tasks.slice().reverse().map(task => (
            <div key={task.id} className="max-w-4xl mx-auto flex gap-4">
              <img src={user?.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="text-sm text-zinc-300 leading-relaxed">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-zinc-500">参考图片，</span>
                    <span>{task.prompt || '无提示词'}</span>
                    <span className="text-zinc-500 text-xs ml-2 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {task.model} | {task.duration}s
                    </span>
                  </div>
                </div>
                
                {task.status === 'generating' ? (
                  <div 
                    className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 flex flex-col items-center justify-center p-8"
                    style={{ 
                      aspectRatio: getAspectRatio(task.ratio), 
                      maxWidth: task.ratio === '9:16' || task.ratio === '3:4' ? '280px' : '480px' 
                    }}
                  >
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                      <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold">
                        {task.progress}%
                      </div>
                    </div>
                    <p className="text-zinc-400 text-xs">正在渲染视频，请耐心等待...</p>
                  </div>
                ) : (
                  <div 
                    className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group"
                    style={{ 
                      aspectRatio: getAspectRatio(task.ratio), 
                      maxWidth: task.ratio === '9:16' || task.ratio === '3:4' ? '280px' : '480px' 
                    }}
                  >
                    <img src={task.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="video thumbnail" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform border border-white/10 shadow-xl">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </button>
                    </div>
                  </div>
                )}
                
                {task.status === 'completed' && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => {
                        setPrompt(task.prompt);
                        if (task.referenceImages) setImages(task.referenceImages);
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-medium hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> 重新编辑
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-medium hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> 再次生成
                    </button>
                    <button 
                      onClick={() => {
                        setEditorVideo(task);
                        setView('editor');
                      }}
                      className="px-4 py-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-medium hover:bg-violet-600/30 flex items-center gap-2 transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" /> 去剪辑
                    </button>
                    {task.resolution !== '1080P' && (
                      <button 
                        onClick={() => {
                          if (!user?.isVip) {
                            setShowVipModal(true);
                            return;
                          }
                          updateTask(task.id, { resolution: '1080P' });
                          alert('已提交转高清任务');
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-medium hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                      >
                        <MonitorUp className="w-3.5 h-3.5" /> 转高清
                      </button>
                    )}
                    <button className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-medium hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
            
        {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pointer-events-none">
              <div className="max-w-4xl mx-auto bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto relative">
                
                {/* Mention Popover */}
                {showMention && images.length > 0 && (
                  <div className="absolute bottom-full left-16 mb-2 bg-zinc-800 border border-white/10 rounded-lg shadow-xl p-2 flex gap-2 z-20">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => insertMention(i)} className="relative w-16 h-16 rounded overflow-hidden hover:ring-2 ring-violet-500">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center py-0.5">图{i+1}</div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 mb-4">
                  <div className="flex gap-2 flex-wrap shrink-0 relative">
                    {mode === 'first_last' ? (
                      <>
                        <div onClick={() => setUploadTarget(0)} className="relative w-16 h-16 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer">
                          {images[0] ? <img src={images[0]} className="w-full h-full object-cover rounded-xl" /> : <span className="text-[10px]">首帧</span>}
                          {images[0] && <button onClick={(e) => { e.stopPropagation(); removeImage(0); }} className="absolute -top-1 -right-1 bg-black/80 rounded-full p-0.5"><X className="w-3 h-3"/></button>}
                        </div>
                        <div onClick={() => setUploadTarget(1)} className="relative w-16 h-16 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer">
                          {images[1] ? <img src={images[1]} className="w-full h-full object-cover rounded-xl" /> : <span className="text-[10px]">尾帧</span>}
                          {images[1] && <button onClick={(e) => { e.stopPropagation(); removeImage(1); }} className="absolute -top-1 -right-1 bg-black/80 rounded-full p-0.5"><X className="w-3 h-3"/></button>}
                        </div>
                      </>
                    ) : (
                      <div className="relative w-16 h-16 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => setUploadTarget('general')}>
                        {images.length > 0 ? (
                          <>
                            <img src={images[images.length - 1]} className="w-full h-full object-cover rounded-xl" />
                            <div className="absolute -top-2 -right-2 bg-violet-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{images.length}</div>
                            <div className="absolute bottom-0 right-0 bg-black/80 p-1 rounded-tl-lg rounded-br-xl">
                              <Plus className="w-3 h-3 text-white" />
                            </div>
                            {/* Hover Preview */}
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex gap-1 p-1 bg-zinc-800 rounded-lg border border-white/10 z-50">
                              {images.map((img, i) => (
                                <div key={i} className="relative w-10 h-10 shrink-0">
                                  <img src={img} className="w-full h-full object-cover rounded" />
                                  <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute -top-1 -right-1 bg-black/80 rounded-full p-0.5"><X className="w-2 h-2"/></button>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </div>
                    )}
                    
                    {/* Upload Options Popover */}
                    {uploadTarget !== null && (
                      <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 border border-white/10 rounded-lg shadow-xl py-1 w-40 z-50">
                        <button 
                          onClick={() => mockUpload(uploadTarget)}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          从本地上传
                        </button>
                        <button 
                          onClick={() => {
                            setShowCloudModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          从720云素材库选择
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    {isStoryboardMode && model === '可灵 (Kling)' && (
                      <div className="mb-4 space-y-2 border border-white/10 rounded-xl p-3 bg-zinc-950/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-zinc-400">分镜描述</span>
                          <button onClick={() => setStoryboard([...storyboard, { duration: 2, prompt: '' }])} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> 添加分镜
                          </button>
                        </div>
                        {storyboard.map((scene, idx) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <div className="flex-shrink-0 w-16">
                              <div className="text-[10px] text-zinc-500 mb-1">分镜 {idx + 1}</div>
                              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg px-2 py-1">
                                <input 
                                  type="number" 
                                  value={scene.duration} 
                                  onChange={e => {
                                    const newSb = [...storyboard];
                                    newSb[idx].duration = Number(e.target.value);
                                    setStoryboard(newSb);
                                  }}
                                  className="w-full bg-transparent text-xs focus:outline-none text-center"
                                  min={1}
                                />
                                <span className="text-xs text-zinc-500 ml-1">s</span>
                              </div>
                            </div>
                            <textarea 
                              value={scene.prompt}
                              onChange={e => {
                                const newSb = [...storyboard];
                                newSb[idx].prompt = e.target.value;
                                setStoryboard(newSb);
                              }}
                              placeholder={`分镜 ${idx + 1} 画面描述...`}
                              className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs resize-none h-12 focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                            {storyboard.length > 1 && (
                              <button 
                                onClick={() => setStoryboard(storyboard.filter((_, i) => i !== idx))}
                                className="mt-5 p-1 text-zinc-500 hover:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea 
                      ref={promptRef}
                      value={prompt}
                      onChange={handlePromptChange}
                      placeholder="使用 @ 快速调用参考内容，例如：@图片1 模仿 @视频1 的动作，音色参考 @音频1"
                      className="flex-1 bg-transparent resize-none h-16 text-sm focus:outline-none placeholder:text-zinc-600 text-zinc-200"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <select value={mode} onChange={e => { setMode(e.target.value as any); setImages([]); }} className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none hover:bg-zinc-800 transition-colors cursor-pointer">
                      <option value="first_last">首尾帧</option>
                      <option value="multi">智能多帧</option>
                      <option value="agent">智能体模式</option>
                    </select>
                    <select value={model} onChange={e => setModel(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none hover:bg-zinc-800 transition-colors cursor-pointer">
                      {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {model === '可灵 (Kling)' && (
                      <button 
                        onClick={() => setIsStoryboardMode(!isStoryboardMode)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${isStoryboardMode ? 'bg-violet-600/20 border-violet-500/30 text-violet-400' : 'bg-zinc-950 border-white/10 hover:bg-zinc-800'}`}
                      >
                        分镜设置
                      </button>
                    )}
                    <select value={ratio} onChange={e => setRatio(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none hover:bg-zinc-800 transition-colors cursor-pointer">
                      {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none hover:bg-zinc-800 transition-colors cursor-pointer">
                      {DURATIONS.map(d => <option key={d} value={d}>{d}s</option>)}
                    </select>
                    <select 
                      value={resolution} 
                      onChange={e => {
                        if (e.target.value === '1080P' && !user?.isVip) {
                          setShowVipModal(true);
                          return;
                        }
                        setResolution(e.target.value);
                      }} 
                      className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                        setPrompt(prev => prev + '@');
                        if (images.length > 0) setShowMention(true);
                        promptRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs hover:bg-zinc-800 transition-colors font-mono"
                    >
                      @
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> {calculateCost()}
                    </span>
                    <button 
                      onClick={handleGenerate} 
                      disabled={!prompt && images.length === 0} 
                      className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      <CloudAssetModal 
        isOpen={showCloudModal} 
        onClose={() => {
          setShowCloudModal(false);
          setUploadTarget(null);
        }} 
        onSelect={handleCloudSelect} 
      />

      {/* VIP Modal */}
      <AnimatePresence>
        {showVipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowVipModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">开通会员解锁 1080P 高清画质</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  普通用户最高支持 720P 视频生成。升级会员即可享受 1080P 超清画质，以及更多专属特权。
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setUser(prev => prev ? { ...prev, isVip: true } : null);
                      setShowVipModal(false);
                      alert('模拟开通会员成功！');
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                  >
                    立即开通会员
                  </button>
                  <button 
                    onClick={() => setShowVipModal(false)}
                    className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                  >
                    暂不需要
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
