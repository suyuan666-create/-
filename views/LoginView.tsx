
import React, { useState } from 'react';
import { Film, ArrowRight, UserCircle, GraduationCap } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      onLogin({ name, role });
    }, 800); // Wait for exit animation
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <div className={`w-full max-w-md bg-cinematic-800/40 backdrop-blur-xl border border-cinematic-700 rounded-2xl p-8 shadow-2xl transition-all duration-700 transform ${isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cinematic-accent to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cinematic-accent/20">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CineEdu AI</h1>
          <p className="text-gray-400 mt-2 text-sm">影视制作教育智能体平台</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">您的姓名</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-cinematic-900/50 border border-cinematic-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cinematic-accent focus:ring-1 focus:ring-cinematic-accent transition-all"
              placeholder="请输入您的名字..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">选择身份</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  role === 'student' 
                    ? 'bg-cinematic-accent/10 border-cinematic-accent text-cinematic-accent' 
                    : 'bg-cinematic-900/30 border-cinematic-700 text-gray-500 hover:bg-cinematic-800'
                }`}
              >
                <UserCircle className="w-6 h-6" />
                <span className="text-sm font-medium">学生</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  role === 'teacher' 
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                    : 'bg-cinematic-900/30 border-cinematic-700 text-gray-500 hover:bg-cinematic-800'
                }`}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm font-medium">教师</span>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-cinematic-accent to-blue-600 hover:from-cinematic-accent_hover hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            进入系统 <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-600">
                Powered by Google Gemini 2.5 & Veo Models
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
