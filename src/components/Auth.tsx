import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Smartphone, Mail, QrCode, Cloud, ArrowRight } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function Auth() {
  const { setView, setUser } = useAppContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'wechat' | '720yun'>('password');
  const [regMethod, setRegMethod] = useState<'phone' | 'email'>('phone');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login/register success
    setUser({
      id: 'user_123',
      name: '体验用户',
      avatar: 'https://picsum.photos/seed/avatar/100/100',
      credits: 100,
      isVip: false
    });
    setView('dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={() => setView('landing')}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{mode === 'login' ? '欢迎回来' : '创建账号'}</h2>
            <p className="text-zinc-400 text-sm">
              {mode === 'login' ? '登录以继续您的视频创作之旅' : '注册即送 50 积分，开启 AI 创作'}
            </p>
          </div>

          <div className="flex p-1 bg-zinc-950 rounded-lg mb-8">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'login' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setMode('login')}
            >
              登录
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'register' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setMode('register')}
            >
              注册
            </button>
          </div>

          {mode === 'login' && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-6">
                <button onClick={() => setLoginMethod('password')} className={`p-3 rounded-xl border transition-colors ${loginMethod === 'password' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-white/10 hover:bg-white/5 text-zinc-400'}`} title="账号密码">
                  <Smartphone className="w-5 h-5" />
                </button>
                <button onClick={() => setLoginMethod('wechat')} className={`p-3 rounded-xl border transition-colors ${loginMethod === 'wechat' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 hover:bg-white/5 text-zinc-400'}`} title="微信扫码">
                  <QrCode className="w-5 h-5" />
                </button>
                <button onClick={() => setLoginMethod('720yun')} className={`p-3 rounded-xl border transition-colors ${loginMethod === '720yun' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 hover:bg-white/5 text-zinc-400'}`} title="720云授权">
                  <Cloud className="w-5 h-5" />
                </button>
              </div>

              {loginMethod === 'password' && (
                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <input type="text" placeholder="手机号 / 邮箱" className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors" required />
                  </div>
                  <div>
                    <input type="password" placeholder="密码" className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors" required />
                  </div>
                  <button type="submit" className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-zinc-200 transition-colors">
                    登录
                  </button>
                </form>
              )}

              {loginMethod === 'wechat' && (
                <div className="text-center py-4">
                  <div className="w-40 h-40 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-black" />
                  </div>
                  <p className="text-sm text-zinc-400">请使用微信扫码登录</p>
                </div>
              )}

              {loginMethod === '720yun' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl mx-auto flex items-center justify-center">
                    <Cloud className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-zinc-400">打通 720云 账号体系，直接导入您的全景素材</p>
                  <button onClick={handleAuth} className="w-full bg-[#00a1d6] text-white font-medium py-3 rounded-lg hover:bg-[#0090c0] transition-colors flex items-center justify-center gap-2">
                    授权并登录 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-6">
              <div className="flex gap-2 mb-6">
                <button onClick={() => setRegMethod('phone')} className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${regMethod === 'phone' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                  手机号注册
                </button>
                <button onClick={() => setRegMethod('email')} className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${regMethod === 'email' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                  邮箱注册
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <input type={regMethod === 'phone' ? 'tel' : 'email'} placeholder={regMethod === 'phone' ? '请输入手机号' : '请输入邮箱'} className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors" required />
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="验证码" className="flex-1 bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors" required />
                  <button type="button" className="px-4 bg-zinc-800 hover:bg-zinc-700 text-sm rounded-lg transition-colors whitespace-nowrap">
                    获取验证码
                  </button>
                </div>
                <div>
                  <input type="password" placeholder="设置密码" className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors" required />
                </div>
                <button type="submit" className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-zinc-200 transition-colors mt-2">
                  注册并登录
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
