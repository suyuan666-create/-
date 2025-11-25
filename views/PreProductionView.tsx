
import React, { useState } from 'react';
import { PenTool, MessageSquare, Loader2, Sparkles, BookOpen, User, Clapperboard, ArrowRight, Pencil, Save } from 'lucide-react';
import { ScriptProject, AgentState } from '../types';
import { generateScriptAnalysis } from '../services/gemini';

interface PreProductionViewProps {
  addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  project: ScriptProject;
  setProject: (p: ScriptProject) => void;
  onNavigateToProduction?: () => void;
}

const PreProductionView: React.FC<PreProductionViewProps> = ({ addLog, project, setProject, onNavigateToProduction }) => {
  const [ideaInput, setIdeaInput] = useState('');
  const [genreInput, setGenreInput] = useState('Sci-Fi');
  const [status, setStatus] = useState<AgentState>(AgentState.IDLE);

  const handleAnalyze = async () => {
    if (!ideaInput) return;
    
    setStatus(AgentState.GENERATING);
    addLog('Teacher Agent', '正在调用 Gemini 2.5 分析创意并生成剧本大纲与场次...', 'info');
    
    try {
      const result = await generateScriptAnalysis(ideaInput, genreInput);
      setProject(result);
      addLog('Assistant Agent', `剧本生成完毕，已自动拆解出 ${result.scenes?.length || 0} 个关键场次。`, 'success');
    } catch (e) {
      console.error(e);
      addLog('System', 'AI 生成失败，请检查网络或 API Key 设置', 'error');
    } finally {
      setStatus(AgentState.IDLE);
    }
  };

  const handleUpdateScene = (index: number, value: string) => {
    const newScenes = [...project.scenes];
    newScenes[index] = value;
    setProject({ ...project, scenes: newScenes });
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-cinematic-accent" />
            创意工坊 (AIGC)
          </h1>
          <p className="text-gray-400 text-sm mt-1">输入简单的想法，AI 自动生成专业剧本结构。生成后可直接点击文本进行修改。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
        {/* Input Section */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
          <div className="bg-cinematic-800/50 rounded-xl p-6 border border-cinematic-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">你的创意想法</label>
            <textarea 
              className="w-full h-32 bg-cinematic-900 border border-cinematic-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cinematic-accent resize-none mb-4 placeholder-gray-600"
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
              <option value="Action">动作 (Action)</option>
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

          <div className="bg-cinematic-800/30 p-4 rounded-xl border border-cinematic-700">
              <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">工作流提示</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                  1. 在此处生成的“关键场次”将自动同步到【分镜与虚拟拍摄】模块。<br/>
                  2. 你可以随时点击右侧生成的内容进行编辑，修改后的内容会即时保存。
              </p>
          </div>
        </div>

        {/* Output Section (Editable) */}
        <div className="bg-cinematic-900 border border-cinematic-700 rounded-xl flex flex-col h-full overflow-hidden relative">
          <div className="p-4 border-b border-cinematic-700 bg-cinematic-800/30 flex justify-between items-center">
            <h3 className="font-semibold text-gray-200">剧本大纲 (可编辑)</h3>
            {project.title && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> 点击文字即可修改
                    </span>
                    <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">已生成</span>
                </div>
            )}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {!project.title ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p>等待创意输入...</p>
              </div>
            ) : (
              <>
                <div className="bg-cinematic-800/40 p-5 rounded-lg border border-cinematic-700 group hover:border-cinematic-500 transition-colors">
                  <input
                    className="w-full bg-transparent text-2xl font-bold text-cinematic-accent mb-2 border-b border-transparent focus:border-cinematic-accent focus:outline-none placeholder-cinematic-accent/50"
                    value={project.title}
                    onChange={(e) => setProject({...project, title: e.target.value})}
                    placeholder="电影标题..."
                  />
                  <div className="text-sm text-gray-400 font-mono mb-4 uppercase tracking-wider">{project.genre}</div>
                  <div className="pl-4 border-l-2 border-gray-600">
                    <h4 className="text-sm font-bold text-gray-300 mb-1">LOGLINE (故事梗概)</h4>
                    <textarea
                      className="w-full bg-transparent text-gray-200 italic leading-relaxed border-none focus:ring-0 resize-none min-h-[80px] focus:bg-black/20 rounded"
                      value={project.logline}
                      onChange={(e) => setProject({...project, logline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-cinematic-800/40 p-5 rounded-lg border border-cinematic-700 group hover:border-cinematic-500 transition-colors">
                   <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                     <BookOpen className="w-4 h-4" /> 结构分析
                   </h4>
                   <textarea
                     className="w-full bg-transparent text-gray-300 text-sm whitespace-pre-line leading-relaxed border-none focus:ring-0 resize-none min-h-[150px] focus:bg-black/20 rounded"
                     value={project.structureAnalysis}
                     onChange={(e) => setProject({...project, structureAnalysis: e.target.value})}
                   />
                </div>

                <div className="bg-cinematic-800/40 p-5 rounded-lg border border-cinematic-700 group hover:border-cinematic-500 transition-colors">
                   <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                     <User className="w-4 h-4" /> 角色深度
                   </h4>
                   <textarea
                     className="w-full bg-transparent text-gray-300 text-sm whitespace-pre-line leading-relaxed border-none focus:ring-0 resize-none min-h-[100px] focus:bg-black/20 rounded"
                     value={project.characterNotes}
                     onChange={(e) => setProject({...project, characterNotes: e.target.value})}
                   />
                </div>

                {project.scenes && project.scenes.length > 0 && (
                   <div className="bg-cinematic-800/40 p-5 rounded-lg border border-cinematic-700 ring-1 ring-yellow-500/30">
                      <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <Clapperboard className="w-4 h-4" /> 推荐拍摄场次 (Key Scenes)
                      </h4>
                      <div className="space-y-3 mb-4">
                        {project.scenes.map((scene, idx) => (
                          <div key={idx} className="flex items-start gap-2 group">
                             <span className="text-gray-600 font-mono text-xs pt-2 mt-0.5">S{idx+1}</span>
                             <textarea
                                className="w-full bg-cinematic-900/50 border border-cinematic-800 text-sm text-gray-300 p-2 rounded focus:outline-none focus:border-cinematic-accent resize-none"
                                value={scene}
                                onChange={(e) => handleUpdateScene(idx, e.target.value)}
                                rows={2}
                             />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500">* 此处的修改将同步至拍摄模块</span>
                        {onNavigateToProduction && (
                            <button 
                                onClick={onNavigateToProduction}
                                className="text-xs flex items-center gap-1 text-cinematic-accent hover:text-white transition-colors font-bold"
                            >
                                去拍摄这些场景 <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                      </div>
                   </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreProductionView;
