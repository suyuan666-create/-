
import React, { useState, useRef, useEffect } from 'react';
import { Scissors, PlayCircle, Wand2, Upload, Eye, CheckCircle2, Sliders, Download, Play, Pause } from 'lucide-react';
import { AgentState, EditingFeedback, VideoAdjustments } from '../types';
import { analyzeVideoFrame } from '../services/gemini';

interface PostProductionViewProps {
  addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  videoUrl: string | null;
  setVideoUrl: (url: string | null) => void;
  feedback: EditingFeedback[];
  setFeedback: (f: EditingFeedback[]) => void;
}

const DEFAULT_ADJUSTMENTS: VideoAdjustments = {
  contrast: 1.0,
  brightness: 1.0,
  saturation: 1.0,
  warmth: 0
};

const PostProductionView: React.FC<PostProductionViewProps> = ({ 
  addLog, 
  videoUrl, 
  setVideoUrl, 
  feedback, 
  setFeedback
}) => {
  const [status, setStatus] = useState<AgentState>(AgentState.IDLE);
  const [adjustments, setAdjustments] = useState<VideoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs for video processing
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // === Video Processing Loop ===
  const processFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && !video.paused && !video.ended) {
        // Match canvas size to video size
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

        // Apply filters
        // Note: 'sepia' is used to simulate warmth/retro look for this demo
        const filterString = `contrast(${adjustments.contrast * 100}%) brightness(${adjustments.brightness * 100}%) saturate(${adjustments.saturation * 100}%) sepia(${adjustments.warmth * 50}%)`;
        ctx.filter = filterString;

        // Draw the frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } else {
      // Draw one frame even if paused so filters update
      processFrame();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, adjustments]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFeedback([]);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      addLog('System', `视频资产 "${file.name}" 已加载到智能调色台。`, 'info');
      // Reset play state
      setIsPlaying(false);
    }
  };

  const captureFrame = (): string | null => {
    if (!canvasRef.current) return null;
    // We capture from canvas so it includes the current filters!
    return canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const handleAnalyzeFrame = async () => {
    if (!videoUrl) return;

    setStatus(AgentState.ANALYZING);
    const currentTime = videoRef.current ? new Date(videoRef.current.currentTime * 1000).toISOString().substr(11, 8) : "00:00:00";
    
    addLog('Editor Agent', `正在截取时间码 ${currentTime} 的帧进行视觉分析...`, 'info');

    try {
      const base64Image = captureFrame();
      if (!base64Image) throw new Error("无法截取视频帧");

      const result = await analyzeVideoFrame(base64Image);
      
      const timedResult = result.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        timecode: currentTime
      }));

      const newFeedbackList = [...timedResult, ...feedback];
      setFeedback(newFeedbackList);
      
      addLog('Editor Agent', '视觉诊断完成。AI 已提供调色预设。', 'success');
    } catch (e) {
      console.error(e);
      addLog('System', '视觉分析失败', 'error');
    } finally {
      setStatus(AgentState.IDLE);
    }
  };

  const applyAIFix = (aiAdj: VideoAdjustments) => {
      setAdjustments(aiAdj);
      addLog('System', '已应用 AI 推荐的调色参数。', 'success');
  };

  const startExport = () => {
      if (!canvasRef.current || !videoRef.current) return;
      
      addLog('System', '开始渲染并录制处理后的视频...', 'info');
      setStatus(AgentState.PROCESSING);
      
      const stream = canvasRef.current.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
          }
      };

      mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'cine-edu-enhanced-export.webm';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          addLog('System', '视频导出成功！已开始下载。', 'success');
          setStatus(AgentState.IDLE);
          setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Play video to capture frames
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
  };

  const stopExport = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          if (videoRef.current) videoRef.current.pause();
          setIsPlaying(false);
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
          <p className="text-gray-400 text-sm mt-1">上传本地视频，AI 辅助调色与增强</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="video/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        <div className="flex gap-2">
            <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-cinematic-800 hover:bg-cinematic-700 border border-cinematic-700 rounded-lg text-sm font-medium transition-colors"
            >
            <Upload className="w-4 h-4" />
            {videoUrl ? '更换素材' : '导入素材'}
            </button>
            
            {videoUrl && (
                isRecording ? (
                    <button 
                        onClick={stopExport}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white border border-red-500 rounded-lg text-sm font-medium animate-pulse"
                    >
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        停止录制
                    </button>
                ) : (
                    <button 
                        onClick={startExport}
                        className="flex items-center gap-2 px-4 py-2 bg-cinematic-accent hover:bg-cinematic-accent_hover text-cinematic-900 border border-cinematic-600 rounded-lg text-sm font-bold transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        导出成品
                    </button>
                )
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        
        {/* Main Editor Area */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full overflow-y-auto">
            
            {/* Player Container */}
            <div className="bg-black rounded-xl border border-cinematic-700 relative group overflow-hidden flex items-center justify-center aspect-video">
                {!videoUrl ? (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-3 text-gray-500 hover:text-cinematic-accent transition-colors"
                    >
                        <PlayCircle className="w-16 h-16 opacity-50" />
                        <span className="font-medium">点击导入视频素材</span>
                    </button>
                ) : (
                    <>
                        {/* Hidden Video Source */}
                        <video 
                            ref={videoRef}
                            src={videoUrl} 
                            className="hidden"
                            crossOrigin="anonymous"
                            onEnded={() => { setIsPlaying(false); if(isRecording) stopExport(); }}
                        />
                        {/* Render Canvas */}
                        <canvas 
                            ref={canvasRef}
                            className="w-full h-full object-contain"
                        />
                        
                        {/* Overlay Controls */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={togglePlay} className="text-white hover:text-cinematic-accent">
                                {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
                            </button>
                            <span className="text-xs text-gray-300 font-mono">
                                实时渲染预览 (Real-time Canvas Render)
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Adjustment Controls */}
            {videoUrl && (
                <div className="bg-cinematic-800/50 rounded-xl border border-cinematic-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-200 flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-cinematic-accent" />
                            调色参数 (Color Grading)
                        </h3>
                        <button 
                             onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                             className="text-xs text-gray-500 hover:text-white"
                        >
                            重置参数
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>对比度 (Contrast)</span>
                                    <span>{Math.round(adjustments.contrast * 100)}%</span>
                                </label>
                                <input 
                                    type="range" min="0.5" max="1.5" step="0.05"
                                    value={adjustments.contrast}
                                    onChange={(e) => setAdjustments({...adjustments, contrast: parseFloat(e.target.value)})}
                                    className="w-full accent-cinematic-accent"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>亮度 (Brightness)</span>
                                    <span>{Math.round(adjustments.brightness * 100)}%</span>
                                </label>
                                <input 
                                    type="range" min="0.5" max="1.5" step="0.05"
                                    value={adjustments.brightness}
                                    onChange={(e) => setAdjustments({...adjustments, brightness: parseFloat(e.target.value)})}
                                    className="w-full accent-cinematic-accent"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>饱和度 (Saturation)</span>
                                    <span>{Math.round(adjustments.saturation * 100)}%</span>
                                </label>
                                <input 
                                    type="range" min="0" max="2" step="0.1"
                                    value={adjustments.saturation}
                                    onChange={(e) => setAdjustments({...adjustments, saturation: parseFloat(e.target.value)})}
                                    className="w-full accent-cinematic-accent"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>暖色调/复古 (Warmth)</span>
                                    <span>{Math.round(adjustments.warmth * 100)}%</span>
                                </label>
                                <input 
                                    type="range" min="0" max="1" step="0.05"
                                    value={adjustments.warmth}
                                    onChange={(e) => setAdjustments({...adjustments, warmth: parseFloat(e.target.value)})}
                                    className="w-full accent-yellow-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* AI Sidebar */}
        <div className="bg-cinematic-900 border border-cinematic-700 rounded-xl flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-cinematic-700 bg-cinematic-800/30 flex justify-between items-center">
            <h3 className="font-semibold text-gray-200">AI 视觉诊断</h3>
            
            <button
                onClick={handleAnalyzeFrame}
                disabled={status === AgentState.ANALYZING || !videoUrl}
                className={`px-3 py-1.5 rounded text-xs flex items-center gap-2 font-bold transition-all ${
                    status === AgentState.ANALYZING || !videoUrl
                    ? 'bg-cinematic-800 text-gray-500 cursor-not-allowed'
                    : 'bg-cinematic-accent hover:bg-cinematic-accent_hover text-cinematic-900'
                }`}
            >
                {status === AgentState.ANALYZING ? (
                    <Wand2 className="w-3 h-3 animate-spin" />
                ) : (
                    <>
                        <Eye className="w-3 h-3" /> 分析当前帧
                    </>
                )}
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {feedback.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-sm px-4">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>等待分析...</p>
                    <p className="mt-1 opacity-70 text-xs">暂停视频，点击右上角“分析当前帧”。</p>
                </div>
            ) : (
                feedback.map((item, index) => (
                    <div key={index} className="bg-cinematic-800/40 border border-cinematic-700 p-3 rounded-lg animate-in slide-in-from-right-2 fade-in">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                item.category === 'Color' ? 'bg-pink-900/20 text-pink-400 border-pink-900/50' :
                                'bg-blue-900/20 text-blue-400 border-blue-900/50'
                            }`}>
                                {item.category}
                            </span>
                            <span className="text-xs font-mono text-gray-500 bg-black/30 px-1 rounded">
                              {item.timecode}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-snug mb-3">
                            {item.suggestion}
                        </p>
                        
                        {item.recommendedAdjustments && (
                            <button 
                                onClick={() => item.recommendedAdjustments && applyAIFix(item.recommendedAdjustments)}
                                className="w-full py-1.5 bg-gradient-to-r from-purple-900 to-cinematic-900 border border-purple-500/30 rounded text-xs text-purple-200 hover:text-white hover:border-purple-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Wand2 className="w-3 h-3" />
                                应用此 AI 调色方案
                            </button>
                        )}
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
