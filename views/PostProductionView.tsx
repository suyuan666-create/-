import React, { useState, useRef } from 'react';
import { Scissors, PlayCircle, Wand2, Upload, AlertCircle, Eye, CheckCircle2 } from 'lucide-react';
import { AgentState, EditingFeedback } from '../types';
import { analyzeVideoFrame } from '../services/gemini';

interface PostProductionViewProps {
  addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  videoUrl: string | null;
  setVideoUrl: (url: string | null) => void;
  feedback: EditingFeedback[];
  setFeedback: (f: EditingFeedback[]) => void;
}

const PostProductionView: React.FC<PostProductionViewProps> = ({ 
  addLog, 
  videoUrl, 
  setVideoUrl, 
  feedback, 
  setFeedback 
}) => {
  const [status, setStatus] = useState<AgentState>(AgentState.IDLE);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFeedback([]); // Clear old feedback
      addLog('System', `视频资产 "${file.name}" 已加载到播放器。`, 'info');
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(videoRef.current, 0, 0);
    // Convert to base64, removing the data URL prefix for Gemini
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return dataUrl.split(',')[1]; 
  };

  const handleAnalyzeFrame = async () => {
    if (!videoUrl) return;

    setStatus(AgentState.ANALYZING);
    const currentTime = videoRef.current ? new Date(videoRef.current.currentTime * 1000).toISOString().substr(11, 8) : "00:00:00";
    addLog('Editor Agent', `正在截取时间码 ${currentTime} 的帧进行 AI 视觉分析...`, 'info');

    try {
      const base64Image = captureFrame();
      if (!base64Image) throw new Error("无法截取视频帧");

      const result = await analyzeVideoFrame(base64Image);
      
      // Update timecodes to reflect current player time
      const timedResult = result.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        timecode: currentTime
      }));

      setFeedback([...timedResult, ...feedback]);
      addLog('Editor Agent', '视觉诊断完成。发现 ' + result.length + ' 个优化点。', 'success');
    } catch (e) {
      console.error(e);
      addLog('System', '视觉分析失败', 'error');
    } finally {
      setStatus(AgentState.IDLE);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Scissors className="text-cinematic-accent" />
            后期制作套件
          </h1>
          <p className="text-gray-400 text-sm mt-1">上传本地视频，AI 逐帧分析构图、色彩与光影</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="video/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-cinematic-800 hover:bg-cinematic-700 border border-cinematic-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          {videoUrl ? '更换视频' : '上传视频'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        
        {/* Video Player Area */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            <div className="flex-1 bg-black rounded-xl border border-cinematic-700 relative group overflow-hidden flex items-center justify-center">
                {!videoUrl ? (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-3 text-gray-500 hover:text-cinematic-accent transition-colors"
                    >
                        <PlayCircle className="w-16 h-16 opacity-50" />
                        <span className="font-medium">点击上传视频进行审阅</span>
                    </button>
                ) : (
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                    />
                )}
            </div>

            {/* Analysis Controls */}
            <div className="bg-cinematic-800/50 rounded-xl border border-cinematic-700 p-4 flex justify-between items-center">
                 <div className="text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      将播放头移动到需要分析的画面，然后点击分析。
                    </span>
                 </div>
                 <button
                    onClick={handleAnalyzeFrame}
                    disabled={status === AgentState.ANALYZING || !videoUrl}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${
                      status === AgentState.ANALYZING || !videoUrl
                        ? 'bg-cinematic-700 cursor-not-allowed text-gray-500'
                        : 'bg-cinematic-accent hover:bg-cinematic-accent_hover text-cinematic-900 shadow-lg'
                    }`}
                  >
                    {status === AgentState.ANALYZING ? (
                        <>
                          <Wand2 className="w-4 h-4 animate-spin" /> 分析中...
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4" /> 分析当前帧
                        </>
                    )}
                  </button>
            </div>
        </div>

        {/* Feedback Sidebar */}
        <div className="bg-cinematic-900 border border-cinematic-700 rounded-xl flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-cinematic-700 bg-cinematic-800/30 flex justify-between items-center">
            <h3 className="font-semibold text-gray-200">AI 视觉诊断报告</h3>
            <span className="text-xs bg-cinematic-800 px-2 py-1 rounded text-gray-400">{feedback.length} 条建议</span>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {feedback.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-sm px-4">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>暂无诊断记录。</p>
                    <p className="mt-1 opacity-70">请上传视频并对关键帧进行 AI 分析。</p>
                </div>
            ) : (
                feedback.map((item, index) => (
                    <div key={index} className="bg-cinematic-800/40 border border-cinematic-700 p-3 rounded-lg animate-in slide-in-from-right-2 fade-in">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                item.category === 'Audio' ? 'bg-purple-900/20 text-purple-400 border-purple-900/50' :
                                item.category === 'Color' ? 'bg-pink-900/20 text-pink-400 border-pink-900/50' :
                                item.category === 'Composition' ? 'bg-teal-900/20 text-teal-400 border-teal-900/50' :
                                'bg-blue-900/20 text-blue-400 border-blue-900/50'
                            }`}>
                                {item.category}
                            </span>
                            <span className="text-xs font-mono text-gray-500 bg-black/30 px-1 rounded">
                              {item.timecode}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-snug">
                            {item.suggestion}
                        </p>
                        <div className={`mt-2 h-0.5 w-full rounded-full ${
                          item.severity === 'high' ? 'bg-red-500/50' : item.severity === 'medium' ? 'bg-yellow-500/50' : 'bg-green-500/50'
                        }`} />
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProductionView;