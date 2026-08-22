import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { DEMO_PROFILES } from '../services/authService';
import { 
  Cpu, Sparkles, Mail, Lock, User, 
  ArrowRight, Eye, EyeOff 
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const AuthScreen: React.FC = () => {
  const { loginUser, loginGoogle, loginDemoProfile } = useOS();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'demo'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background animated AI canvas particle rings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      rotation += 0.005;

      // Draw faint glowing grid
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw background AI neural circles
      for (let i = 1; i <= 4; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * (i % 2 === 0 ? 1 : -1));

        ctx.beginPath();
        ctx.arc(0, 0, i * 110, 0, Math.PI * 2);
        ctx.strokeStyle = i === 1 ? 'rgba(0, 242, 254, 0.15)' : i === 2 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(52, 211, 153, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 15]);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    soundEffects.playNeuralPulse();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      soundEffects.playSuccess();
      loginUser({
        email,
        password,
        name: activeTab === 'signup' ? name : undefined
      });
    }, 900);
  };

  const handleGoogleAuth = () => {
    soundEffects.playNeuralPulse();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      soundEffects.playSuccess();
      loginGoogle();
    }, 700);
  };

  const handleDemoSelect = (profileId: string) => {
    soundEffects.playSuccess();
    loginDemoProfile(profileId);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Neural Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Auth Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-2 border-cyan-500/30 shadow-2xl space-y-6 relative z-10 bg-slate-900/90 backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Cpu className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              VOCALLABS
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 font-bold">
              OS AI
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Autonomous Business Conversation Operating System
          </p>
        </div>

        {/* Tab Selection: Login | Register | 1-Click Demo Profiles */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs font-mono">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('login');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('signup');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'signup' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('demo');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'demo' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow' 
                : 'text-purple-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 font-mono">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Mode 1 & 2: Form Login / Register */}
        {activeTab !== 'demo' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {activeTab === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase font-bold">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jyothi Sharma"
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase font-bold">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jyothi.sharma@nexus-tech.io"
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase font-bold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-9 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 font-mono"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 font-mono">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'SIGN IN TO VOCALLABS OS' : 'CREATE OS ACCOUNT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Google OAuth Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2 font-mono"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google Account</span>
              </button>
            </div>

          </form>
        ) : (
          /* Mode 3: 1-Click Hackathon Demo Profiles */
          <div className="space-y-3">
            <span className="text-[11px] font-mono text-cyan-300 font-bold block uppercase text-center">
              ⚡ Select Hackathon Demo Profile for Instant Recognition
            </span>

            {DEMO_PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleDemoSelect(profile.id)}
                className="w-full p-3.5 rounded-2xl glass-panel border border-white/10 hover:border-cyan-500/50 bg-slate-950/80 hover:bg-slate-900 transition-all cursor-pointer text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-white/10">
                    {profile.avatar}
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold text-white group-hover:text-cyan-300 font-mono">
                      {profile.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {profile.role} • {profile.company}
                    </p>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">
                      {profile.tier}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer Security Note */}
        <div className="pt-3 border-t border-white/10 text-center text-[10px] font-mono text-slate-500">
          🔒 100% Local Authentication & Privacy Standards
        </div>

      </div>
    </div>
  );
};
