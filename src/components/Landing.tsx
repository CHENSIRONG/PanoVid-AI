import React from 'react';
import { motion } from 'motion/react';
import { 
  Video, Image as ImageIcon, Wand2, Globe, Play, ArrowRight, Sparkles, Layers, Zap
} from "lucide-react";
import { useAppContext } from '../AppContext';

export default function Landing() {
  const { setView, user } = useAppContext();

  const handleStart = () => {
    if (user) setView('dashboard');
    else setView('auth');
  };

  return (
    <div className="min-h-screen selection:bg-violet-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PanoVid AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">核心功能</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">工作流</a>
            <a href="#use-cases" className="hover:text-white transition-colors">应用场景</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <button onClick={() => setView('dashboard')} className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors">
                进入工作台
              </button>
            ) : (
              <>
                <button onClick={() => setView('auth')} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">登录</button>
                <button onClick={() => setView('auth')} className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors">
                  免费开始
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span>全新接入 Veo, Sora, 可灵等顶尖视频大模型</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              将全景视野，<br className="hidden md:block" />
              转化为<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">震撼的企业大片</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              主打全景图片素材，结合普通图文，借助全球顶尖AI视频大模型，一键生成极具沉浸感的专业级企业宣传片。
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleStart} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-medium text-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                立即创作 <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white font-medium text-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Play className="w-5 h-5" /> 观看演示
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="mt-16 md:mt-24 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-900/20 aspect-video max-w-5xl mx-auto bg-zinc-900">
              <img src="https://picsum.photos/seed/corporate/1920/1080?blur=2" alt="Video Interface Mockup" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 cursor-pointer hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <Globe className="w-5 h-5 text-violet-400" />
                <span className="text-sm font-medium">360° 全景源文件.jpg</span>
              </div>
              <div className="absolute bottom-6 right-6 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-medium">Veo 模型渲染中... 98%</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-12 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-zinc-500 mb-8 uppercase tracking-widest">接入全球顶尖视频生成模型</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-2xl font-bold font-serif">Sora</span>
              <span className="text-2xl font-bold tracking-tighter">Veo</span>
              <span className="text-2xl font-bold">可灵 AI</span>
              <span className="text-2xl font-bold">豆包</span>
              <span className="text-2xl font-bold">Seedance</span>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">重新定义企业视频创作</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">突破传统拍摄限制，用AI的力量释放无限创意。</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Globe className="w-6 h-6 text-violet-400" />, title: "360°全景主导", description: "完美还原空间感，将静态全景图转化为动态的运镜视频，让宣传片更具沉浸力与空间张力。" },
                { icon: <Layers className="w-6 h-6 text-fuchsia-400" />, title: "多模态素材融合", description: "不仅支持全景图，还可无缝混剪普通图片、视频片段与文字脚本，丰富叙事层次。" },
                { icon: <Wand2 className="w-6 h-6 text-emerald-400" />, title: "顶尖大模型矩阵", description: "深度接入 Veo、Sora、可灵、豆包等全球最强视频生成大脑，确保每一帧都达到电影级画质。" },
                { icon: <Zap className="w-6 h-6 text-amber-400" />, title: "极速渲染出片", description: "告别传统实拍与后期数周的工作量，只需几分钟，即可预览并导出高清企业宣传片。" }
              ].map((feature, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10 bg-zinc-950 text-zinc-400 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-zinc-300" />
            <span className="font-semibold text-zinc-300 text-base">PanoVid AI</span>
          </div>
          <div>&copy; {new Date().getFullYear()} PanoVid AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
