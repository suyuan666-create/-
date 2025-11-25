import React, { useState } from 'react';
import { PenTool, MessageSquare, Loader2, Sparkles, BookOpen, User } from 'lucide-react';
import { ScriptProject, AgentState } from '../types';
import { generateScriptAnalysis } from '../services/gemini';

interface PreProductionViewProps {
  addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  project: ScriptProject;
  setProject: (p: ScriptProject) => void;
}

const PreProductionView: React.FC<PreProductionViewProps> = ({ addLog, project, setProject }) => {
  const [ideaInput, setIdeaInput] = useState('');
  const [genreInput, setGenreInput] = useState('Sci-Fi');
  const [status, setStatus] = useState<AgentState>(AgentState.IDLE);

  const handleAnalyze = async () => {
    if (!ideaInput) return;
    
    setStatus(AgentState.GENERATING);
    addLog('Teacher Agent', '正在调用 Gemini 2.5 分析创意并生成剧本大纲...', 'info');
    
    try {
      const result = await generateScriptAnalysis(ideaInput, genreInput);
      setProject(result);
      addLog('Assistant Agent', '剧本结构生成完毕。', 'success');
    } catch (e) {
      console.error(e);
      addLog('System', 'AI 生成失败，请检查网络或 Key', 'error');
    } finally {
      setStatus(AgentState.IDLE);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-cinematic-accent" />
            创意工坊 (AIGC)
          </h1>
          <p className="text-gray-400 text-sm mt-1">输入简单的想法，AI 自动生成专业剧本结构</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
        {/* Input Section */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
          <div className="bg-cinematic-800/50 rounded-xl p-6 border border-cinematic-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">你的创意想法</label>
            <textarea 
              className="w-full h-32 bg-cinematic-900 border border-cinematic-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cinematic-accent resize-none mb-4"
              placeholder="例如：一个在火星上发现古代遗迹的宇航员，发现遗迹里竟然有他童年的照片..."
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
            />

            <label className="block text-sm font-medium text-gray-300 mb-2">目标类型</label>
            <select 
              className="w-full bg-cinematic-900 border border-cinematic-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cinematic-accent mb-4"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
            >
              <option value="Sci-Fi">科幻 (Sci-Fi)</option>
              <option value="Horror">恐怖 (Horror)</option>
              <option value="Drama">剧情 (Drama)</option>
              <option value="Thriller">惊悚 (Thriller)</option>
              <option value="Comedy">喜剧 (Comedy)</option>
            </select>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={status === AgentState.GENERATING || !ideaInput}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
              status === AgentState.GENERATING 
                ? 'bg-cinematic-700 cursor-not-allowed text-gray-400'
                : 'bg-cinematic-accent hover:bg-cinematic-accent_hover text-cinematic-900 shadow-lg shadow-cinematic-accent/20'
            }`}
          >
            {status === AgentState.GENERATING ? (
              <>
                <Loader2 className="animate-spin" /> AI 正在构思...
              </>
            ) : (
              <>
                <Sparkles /> 生成剧本大纲
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-cinematic-900 border border-cinematic-700 rounded-xl flex flex-col h-full overflow-hidden relative">
          <div className="p-4 border-b border-cinematic-700 bg-cinematic-800/30 flex justify-between items-center">
            <h3 className="font-semibold text-gray-200">AI 生成结果</h3>
            {project.title && <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">已生成</span>}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {!project.title ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p>等待创意输入...</p>
              </div>
            ) : (
              <>
                <div className="bg-cinematic-800/40 p-5 rounded-lg border border-cinematic-700">
                  <h2 className="text-2xl font-bold text-cinematic-accent mb-2">{project.title}</h2>
                  <div className="text-sm text-gray-400 font-mono mb-4 uppercase tracking-wider">{project.genre}</div>
                  <div className="pl-4 border-l-2 border-gray-600">
                    <h4 className="text-sm font-bold text-gray-300 mb-1">LOGLINE (故事梗概)</h4>
                    <p className="text-gray-200 italic leading-relaxed">{project.logline}</p>
                  </div>
                </div>

                <div className="bg-cinematic-800/40 p-5 rounded-lg border border-cinematic-700">
                   <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                     <BookOpen className="w-4 h-4" /> 结构分析
                   </h4>
                   <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                     {project.structureAnalysis}
                   </p>
                </div>

                <div className="bg-cinematic-800/40 p-5 rounded-lg border border-cinematic-700">
                   <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                     <User className="w-4 h-4" /> 角色深度
                   </h4>
                   <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                     {project.characterNotes}
                   </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreProductionView;