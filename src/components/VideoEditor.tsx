import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Download, Play, Pause, Scissors, Trash2, Type, Music, 
  Image as ImageIcon, Video, Cloud, Undo, LayoutGrid, List, Upload,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { useAppContext } from '../AppContext';

interface TrackItem {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image';
  src?: string;
  text?: string;
  start: number;
  end: number;
  scale?: number;
  opacity?: number;
  x?: number;
  y?: number;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  volume?: number;
}

interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  isMain?: boolean;
  items: TrackItem[];
}

export default function VideoEditor() {
  const { setView, editorVideo, tasks } = useAppContext();
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [editorRatio, setEditorRatio] = useState('16:9');
  const [zoom, setZoom] = useState(20); // pixels per second
  
  const [tracks, setTracks] = useState<Track[]>([
    { id: 't1', type: 'text', items: [] },
    { id: 'v2', type: 'video', items: [] },
    { id: 'v1', type: 'video', isMain: true, items: editorVideo ? [{ id: 'i1', type: 'video', src: editorVideo.thumbnailUrl, start: 0, end: editorVideo.duration, scale: 100, opacity: 100, x: 0, y: 0 }] : [] },
    { id: 'a1', type: 'audio', items: [] }
  ]);
  
  const [history, setHistory] = useState<Track[][]>([]);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isBound, setIsBound] = useState(false);

  // Asset Panel State
  const [assetView, setAssetView] = useState<'grid' | 'list'>('grid');
  const [assetFilter, setAssetFilter] = useState<'all' | 'video' | 'image'>('all');
  const [localAssets, setLocalAssets] = useState<any[]>([]);

  const timelineRef = useRef<HTMLDivElement>(null);
  
  const duration = Math.max(10, ...tracks.flatMap(t => t.items.map(i => i.end)));

  // Dragging State
  const [dragInfo, setDragInfo] = useState<{
    itemId: string;
    trackId: string;
    mode: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    startY: number;
    initialStart: number;
    initialEnd: number;
    currentStart: number;
    currentEnd: number;
    targetTrackId: string;
    edgeType: 'top' | 'bottom' | null;
  } | null>(null);

  // History Management
  const setTracksWithHistory = (newTracks: Track[] | ((prev: Track[]) => Track[])) => {
    setTracks(prev => {
      const next = typeof newTracks === 'function' ? newTracks(prev) : newTracks;
      setHistory(h => [...h, prev].slice(-20)); // Keep last 20 states
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setTracks(prev);
  };

  // Playback
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(t => {
          if (t >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return t + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        handleDelete();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, history]);

  // Track Operations
  const addTrack = (type: 'video' | 'audio' | 'text') => {
    setTracksWithHistory(prev => {
      const newTrack: Track = { id: `${type}_${Date.now()}`, type, items: [] };
      if (type === 'audio') {
        return [...prev, newTrack];
      } else if (type === 'text') {
        return [newTrack, ...prev];
      } else {
        const mainIndex = prev.findIndex(t => t.isMain);
        const newTracks = [...prev];
        newTracks.splice(Math.max(0, mainIndex), 0, newTrack);
        return newTracks;
      }
    });
  };

  const handleAddAsset = (asset: any, dropTime?: number, targetTrackId?: string) => {
    setTracksWithHistory(prev => {
      const newTracks = [...prev];
      let tIndex = -1;
      
      if (targetTrackId) {
        tIndex = newTracks.findIndex(t => t.id === targetTrackId);
      } else {
        tIndex = newTracks.findIndex(t => t.isMain);
        if (tIndex === -1) tIndex = newTracks.findIndex(t => t.type === 'video');
      }
      
      if (tIndex === -1) return prev;
      
      const track = newTracks[tIndex];
      const lastEnd = track.items.length > 0 ? Math.max(...track.items.map(i => i.end)) : 0;
      const start = dropTime !== undefined ? dropTime : lastEnd;
      
      const newTrack = { ...track, items: [...track.items] };
      newTrack.items.push({
        id: `item_${Date.now()}_${Math.random()}`,
        type: asset.type || 'video',
        src: asset.thumbnailUrl,
        start: start,
        end: start + (asset.duration || 5),
        scale: 100,
        opacity: 100,
        x: 0,
        y: 0
      });
      
      newTracks[tIndex] = newTrack;
      return newTracks;
    });
  };

  const handleAddText = () => {
    setTracksWithHistory(prev => {
      const newTracks = [...prev];
      const tIndex = newTracks.findIndex(t => t.type === 'text');
      if (tIndex === -1) return prev;
      
      const newTTrack = { ...newTracks[tIndex], items: [...newTracks[tIndex].items] };
      newTTrack.items.push({
        id: `t_${Date.now()}`,
        type: 'text',
        text: '双击修改字幕',
        start: currentTime,
        end: currentTime + 3,
        scale: 100,
        opacity: 100,
        x: 0,
        y: 0,
        fontSize: 24,
        color: '#ffffff',
        strokeColor: '#000000'
      });
      
      newTracks[tIndex] = newTTrack;
      return newTracks;
    });
  };

  const handleAddAudio = () => {
    setTracksWithHistory(prev => {
      const newTracks = [...prev];
      const aIndex = newTracks.findIndex(t => t.type === 'audio');
      if (aIndex === -1) return prev;
      
      const newATrack = { ...newTracks[aIndex], items: [...newTracks[aIndex].items] };
      newATrack.items.push({
        id: `a_${Date.now()}`,
        type: 'audio',
        src: 'audio_mock',
        start: currentTime,
        end: currentTime + 5,
        volume: 100
      });
      
      newTracks[aIndex] = newATrack;
      return newTracks;
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setTracksWithHistory(prev => prev.map(t => ({
      ...t,
      items: t.items.filter(i => i.id !== selectedId)
    })));
    setSelectedId(null);
  };

  const handleSplit = () => {
    if (!selectedId) return;
    setTracksWithHistory(prev => {
      const newTracks = [...prev];
      for (let i = 0; i < newTracks.length; i++) {
        const track = newTracks[i];
        const itemIndex = track.items.findIndex(item => item.id === selectedId);
        if (itemIndex !== -1) {
          const item = track.items[itemIndex];
          if (currentTime > item.start && currentTime < item.end) {
            const newTrack = { ...track, items: [...track.items] };
            const newItem = { ...item, id: `${item.id}_split_${Math.random()}`, start: currentTime };
            newTrack.items[itemIndex] = { ...item, end: currentTime };
            newTrack.items.push(newItem);
            newTracks[i] = newTrack;
          }
          break;
        }
      }
      return newTracks;
    });
  };

  const handleTrimLeft = () => {
    if (!selectedId) return;
    setTracksWithHistory(prev => prev.map(track => {
      const itemIndex = track.items.findIndex(i => i.id === selectedId);
      if (itemIndex !== -1) {
        const item = track.items[itemIndex];
        if (currentTime > item.start && currentTime < item.end) {
          const newItems = [...track.items];
          newItems[itemIndex] = { ...item, start: currentTime };
          return { ...track, items: newItems };
        }
      }
      return track;
    }));
  };

  const handleTrimRight = () => {
    if (!selectedId) return;
    setTracksWithHistory(prev => prev.map(track => {
      const itemIndex = track.items.findIndex(i => i.id === selectedId);
      if (itemIndex !== -1) {
        const item = track.items[itemIndex];
        if (currentTime > item.start && currentTime < item.end) {
          const newItems = [...track.items];
          newItems[itemIndex] = { ...item, end: currentTime };
          return { ...track, items: newItems };
        }
      }
      return track;
    }));
  };

  const updateSelectedItem = (updates: Partial<TrackItem>) => {
    if (!selectedId) return;
    setTracksWithHistory(prev => prev.map(t => ({
      ...t,
      items: t.items.map(i => i.id === selectedId ? { ...i, ...updates } : i)
    })));
  };

  // Sync
  const handleSync = () => {
    if (!isBound) {
      if (confirm('您还未绑定720云账号，是否前往绑定？')) {
        setIsBound(true);
        alert('绑定成功！请再次点击同步。');
      }
      return;
    }
    
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSyncing(false);
            alert('同步成功！');
          }, 500);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  // Timeline Interaction
  const updatePlayhead = (e: React.MouseEvent | MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const time = Math.max(0, (x - 64) / zoom);
      setCurrentTime(Math.min(time, duration));
    }
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPlayhead(true);
    updatePlayhead(e);
  };

  // Custom Drag Logic
  const handleItemMouseDown = (e: React.MouseEvent, item: TrackItem, trackId: string, mode: 'move' | 'resize-left' | 'resize-right') => {
    e.stopPropagation();
    setSelectedId(item.id);
    setDragInfo({
      itemId: item.id,
      trackId,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialStart: item.start,
      initialEnd: item.end,
      currentStart: item.start,
      currentEnd: item.end,
      targetTrackId: trackId,
      edgeType: null
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead) updatePlayhead(e);
      
      if (dragInfo) {
        const dx = e.clientX - dragInfo.startX;
        const dt = dx / zoom;
        
        let newStart = dragInfo.initialStart;
        let newEnd = dragInfo.initialEnd;
        
        if (dragInfo.mode === 'move') {
          newStart = Math.max(0, dragInfo.initialStart + dt);
          newEnd = newStart + (dragInfo.initialEnd - dragInfo.initialStart);
          
          // Snapping logic
          const snapThreshold = 10 / zoom;
          let targetTrackId = dragInfo.trackId;
          let edgeType: 'top' | 'bottom' | null = null;
          
          if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const trackElements = timelineRef.current.querySelectorAll('.track-row');
            
            trackElements.forEach((el) => {
              const trackRect = el.getBoundingClientRect();
              if (e.clientY >= trackRect.top && e.clientY <= trackRect.bottom) {
                targetTrackId = el.getAttribute('data-track-id') || dragInfo.trackId;
              }
            });
            
            if (e.clientY < rect.top + 20) edgeType = 'top';
            else if (e.clientY > rect.bottom - 20) edgeType = 'bottom';
          }

          const targetTrack = tracks.find(t => t.id === targetTrackId);
          if (targetTrack) {
            for (const other of targetTrack.items) {
              if (other.id === dragInfo.itemId) continue;
              if (Math.abs(newStart - other.end) < snapThreshold) {
                newStart = other.end;
                newEnd = newStart + (dragInfo.initialEnd - dragInfo.initialStart);
                break;
              }
              if (Math.abs(newEnd - other.start) < snapThreshold) {
                newEnd = other.start;
                newStart = newEnd - (dragInfo.initialEnd - dragInfo.initialStart);
                break;
              }
              if (Math.abs(newStart - other.start) < snapThreshold) {
                newStart = other.start;
                newEnd = newStart + (dragInfo.initialEnd - dragInfo.initialStart);
                break;
              }
            }
          }
          
          setDragInfo(prev => prev ? { ...prev, currentStart: newStart, currentEnd: newEnd, targetTrackId, edgeType } : null);
          
        } else if (dragInfo.mode === 'resize-left') {
          newStart = Math.min(dragInfo.initialEnd - 0.1, Math.max(0, dragInfo.initialStart + dt));
          setDragInfo(prev => prev ? { ...prev, currentStart: newStart } : null);
        } else if (dragInfo.mode === 'resize-right') {
          newEnd = Math.max(dragInfo.initialStart + 0.1, dragInfo.initialEnd + dt);
          setDragInfo(prev => prev ? { ...prev, currentEnd: newEnd } : null);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      
      if (dragInfo) {
        setTracksWithHistory(prev => {
          let newTracks = prev.map(t => ({ ...t, items: [...t.items] }));
          
          const sourceTrackIndex = newTracks.findIndex(t => t.id === dragInfo.trackId);
          let targetTrackIndex = newTracks.findIndex(t => t.id === dragInfo.targetTrackId);
          
          if (sourceTrackIndex === -1) return prev;
          
          const itemIndex = newTracks[sourceTrackIndex].items.findIndex(i => i.id === dragInfo.itemId);
          if (itemIndex === -1) return prev;
          
          const item = newTracks[sourceTrackIndex].items[itemIndex];
          
          if (dragInfo.edgeType === 'top') {
             const newTrack: Track = { id: `${item.type}_${Date.now()}`, type: item.type === 'audio' ? 'audio' : 'video', items: [] };
             newTracks.unshift(newTrack);
             targetTrackIndex = 0;
          } else if (dragInfo.edgeType === 'bottom') {
             const newTrack: Track = { id: `${item.type}_${Date.now()}`, type: item.type === 'audio' ? 'audio' : 'video', items: [] };
             newTracks.push(newTrack);
             targetTrackIndex = newTracks.length - 1;
          }
          
          const targetTrack = newTracks[targetTrackIndex];
          
          if ((targetTrack.type === 'audio' && item.type !== 'audio') || 
              (targetTrack.type !== 'audio' && item.type === 'audio')) {
             targetTrackIndex = sourceTrackIndex;
          }

          newTracks[sourceTrackIndex].items.splice(itemIndex, 1);
          
          if (dragInfo.mode === 'move') {
             newTracks[targetTrackIndex].items.sort((a, b) => a.start - b.start);
             let overlapItem = newTracks[targetTrackIndex].items.find(i => i.start >= dragInfo.currentStart && i.start < dragInfo.currentEnd);
             
             if (overlapItem) {
                 const shift = dragInfo.currentEnd - overlapItem.start;
                 newTracks[targetTrackIndex].items = newTracks[targetTrackIndex].items.map(other => {
                     if (other.start >= overlapItem.start) {
                         return { ...other, start: other.start + shift, end: other.end + shift };
                     }
                     return other;
                 });
             }
          }
          
          newTracks[targetTrackIndex].items.push({
            ...item,
            start: dragInfo.currentStart,
            end: dragInfo.currentEnd
          });
          
          return newTracks;
        });
        setDragInfo(null);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, dragInfo, zoom, tracks]);

  // Asset Drag & Drop
  const handleTrackDrop = (e: React.DragEvent, targetTrackId: string) => {
    e.preventDefault();
    const assetData = e.dataTransfer.getData('asset');
    if (assetData) {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - rect.left + e.currentTarget.scrollLeft;
      const dropTime = Math.max(0, (dropX - 64) / zoom);
      try {
        const asset = JSON.parse(assetData);
        handleAddAsset(asset, dropTime, targetTrackId);
      } catch (err) {}
    }
  };

  // Derived State
  const selectedItem = tracks.flatMap(t => t.items).find(i => i.id === selectedId);
  const activeVideo = tracks.find(t => t.type === 'video' && t.isMain)?.items.find(i => currentTime >= i.start && currentTime < i.end) 
                   || tracks.find(t => t.type === 'video')?.items.find(i => currentTime >= i.start && currentTime < i.end);
  const activeText = tracks.find(t => t.type === 'text')?.items.find(i => currentTime >= i.start && currentTime < i.end);

  const allAssets = [...localAssets, ...tasks];
  const filteredAssets = allAssets.filter(a => {
    if (assetFilter === 'all') return true;
    if (assetFilter === 'video') return a.type !== 'image';
    if (assetFilter === 'image') return a.type === 'image';
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900 shrink-0">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回工作台
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">轻量剪辑</span>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <select value={editorRatio} onChange={e => setEditorRatio(e.target.value)} className="bg-zinc-800 text-xs rounded px-2 py-1 border border-white/10 focus:outline-none">
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
            <option value="4:3">4:3</option>
            <option value="3:4">3:4</option>
          </select>
          <button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="px-4 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Cloud className="w-4 h-4" /> 
            {isSyncing ? `同步中 ${syncProgress}%` : '同步素材到720云'}
          </button>
          <button onClick={() => alert('导出成功，已下载到本地！')} className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> 导出视频
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Assets */}
        <aside className="w-72 border-r border-white/10 bg-zinc-950 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 素材库
              </div>
              <div className="flex items-center gap-1 bg-zinc-900 rounded p-0.5 border border-white/5">
                <button onClick={() => setAssetView('grid')} className={`p-1 rounded ${assetView === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
                <button onClick={() => setAssetView('list')} className={`p-1 rounded ${assetView === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><List className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={assetFilter} onChange={e => setAssetFilter(e.target.value as any)} className="flex-1 bg-zinc-900 text-xs rounded px-2 py-1.5 border border-white/10 focus:outline-none">
                <option value="all">全部素材</option>
                <option value="video">仅视频</option>
                <option value="image">仅图片</option>
              </select>
              <button 
                onClick={() => {
                  setLocalAssets([{ id: `local_${Date.now()}`, type: 'image', thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/400/400`, duration: 5, isLocal: true }, ...localAssets]);
                }}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded border border-white/10 text-zinc-300 transition-colors" title="上传本地素材"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className={`flex-1 overflow-y-auto p-4 ${assetView === 'grid' ? 'grid grid-cols-2 gap-2 content-start' : 'flex flex-col gap-2'}`}>
            {filteredAssets.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleAddAsset(t)} 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('asset', JSON.stringify(t));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className={`group relative bg-zinc-900 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-violet-500 transition-colors ${assetView === 'list' ? 'flex h-16' : 'aspect-video'}`}
                title="点击或拖拽添加到轨道"
              >
                <img src={t.thumbnailUrl} alt="" className={`${assetView === 'list' ? 'w-24 h-full' : 'w-full h-full'} object-cover opacity-80 group-hover:opacity-100`} />
                {assetView === 'list' && (
                  <div className="flex-1 p-2 flex flex-col justify-center">
                    <div className="text-xs truncate text-zinc-300">{t.prompt || '本地素材'}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">{t.type === 'image' ? '图片' : '视频'} • {t.duration}s</div>
                  </div>
                )}
                {assetView === 'grid' && (
                  <div className="absolute bottom-1 right-1 px-1 bg-black/60 text-[10px] rounded">{t.duration}s</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                  <span className="text-xs font-medium">+ 添加</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Preview & Properties */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex p-4 gap-4">
            <div className="flex-1 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
              <div 
                className="bg-black relative overflow-hidden flex items-center justify-center"
                style={{
                  aspectRatio: editorRatio.replace(':', '/'),
                  width: editorRatio === '9:16' || editorRatio === '3:4' ? 'auto' : '100%',
                  height: editorRatio === '9:16' || editorRatio === '3:4' ? '100%' : 'auto',
                  maxHeight: '100%',
                  maxWidth: '100%'
                }}
              >
                {activeVideo ? (
                  <img 
                    src={activeVideo.src} 
                    alt="Preview" 
                    className="w-full h-full object-contain transition-all"
                    style={{ 
                      transform: `scale(${(activeVideo.scale || 100) / 100}) translate(${(activeVideo.x || 0)}px, ${(activeVideo.y || 0)}px)`,
                      opacity: (activeVideo.opacity || 100) / 100
                    }}
                  />
                ) : (
                  <div className="text-zinc-600 text-sm">暂无画面</div>
                )}
                
                {activeText && (
                  <div 
                    className="absolute drop-shadow-md"
                    style={{ 
                      opacity: (activeText.opacity || 100) / 100,
                      transform: `translate(${(activeText.x || 0)}px, ${(activeText.y || 0)}px)`,
                      fontSize: `${activeText.fontSize || 24}px`,
                      color: activeText.color || '#ffffff',
                      WebkitTextStroke: `1px ${activeText.strokeColor || '#000000'}`,
                      fontFamily: activeText.fontFamily || 'sans-serif'
                    }}
                  >
                    {activeText.text}
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full bg-zinc-900/80 backdrop-blur border border-white/10">
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 hover:text-violet-400 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <div className="text-xs font-mono w-24 text-center">
                  00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:{Math.floor(duration).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="w-64 bg-zinc-900 rounded-xl border border-white/10 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
              <h3 className="font-medium text-sm border-b border-white/10 pb-2">属性设置</h3>
              {selectedItem ? (
                <div className="space-y-4">
                  {(selectedItem.type === 'video' || selectedItem.type === 'image') && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex justify-between">
                          <span>缩放比例</span>
                          <span>{selectedItem.scale || 100}%</span>
                        </label>
                        <input type="range" min="10" max="300" value={selectedItem.scale || 100} onChange={e => updateSelectedItem({ scale: Number(e.target.value) })} className="w-full accent-violet-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex justify-between">
                          <span>透明度</span>
                          <span>{selectedItem.opacity || 100}%</span>
                        </label>
                        <input type="range" min="0" max="100" value={selectedItem.opacity || 100} onChange={e => updateSelectedItem({ opacity: Number(e.target.value) })} className="w-full accent-violet-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400">X 轴位置</label>
                          <input type="number" value={selectedItem.x || 0} onChange={e => updateSelectedItem({ x: Number(e.target.value) })} className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-violet-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400">Y 轴位置</label>
                          <input type="number" value={selectedItem.y || 0} onChange={e => updateSelectedItem({ y: Number(e.target.value) })} className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-violet-500" />
                        </div>
                      </div>
                    </>
                  )}
                  {selectedItem.type === 'text' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400">字幕内容</label>
                        <textarea value={selectedItem.text || ''} onChange={e => updateSelectedItem({ text: e.target.value })} className="w-full h-20 bg-zinc-950 border border-white/10 rounded p-2 text-xs resize-none focus:outline-none focus:border-violet-500" placeholder="输入字幕..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400">字体</label>
                        <select value={selectedItem.fontFamily || 'sans-serif'} onChange={e => updateSelectedItem({ fontFamily: e.target.value })} className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-violet-500">
                          <option value="sans-serif">无衬线体</option>
                          <option value="serif">衬线体</option>
                          <option value="monospace">等宽字体</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex justify-between">
                          <span>字号</span>
                          <span>{selectedItem.fontSize || 24}px</span>
                        </label>
                        <input type="range" min="12" max="120" value={selectedItem.fontSize || 24} onChange={e => updateSelectedItem({ fontSize: Number(e.target.value) })} className="w-full accent-violet-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400">填充颜色</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={selectedItem.color || '#ffffff'} onChange={e => updateSelectedItem({ color: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" />
                            <span className="text-xs text-zinc-300">{selectedItem.color || '#ffffff'}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400">描边颜色</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={selectedItem.strokeColor || '#000000'} onChange={e => updateSelectedItem({ strokeColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" />
                            <span className="text-xs text-zinc-300">{selectedItem.strokeColor || '#000000'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex justify-between">
                          <span>透明度</span>
                          <span>{selectedItem.opacity || 100}%</span>
                        </label>
                        <input type="range" min="0" max="100" value={selectedItem.opacity || 100} onChange={e => updateSelectedItem({ opacity: Number(e.target.value) })} className="w-full accent-violet-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400">X 轴位置</label>
                          <input type="number" value={selectedItem.x || 0} onChange={e => updateSelectedItem({ x: Number(e.target.value) })} className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-violet-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400">Y 轴位置</label>
                          <input type="number" value={selectedItem.y || 0} onChange={e => updateSelectedItem({ y: Number(e.target.value) })} className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-violet-500" />
                        </div>
                      </div>
                    </>
                  )}
                  {selectedItem.type === 'audio' && (
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 flex justify-between">
                        <span>音量</span>
                        <span>{selectedItem.volume || 100}%</span>
                      </label>
                      <input type="range" min="0" max="200" value={selectedItem.volume || 100} onChange={e => updateSelectedItem({ volume: Number(e.target.value) })} className="w-full accent-violet-500" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-zinc-500 text-center py-10">请在轨道中选择一个素材</div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="h-72 border-t border-white/10 bg-zinc-950 flex flex-col shrink-0">
            {/* Toolbar */}
            <div className="h-10 border-b border-white/10 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <button onClick={handleUndo} disabled={history.length === 0} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50" title="撤销 (Ctrl+Z)"><Undo className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={handleSplit} disabled={!selectedId} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50" title="分割 (在当前时间线位置)"><Scissors className="w-4 h-4" /></button>
                <button onClick={handleTrimLeft} disabled={!selectedId} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50" title="向左裁剪"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={handleTrimRight} disabled={!selectedId} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50" title="向右裁剪"><ChevronRight className="w-4 h-4" /></button>
                <button onClick={handleDelete} disabled={!selectedId} className="p-1.5 rounded hover:bg-white/10 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" title="删除 (Del键)"><Trash2 className="w-4 h-4" /></button>
                
                <div className="w-px h-4 bg-white/10 mx-2" />
                
                <button onClick={() => addTrack('video')} className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/10 text-zinc-300 transition-colors"><Plus className="w-3 h-3" /> 视频轨</button>
                <button onClick={handleAddText} className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/10 text-zinc-300 transition-colors"><Type className="w-3 h-3" /> 添加字幕</button>
                <button onClick={handleAddAudio} className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/10 text-zinc-300 transition-colors"><Music className="w-3 h-3" /> 上传音频</button>
              </div>
              
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4 text-zinc-500" />
                <input type="range" min="5" max="50" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-24 accent-violet-500" />
                <ZoomIn className="w-4 h-4 text-zinc-500" />
              </div>
            </div>

            {/* Tracks Area */}
            <div 
              className="flex-1 overflow-x-auto overflow-y-auto p-2 space-y-2 relative" 
              ref={timelineRef}
            >
              <div className="min-w-full relative" style={{ width: Math.max(1000, duration * zoom + 200) + 'px' }}>
                {/* Time Ruler */}
                <div 
                  className="h-6 border-b border-white/5 flex items-end text-[10px] text-zinc-500 pb-1 relative cursor-text sticky top-0 bg-zinc-950 z-30"
                  onMouseDown={handleTimelineMouseDown}
                >
                  {Array.from({ length: Math.ceil(duration) + 10 }).map((_, i) => (
                    <div key={i} className="absolute border-l border-white/10 pl-1 pointer-events-none" style={{ left: `${(i * zoom) + 64}px` }}>
                      {i % 5 === 0 ? `00:${i.toString().padStart(2, '0')}` : ''}
                    </div>
                  ))}
                </div>

                {/* Tracks */}
                {tracks.map(track => (
                  <div 
                    key={track.id} 
                    data-track-id={track.id}
                    className={`track-row h-12 rounded flex items-center px-2 relative border w-full mt-2 transition-colors ${track.isMain ? 'bg-zinc-900/80 border-white/20' : 'bg-zinc-900/40 border-white/5'}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleTrackDrop(e, track.id)}
                  >
                    {/* Track Header */}
                    <div className="w-16 text-xs text-zinc-500 flex items-center gap-2 shrink-0 sticky left-0 bg-zinc-950 z-20">
                      {track.type === 'video' && <Video className="w-3 h-3" />}
                      {track.type === 'audio' && <Music className="w-3 h-3" />}
                      {track.type === 'text' && <Type className="w-3 h-3" />}
                      {track.isMain && <span className="text-[8px] bg-violet-600 text-white px-1 rounded">主轨</span>}
                    </div>
                    
                    {/* Track Items */}
                    <div className="flex-1 relative h-8">
                      {track.items.map(item => {
                        const isDragging = dragInfo?.itemId === item.id;
                        const start = isDragging ? dragInfo.currentStart : item.start;
                        const end = isDragging ? dragInfo.currentEnd : item.end;
                        
                        // If dragging to another track, don't render it in the source track
                        if (isDragging && dragInfo.targetTrackId !== track.id) return null;

                        return (
                          <div 
                            key={item.id} 
                            onMouseDown={(e) => handleItemMouseDown(e, item, track.id, 'move')}
                            className={`absolute top-0 bottom-0 rounded flex items-center overflow-hidden cursor-move transition-colors border ${selectedId === item.id ? 'border-white ring-2 ring-white/20 z-10' : 'border-violet-500'} ${track.type === 'video' || item.type === 'image' ? 'bg-violet-600/40 hover:bg-violet-600/60' : track.type === 'audio' ? 'bg-emerald-600/40 hover:bg-emerald-600/60' : 'bg-blue-600/40 hover:bg-blue-600/60'}`}
                            style={{ 
                              left: `${start * zoom}px`, 
                              width: `${(end - start) * zoom}px`,
                              opacity: isDragging ? 0.7 : 1
                            }}
                          >
                            {/* Left Resize Handle */}
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 z-20"
                              onMouseDown={(e) => handleItemMouseDown(e, item, track.id, 'resize-left')}
                            />
                            
                            {(item.type === 'video' || item.type === 'image') && <img src={item.src} className="h-full object-cover opacity-50 w-full pointer-events-none" alt="" />}
                            {item.type === 'text' && <span className="text-[10px] px-1 truncate pointer-events-none">{item.text}</span>}
                            {item.type === 'audio' && <span className="text-[10px] px-1 truncate pointer-events-none">音频片段</span>}
                            
                            {/* Right Resize Handle */}
                            <div 
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 z-20"
                              onMouseDown={(e) => handleItemMouseDown(e, item, track.id, 'resize-right')}
                            />
                          </div>
                        );
                      })}
                      
                      {/* Render dragged item if this is the target track and it's different from source */}
                      {dragInfo && dragInfo.targetTrackId === track.id && dragInfo.trackId !== track.id && (
                        <div 
                          className={`absolute top-0 bottom-0 rounded flex items-center overflow-hidden border border-white ring-2 ring-white/20 z-10 bg-violet-600/40`}
                          style={{ 
                            left: `${dragInfo.currentStart * zoom}px`, 
                            width: `${(dragInfo.currentEnd - dragInfo.currentStart) * zoom}px`,
                            opacity: 0.7
                          }}
                        >
                          <span className="text-[10px] px-1 truncate pointer-events-none">移动中...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Playhead */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-40 cursor-ew-resize"
                  style={{ left: `${(currentTime * zoom) + 64}px` }}
                  onMouseDown={handleTimelineMouseDown}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full -translate-x-1 -translate-y-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
