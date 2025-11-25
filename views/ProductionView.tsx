import React, { useState } from 'react';
import { Camera, Sun, Move, Loader2, Image as ImageIcon, Wand2, Film, Lightbulb, Palette } from 'lucide-react';
import { ShotPlan, AgentState } from '../types';
import { generateDetailedShotList, generateStoryboardImage } from '../services/gemini';

interface ProductionViewProps {
  addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  sceneDesc: string;
  setSceneDesc: (s: string) => void;
  shots: ShotPlan[];
  setShots: (s: ShotPlan[]) => void;
}

const ProductionView: React.FC<ProductionViewProps> = ({ addLog, sceneDesc, setSceneDesc, shots, setShots }) => {
  const [status, setStatus] = useState<AgentState>(AgentState.IDLE);
  const [generatingImageId, setGeneratingImageId] = useState<number | null>(null);

  const handleGenerateShots = async () => {
    if (!sceneDesc) return;
    setStatus(AgentState.GENERATING);
    addLog('Director Agent', '正在构思分镜并计算布光方案...', 'info');
    
    try {
      const result = await generateDetailedShotList(sceneDesc);
      setShots(result);
      addLog('Cinematography Agent', `生成了 ${result.length} 个镜头方案。`, 'success');
    } catch (e) {
      console.error(e);
      addLog('System', '分镜生成失败', 'error');
    } finally {
      setStatus(AgentState.IDLE);
    }
  };

  const handleGenerateStoryboard = async (shot: ShotPlan) => {
    setGeneratingImageId(shot.id);
    addLog('System', `正在为镜头 #${shot.id} 绘制故事板...`, 'info');
    
    try {
      const imageUrl = await generateStoryboardImage(shot.visualPrompt);
      const updatedShots = shots.map(s => s.id === shot.id ? { ...s, storyboardUrl: imageUrl } : s);
      setShots(updatedShots);
      addLog('System', `镜头 #${shot.id} 故事板绘制完成。`, 'success');
    } catch (e) {
      console.error(e);
      addLog('System', '图像生成失败', 'error');
    } finally {
      setGeneratingImageId(null);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Camera className="text-cinematic-accent" />
            虚拟摄影实验室
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI 导演生成详细分镜与灯光指导</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        
        {/* Input Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-cinematic-800/50 rounded-xl p-6 border border-cinematic-700 flex flex-col gap-4">
            <div className="flex items-center gap-2 font-semibold text-gray-200">
              <Wand2 className="w-4 h-4 text-cinematic-accent" />
              场景描述
            </div>
            <textarea
              className="w-full h-40 bg-cinematic-900 border border-cinematic-700 rounded-lg p-4 text-white focus:outline-none focus:border-cinematic-accent resize-none placeholder-gray-600"
              placeholder="例如：赛博朋克风格的雨夜街道，侦探慢慢走向一个发光的霓虹灯牌..."
              value={sceneDesc}
              onChange={(e) => setSceneDesc(e.target.value)}
            />
            <button
              onClick={handleGenerateShots}
              disabled={status === AgentState.GENERATING || !sceneDesc}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${
                status === AgentState.GENERATING
                  ? 'bg-cinematic-700 cursor-not-allowed text-gray-400'
                  : 'bg-cinematic-accent hover:bg-cinematic-accent_hover text-cinematic-900 shadow-lg'
              }`}
            >
              {status === AgentState.GENERATING ? (
                <>
                  <Loader2 className="animate-spin" /> 正在规划分镜...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" /> 生成拍摄计划
                </>
              )}
            </button>
          </div>

          <div className="bg-cinematic-800/30 rounded-xl p-6 border border-cinematic-700 flex-1">
            <h4 className="text-gray-400 text-sm font-semibold mb-3">AI 指导原则</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex gap-2">
                <span className="text-cinematic-accent">•</span>
                AI 会根据场景情感自动推荐布光（如伦勃朗光、蝴蝶光）。
              </li>
              <li className="flex gap-2">
                <span className="text-cinematic-accent">•</span>
                每个镜头都包含摄影指导的“技术理由”，解释为什么要这样拍。
              </li>
              <li className="flex gap-2">
                <span className="text-cinematic-accent">•</span>
                点击“绘制故事板”可实时生成分镜草图。
              </li>
            </ul>
          </div>
        </div>

        {/* Shot List Output */}
        <div className="lg:col-span-2 overflow-y-auto pr-2 space-y-6">
          {shots.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-cinematic-800 rounded-xl">
              <Film className="w-16 h-16 mb-4 opacity-20" />
              <p>输入场景描述以开始...</p>
            </div>
          ) : (
            shots.map((shot) => (
              <div key={shot.id} className="bg-cinematic-900 border border-cinematic-700 rounded-xl overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 fade-in">
                {/* Shot Header */}
                <div className="bg-cinematic-800/50 p-4 border-b border-cinematic-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-cinematic-700 text-white px-2 py-1 rounded text-sm font-mono">
                      SHOT #{shot.id}
                    </span>
                    <h3 className="text-lg font-bold text-white">{shot.shotType}</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 border border-blue-900/50 flex items-center gap-1">
                      <Move className="w-3 h-3" /> {shot.movement}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-900/50 flex items-center gap-1">
                      <Sun className="w-3 h-3" /> {shot.lighting}
                    </span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Text Details */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">画面描述</h4>
                      <p className="text-gray-200 leading-relaxed">{shot.description}</p>
                    </div>
                    
                    <div className="bg-cinematic-800/30 p-3 rounded-lg border border-cinematic-800">
                      <h4 className="text-cinematic-accent text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> 导演/DP 笔记
                      </h4>
                      <p className="text-gray-400 text-sm italic">"{shot.technicalReasoning}"</p>
                    </div>

                    <div>
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">AI 绘图提示词 (Prompt)</h4>
                      <p className="text-gray-600 text-xs font-mono truncate">{shot.visualPrompt}</p>
                    </div>
                  </div>

                  {/* Storyboard Image Area */}
                  <div className="flex flex-col gap-3">
                    <div className="aspect-video bg-black rounded-lg border border-cinematic-800 flex items-center justify-center overflow-hidden relative group">
                      {shot.storyboardUrl ? (
                        <>
                          <img src={shot.storyboardUrl} alt={`Shot ${shot.id}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button 
                               onClick={() => handleGenerateStoryboard(shot)}
                               className="px-3 py-1 bg-white text-black text-xs font-bold rounded shadow hover:bg-gray-200"
                             >
                               重新生成
                             </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-cinematic-700 mx-auto mb-2" />
                          <p className="text-xs text-gray-600">无图像数据</p>
                        </div>
                      )}
                    </div>
                    
                    {!shot.storyboardUrl && (
                      <button
                        onClick={() => handleGenerateStoryboard(shot)}
                        disabled={generatingImageId === shot.id}
                        className="w-full py-2 bg-cinematic-800 hover:bg-cinematic-700 border border-cinematic-700 rounded-lg text-xs font-bold text-gray-300 flex items-center justify-center gap-2 transition-colors"
                      >
                        {generatingImageId === shot.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Palette className="w-3 h-3" />
                        )}
                        绘制故事板
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionView;