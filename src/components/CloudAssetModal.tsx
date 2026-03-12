import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Folder, Image as ImageIcon, Video, LayoutGrid, HelpCircle } from 'lucide-react';

interface CloudAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const MOCK_ASSETS = [
  { id: '1', type: 'folder', name: '测试', date: '2025.03.06 - 20:06' },
  { id: '2', type: 'image', name: 'Camera003', date: '2026.03.03 - 11:45', url: 'https://picsum.photos/seed/c3/400/200' },
  { id: '3', type: 'image', name: 'Camera008', date: '2026.01.12 - 16:44', url: 'https://picsum.photos/seed/c8/400/200' },
  { id: '4', type: 'image', name: '上传测试.psb', date: '2025.12.25 - 05:44', url: 'https://picsum.photos/seed/psb/400/200' },
  { id: '5', type: 'image', name: '5D774C74-64DE...', date: '2025.12.25 - 03:53', url: 'https://picsum.photos/seed/5d/400/200' },
  { id: '6', type: 'image', name: 'A2B5B0F4-83C3...', date: '2025.12.25 - 03:53', url: 'https://picsum.photos/seed/a2/400/200' },
  { id: '7', type: 'image', name: '未命名 2025.12.25', date: '2025.12.25 - 03:51', url: 'https://picsum.photos/seed/u1/400/200' },
  { id: '8', type: 'image', name: '未命名 2025.12.25', date: '2025.12.25 - 03:51', url: 'https://picsum.photos/seed/u2/400/200' },
];

export default function CloudAssetModal({ isOpen, onClose, onSelect }: CloudAssetModalProps) {
  const [activeTab, setActiveTab] = useState('pano_image');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      const selectedAsset = MOCK_ASSETS.find(a => a.id === selectedIds[0]);
      if (selectedAsset && selectedAsset.url) {
        onSelect(selectedAsset.url);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white text-zinc-800 rounded-xl shadow-2xl w-[900px] max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">作品素材库</h2>
            <div className="flex items-center">
              <input 
                type="text" 
                placeholder="请输入关键字" 
                className="border border-zinc-300 rounded-l-md px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-500 text-white px-4 py-1.5 rounded-r-md text-sm hover:bg-blue-600 transition-colors">
                搜索
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-zinc-200 bg-zinc-50 flex flex-col">
            <div className="p-2 space-y-1">
              <button 
                onClick={() => setActiveTab('pano_image')}
                className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${activeTab === 'pano_image' ? 'bg-blue-500 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                全景图片
                {activeTab === 'pano_image' && <span className="text-blue-200 text-xs">›</span>}
              </button>
              <button 
                onClick={() => setActiveTab('pano_video')}
                className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'pano_video' ? 'bg-blue-500 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                全景视频
              </button>
              <button 
                onClick={() => setActiveTab('hd_matrix')}
                className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'hd_matrix' ? 'bg-blue-500 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                高清矩阵
              </button>
            </div>
            
            <div className="mt-auto p-4 border-t border-zinc-200">
              <div className="flex items-center gap-1 text-sm text-zinc-600 font-medium mb-1">
                空间容量 <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-zinc-800 mb-4">8.21GB / 1GB</div>
              
              <div className="text-xs text-zinc-500 space-y-1 mb-4">
                <p>支持2:1与六面体全景图</p>
                <p>2:1最大支持120MB以内</p>
                <p>六面体每张最大支持60MB以内</p>
              </div>
              
              <a href="#" className="text-xs text-blue-500 hover:underline">2:1与六面体的区别与命名规则</a>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="checkbox" className="rounded border-zinc-300" />
                <span>根目录</span>
              </div>
              <select className="text-sm border-none bg-transparent text-zinc-600 focus:outline-none cursor-pointer">
                <option>排序：最新修改</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-zinc-100">
                {MOCK_ASSETS.map((asset) => (
                  <div 
                    key={asset.id} 
                    className={`flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer ${selectedIds.includes(asset.id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => {
                      if (asset.type === 'folder') return;
                      setSelectedIds(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [asset.id]);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(asset.id)}
                        onChange={() => {}}
                        className="rounded border-zinc-300" 
                      />
                      {asset.type === 'folder' ? (
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-500">
                          <Folder className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-zinc-100 rounded overflow-hidden">
                          <img src={asset.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-sm text-zinc-700">{asset.name}</span>
                    </div>
                    <span className="text-xs text-zinc-400">{asset.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50 relative">
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
            取消操作
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="absolute left-1/2 -translate-x-1/2 bg-zinc-400 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认操作
          </button>
          <div className="text-sm text-zinc-600">
            已勾选：<span className="font-medium">{selectedIds.length}</span> 素材 
            <button onClick={() => setSelectedIds([])} className="text-blue-500 ml-2 hover:underline">清空</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
