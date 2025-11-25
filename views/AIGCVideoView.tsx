
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Clapperboard, Loader2, Play, AlertCircle, Wand2, Film, Layers, Zap, Image as ImageIcon, Download } from 'lucide-react';
import { AgentState, VideoGenerationState } from '../types';
import { generateVideoPrompt, generateVeoVideo, generateAnimaticKeyframes } from '../services/gemini';

interface AIGCVideoViewProps {
    addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
    videoState: VideoGenerationState;
    setVideoState: (s: VideoGenerationState) => void;
}

const AIGCVideoView: React.FC<AIGCVideoViewProps> = ({ addLog, videoState, setVideoState }) => {
    // Animatic Player State
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const playbackInterval = useRef<any>(null);
    const [isExporting, setIsExporting] = useState(false);
    
    // Hidden Canvas for Export
    const exportCanvasRef = useRef<HTMLCanvasElement>(null);

    // Auto-play animatic when keyframes are present
    useEffect(() => {
        if (videoState.keyframes && videoState.keyframes.length > 0) {
            startAnimaticPlayback();
        }
        return () => stopAnimaticPlayback();
    }, [videoState.keyframes]);

    const startAnimaticPlayback = () => {
        if (playbackInterval.current) clearInterval(playbackInterval.current);
        playbackInterval.current = setInterval(() => {
            setCurrentFrameIndex(prev => (prev + 1) % (videoState.keyframes.length || 1));
        }, 1500); // 1.5s per frame
    };

    const stopAnimaticPlayback = () => {
        if (playbackInterval.current) {
            clearInterval(playbackInterval.current);
            playbackInterval.current = null;
        }
    };

    const updateState = (updates: Partial<VideoGenerationState>) => {
        setVideoState({ ...videoState, ...updates });
    };

    const handleRefinePrompt = async () => {
        if (!videoState.userPrompt) return;
        
        updateState({ status: AgentState.ANALYZING });
        addLog('Assistant Agent', '正在优化您的视频创意，转化为电影级 Prompt...', 'info');
        
        try {
            const refined = await generateVideoPrompt(videoState.userPrompt);
            updateState({ refinedPrompt: refined, status: AgentState.IDLE });
            addLog('System', '提示词优化完成。', 'success');
        } catch (e) {
            console.error(e);
            addLog('System', '提示词优化失败', 'error');
            updateState({ status: AgentState.IDLE });
        }
    };

    const handleGenerate = async () => {
        const promptToUse = videoState.refinedPrompt || videoState.userPrompt;
        if (!promptToUse) return;

        updateState({ status: AgentState.GENERATING, videoUrl: null, keyframes: [] });

        if (videoState.mode === 'VEO') {
            // Veo Mode
            addLog('Veo Model', '正在启动 Veo 3.1 模型生成视频，这可能需要几分钟...', 'info');
            try {
                const url = await generateVeoVideo(promptToUse);
                updateState({ videoUrl: url, status: AgentState.IDLE });
                addLog('Veo Model', '视频生成成功！', 'success');
            } catch (e) {
                console.error(e);
                addLog('Veo Model', '视频生成失败。可能是 API Key 权限问题。请尝试切换到“标准版”模式。', 'error');
                updateState({ status: AgentState.IDLE });
            }
        } else {
            // Animatic Mode (Free/Standard)
            addLog('System', '正在拆解关键帧并生成动态分镜 (Animatic)...', 'info');
            try {
                const frames = await generateAnimaticKeyframes(promptToUse);
                updateState({ keyframes: frames, status: AgentState.IDLE });
                setCurrentFrameIndex(0);
                addLog('System', `动态分镜生成完成，共 ${frames.length} 帧。`, 'success');
            } catch (e) {
                console.error(e);
                addLog('System', '分镜生成失败。', 'error');
                updateState({ status: AgentState.IDLE });
            }
        }
    };

    const handleExportAnimatic = async () => {
        if (!videoState.keyframes || videoState.keyframes.length === 0 || !exportCanvasRef.current) return;
        
        setIsExporting(true);
        addLog('System', '正在将静态分镜合成为视频文件，请稍候...', 'info');
        stopAnimaticPlayback();

        const canvas = exportCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Setup dimensions based on first image (assuming all same size for now)
        const firstImg = new Image();
        firstImg.src = videoState.keyframes[0];
        await new Promise(r => firstImg.onload = r);
        canvas.width = firstImg.naturalWidth;
        canvas.height = firstImg.naturalHeight;

        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'animatic_export.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            addLog('System', '视频合成完毕，已开始下载。', 'success');
            setIsExporting(false);
            startAnimaticPlayback(); // resume preview
        };

        mediaRecorder.start();

        // Draw each frame for 1.5 seconds (at 30fps = 45 frames)
        const frameDuration = 1500;
        
        for (const frameSrc of videoState.keyframes) {
            const img = new Image();
            img.src = frameSrc;
            await new Promise(r => img.onload = r);
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Wait for duration to record this static frame
            await new Promise(r => setTimeout(r, frameDuration));
        }

        mediaRecorder.stop();
    };

    return (
        <div className="p-8 h-full flex flex-col overflow-hidden bg-gradient-to-br from-cinematic-900 to-black">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cinematic-accent">
                        <Clapperboard className="text-purple-400 w-8 h-8" />
                        AIGC 一键成片
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        从简单构想到可视化成片的端到端体验。
                    </p>
                </div>
                
                {/* Mode Switcher */}
                <div className="flex bg-cinematic-800 p-1 rounded-lg border border-cinematic-700">
                    <button
                        onClick={() => updateState({ mode: 'ANIMATIC' })}
                        className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                            videoState.mode === 'ANIMATIC'
                            ? 'bg-cinematic-accent text-cinematic-900 shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Layers className="w-3 h-3" />
                        标准版 (动态分镜)
                    </button>
                    <button
                        onClick={() => updateState({ mode: 'VEO' })}
                        className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                            videoState.mode === 'VEO'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Zap className="w-3 h-3" />
                        专业版 (Veo 视频)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-hidden">
                {/* Left: Creative Control */}
                <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
                    <div className="bg-cinematic-800/40 border border-cinematic-700 rounded-2xl p-6 backdrop-blur-sm">
                        <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-cinematic-accent" />
                            你的构思 (Your Idea)
                        </label>
                        <textarea 
                            className="w-full h-32 bg-black/50 border border-cinematic-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinematic-accent resize-none placeholder-gray-600 transition-all focus:ring-1 focus:ring-cinematic-accent/50"
                            placeholder="例如：一只穿着赛博朋克夹克的猫在霓虹灯闪烁的东京街头滑滑板..."
                            value={videoState.userPrompt}
                            onChange={(e) => updateState({ userPrompt: e.target.value })}
                        />
                        
                        <div className="flex justify-end mt-3">
                            <button 
                                onClick={handleRefinePrompt}
                                disabled={videoState.status !== AgentState.IDLE || !videoState.userPrompt}
                                className="text-xs text-cinematic-accent hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3" /> AI 优化提示词
                            </button>
                        </div>
                    </div>

                    {videoState.refinedPrompt && (
                        <div className="bg-purple-900/10 border border-purple-500/30 rounded-2xl p-6 animate-in slide-in-from-top-4 fade-in">
                            <label className="block text-sm font-bold text-purple-300 mb-2">
                                优化后的 Prompt
                            </label>
                            <p className="text-sm text-gray-300 italic font-mono bg-black/30 p-3 rounded-lg border border-purple-500/20">
                                {videoState.refinedPrompt}
                            </p>
                        </div>
                    )}

                    <div className="mt-auto">
                        <div className="bg-cinematic-800/30 rounded-lg p-3 mb-4 border border-cinematic-700/50">
                            <h4 className="text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                                {videoState.mode === 'VEO' ? <Zap className="w-3 h-3 text-purple-400"/> : <Layers className="w-3 h-3 text-cinematic-accent"/>}
                                当前模式：{videoState.mode === 'VEO' ? 'Veo 视频生成 (需要付费/权限)' : 'AI 动态分镜 (标准/免费)'}
                            </h4>
                            <p className="text-[10px] text-gray-500">
                                {videoState.mode === 'VEO' 
                                 ? '使用 Google Veo 模型生成 720p 真实视频。生成时间较长。' 
                                 : '将创意拆解为关键帧图片，生成连贯的动态预览。速度快，无需特殊权限。'}
                            </p>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={videoState.status !== AgentState.IDLE || !videoState.userPrompt}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-all relative overflow-hidden group ${
                                videoState.status !== AgentState.IDLE
                                ? 'bg-cinematic-800 text-gray-500 cursor-not-allowed'
                                : videoState.mode === 'VEO'
                                  ? 'bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-cinematic-accent to-blue-600 hover:from-cinematic-accent_hover hover:to-blue-500 text-white shadow-lg'
                            }`}
                        >
                            {videoState.status === AgentState.GENERATING ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>AI 正在渲染中...</span>
                                </>
                            ) : videoState.status === AgentState.ANALYZING ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>AI 思考中...</span>
                                </>
                            ) : (
                                <>
                                    {videoState.mode === 'VEO' ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                    <span>{videoState.mode === 'VEO' ? '生成真实视频' : '生成动态分镜'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Preview Theater */}
                <div className="bg-black border border-cinematic-700 rounded-2xl flex flex-col overflow-hidden relative group shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cinematic-accent to-transparent opacity-50"></div>
                    
                    {/* Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-black relative w-full h-full">
                        
                        {/* Hidden Canvas used for Exporting Video */}
                        <canvas ref={exportCanvasRef} className="hidden" />

                        {/* Case 1: Veo Video */}
                        {videoState.videoUrl && (
                            <div className="w-full h-full flex flex-col">
                                <video 
                                    src={videoState.videoUrl} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="w-full h-full object-contain max-h-[600px]"
                                />
                                <div className="absolute bottom-6 right-6">
                                    <a 
                                        href={videoState.videoUrl} 
                                        download="veo-video.mp4"
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg text-white text-sm font-medium transition-colors border border-white/10"
                                    >
                                        下载 MP4
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Case 2: Animatic Slideshow */}
                        {videoState.keyframes && videoState.keyframes.length > 0 && !videoState.videoUrl && (
                            <div className="w-full h-full relative">
                                <img 
                                    src={videoState.keyframes[currentFrameIndex]} 
                                    alt={`Frame ${currentFrameIndex}`}
                                    className="w-full h-full object-contain animate-in fade-in duration-500"
                                    key={currentFrameIndex} // Force re-render for animation
                                />
                                {/* Overlay: Timeline Strip */}
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-between">
                                    <div className="flex gap-2 justify-center">
                                        {videoState.keyframes.map((frame, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => { setCurrentFrameIndex(idx); stopAnimaticPlayback(); }}
                                                className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                                                    idx === currentFrameIndex ? 'border-cinematic-accent scale-110' : 'border-gray-600 opacity-50 hover:opacity-100'
                                                }`}
                                            >
                                                <img src={frame} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={handleExportAnimatic}
                                        disabled={isExporting}
                                        className="px-4 py-2 bg-cinematic-accent/90 hover:bg-cinematic-accent text-cinematic-900 rounded-lg font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        {isExporting ? '合成中...' : '导出视频'}
                                    </button>
                                </div>
                                <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full backdrop-blur">
                                     <span className="text-xs font-mono text-gray-300 tracking-wider">
                                        FRAME {currentFrameIndex + 1}/{videoState.keyframes.length}
                                     </span>
                                </div>
                            </div>
                        )}

                        {/* Case 3: Empty State */}
                        {!videoState.videoUrl && (!videoState.keyframes || videoState.keyframes.length === 0) && (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4">
                                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
                                    videoState.status === AgentState.GENERATING 
                                    ? 'border-purple-500/50 animate-pulse' 
                                    : 'border-cinematic-800'
                                }`}>
                                    {videoState.status === AgentState.GENERATING ? (
                                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                    ) : (
                                        <Play className="w-8 h-8 ml-1 opacity-20" />
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-medium text-gray-500">
                                        {videoState.status === AgentState.GENERATING ? 'AI 正在绘制画面...' : '预览窗口'}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1 max-w-xs mx-auto px-4">
                                        {videoState.status === AgentState.GENERATING 
                                            ? (videoState.mode === 'VEO' ? 'Veo 正在生成真实视频...' : '正在生成关键帧序列...') 
                                            : '在此处查看生成的视频或动态分镜。'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIGCVideoView;
