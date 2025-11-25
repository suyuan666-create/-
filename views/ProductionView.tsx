
import React, { useState } from 'react';
import { Camera, Sun, Move, Loader2, Image as ImageIcon, Wand2, Film, Lightbulb, Palette, Download, Play } from 'lucide-react';
import { ShotPlan, AgentState } from '../types';
import { generateDetailedShotList, generateStoryboardImage } from '../services/gemini';

interface ProductionViewProps {
  addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  sceneDesc: string;
  setSceneDesc: (s: string) => void;
  shots: ShotPlan[];
  setShots: React.Dispatch<React.SetStateAction<ShotPlan[]>>;
  importedScenes?: string[];
}

const ProductionView: React.FC<ProductionViewProps> = ({ addLog, sceneDesc, setSceneDesc, shots, setShots, importedScenes = [] }) => {
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
      setShots(currentShots => currentShots.map(s => s.id === shot.id ? { ...s, storyboardUrl: imageUrl } : s));
      addLog('System', `镜头 #${shot.id} 故事板绘制完成。`, 'success');
    } catch (e) {
      console.error(e);
      addLog('System', `镜头 #${shot.id} 图像生成失败`, 'error');
    } finally {
      setGeneratingImageId(null);
    }
  };

  const handleGenerateAllStoryboards = async () => {
      const shotsToGen = shots.filter(s => !s.storyboardUrl);
      if (shotsToGen.length === 0) {
          addLog('System', '所有镜头已有故事板，无需生成。', 'warning');
          return;
      }

      addLog('System', `开始批量生成 ${shotsToGen.length} 张故事板...`, 'info');
      setGeneratingImageId(-1); // -1 indicates bulk generation

      // Process sequentially to avoid rate limits
      for (const shot of shotsToGen) {
          await handleGenerateStoryboard(shot);
      }
      setGeneratingImageId(null);
      addLog('System', '批量绘图完成。', 'success');
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Camera className="text-cinematic-accent" />
            虚拟摄影实验室
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI 导演根据您选择的剧本场景，生成详细分镜与灯光指导</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        
        {/* Input Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-cinematic-800/50 rounded-xl p-6 border border-cinematic-700 flex flex-col gap-4">
            
            {/* Imported Scenes Selector */}
            <div className="mb-2">
                <label className="text-xs font-bold text-cinematic-accent uppercase mb-2 block flex items-center justify-between">
                    <span>从剧本导入场景</span>
                    <span className="text-gray-500 font-normal normal-case">{importedScenes.length} 个可用</span>
                </label>
                <div className="relative">
                    <select 
                        onChange={(e) => setSceneDesc(e.target.value)}
                        className="w-full bg-cinematic-900 border border-cinematic-700 text-gray-300 text-sm rounded-lg p-2 focus:border-cinematic-accent focus:outline-none appearance-none"
                        value={sceneDesc}
                    >
                        <option value="">-- 选择一个在剧本模块生成的场景 --</option>
                        {importedScenes.length === 0 && <option disabled>暂无场景，请先在创意工坊生成剧本</option>}
                        {importedScenes.map((scene, i) => (
                            <option key={i} value={scene}>{scene.length > 60 ? scene.substring(0, 60) + '...' : scene}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-2.5 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 font-semibold text-gray-200">
              <Wand2 className="w-4 h-4 text-cinematic-accent" />
              当前拍摄场景描述
            </div>
            <textarea
              className="w-full h-40 bg-cinematic-900 border border-cinematic-700 rounded-lg p-4 text-white focus:outline-none focus:border-cinematic-accent resize-none placeholder-gray-600 text-sm"
              placeholder="例如：赛博朋克风格的雨夜街道，霓虹灯倒映在水坑里，主角神色慌张地奔跑..."
              value={sceneDesc}
              onChange={(e) => setSceneDesc(e.target.value)}
            />

            <button 
              onClick={handleGenerateShots}
              disabled={status === AgentState.GENERATING || !sceneDesc}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                status === AgentState.GENERATING
                  ? 'bg-cinematic-700 cursor-not-allowed text-gray-500'
                  : 'bg-cinematic-accent hover:bg-cinematic-accent_hover text-cinematic-900 shadow-lg'
              }`}
            >
              {status === AgentState.GENERATING ? 'AI 导演正在规划...' : '生成分镜与布光方案'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-cinematic-800 border border-purple-500/20 rounded-xl p-5">
            <h3 className="text-purple-300 font-semibold mb-2 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> 教学提示
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
                在这一步，AI 将模拟**摄影指导 (DP)** 的思维过程。它不仅会告诉你“拍什么”，还会告诉你“怎么布光”以及“为什么要这样运镜”。
            </p>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 bg-cinematic-900 border border-cinematic-700 rounded-xl flex flex-col h-full overflow-hidden">
           <div className="p-4 border-b border-cinematic-700 bg-cinematic-800/30 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-2">
                 <Film className="w-4 h-4 text-gray-400" />
                 <h3 className="font-semibold text-gray-200">分镜列表</h3>
                 <span className="text-xs bg-cinematic-700 px-2 py-0.5 rounded text-gray-300">{shots.length} shots</span>
             </div>
             {shots.length > 0 && (
                <button 
                  onClick={handleGenerateAllStoryboards}
                  disabled={generatingImageId !== null}
                  className="text-xs flex items-center gap-2 px-3 py-1.5 bg-cinematic-800 hover:bg-cinematic-700 border border-cinematic-600 rounded text-cinematic-accent transition-colors"
                >
                  {generatingImageId === -1 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Palette className="w-3 h-3" />}
                  一键生成所有故事板
                </button>
             )}
           </div>

           <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {shots.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <Camera className="w-12 h-12 mb-4 opacity-20" />
                  <p>输入场景描述以开始...</p>
                </div>
              ) : (
                shots.map((shot) => (
                  <div key={shot.id} className="bg-cinematic-800/40 border border-cinematic-700 rounded-xl overflow-hidden flex flex-col md:flex-row">
                    {/* Visual / Storyboard Side */}
                    <div className="md:w-1/3 min-h-[180px] bg-black relative border-r border-cinematic-700/50 group">
                      {shot.storyboardUrl ? (
                        <>
                            <img src={shot.storyboardUrl} alt="Storyboard" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a href={shot.storyboardUrl} download={`shot-${shot.id}.png`} className="p-2 bg-white/10 rounded-full backdrop-blur hover:bg-white/20 text-white">
                                    <Download className="w-5 h-5" />
                                </a>
                            </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                          <span className="text-xs text-gray-600 mb-2 font-mono">STORYBOARD</span>
                          <button 
                            onClick={() => handleGenerateStoryboard(shot)}
                            disabled={generatingImageId !== null}
                            className="px-3 py-1.5 bg-cinematic-800 hover:bg-cinematic-700 border border-cinematic-600 rounded text-xs text-gray-300 flex items-center gap-2 transition-colors"
                          >
                            {generatingImageId === shot.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                            生成图像
                          </button>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-cinematic-900/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white border border-cinematic-700">
                        SHOT {shot.id}
                      </div>
                    </div>

                    {/* Data Side */}
                    <div className="md:w-2/3 p-5 flex flex-col justify-between">
                       <div>
                           <div className="flex flex-wrap gap-2 mb-3">
                               <span className="px-2 py-1 bg-blue-900/20 text-blue-400 border border-blue-900/50 text-xs rounded font-medium">
                                   {shot.shotType}
                               </span>
                               <span className="px-2 py-1 bg-purple-900/20 text-purple-400 border border-purple-900/50 text-xs rounded font-medium flex items-center gap-1">
                                   <Move className="w-3 h-3" /> {shot.movement}
                               </span>
                               <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 border border-yellow-900/50 text-xs rounded font-medium flex items-center gap-1">
                                   <Sun className="w-3 h-3" /> {shot.lighting}
                               </span>
                           </div>
                           <p className="text-gray-200 font-medium mb-3 leading-snug">
                               {shot.description}
                           </p>
                           <div className="bg-cinematic-900/50 p-3 rounded border border-cinematic-800 text-sm text-gray-400 italic">
                               <span className="font-bold text-gray-500 not-italic mr-2">[导演批注]</span>
                               {shot.technicalReasoning}
                           </div>
                       </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionView;
