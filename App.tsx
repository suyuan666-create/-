
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AgentLogs from './components/AgentLogs';
import DashboardView from './views/DashboardView';
import PreProductionView from './views/PreProductionView';
import ProductionView from './views/ProductionView';
import PostProductionView from './views/PostProductionView';
import AIGCVideoView from './views/AIGCVideoView';
import ArchitectureView from './views/ArchitectureView';
import LoginView from './views/LoginView'; 
import { ModuleType, LogEntry, ScriptProject, ShotPlan, EditingFeedback, VideoGenerationState, AgentState, User, DashboardStats } from './types';
import { generateId } from './services/mockPythonBackend';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // === Hoisted State for Persistence ===
  
  // Pre-Production State
  const [scriptProject, setScriptProject] = useState<ScriptProject>({
    title: '',
    genre: '',
    logline: '',
    structureAnalysis: '',
    characterNotes: '',
    scenes: []
  });

  // Production State
  const [sceneDescription, setSceneDescription] = useState('');
  const [shots, setShots] = useState<ShotPlan[]>([]);

  // Post-Production State
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<EditingFeedback[]>([]);

  // AIGC Video State
  const [videoState, setVideoState] = useState<VideoGenerationState>({
    userPrompt: '',
    refinedPrompt: '',
    mode: 'ANIMATIC',
    videoUrl: null,
    keyframes: [],
    status: AgentState.IDLE
  });

  // Real-time Stats Calculation
  const [stats, setStats] = useState<DashboardStats>({
    studentEngagement: 0,
    agentInterventions: 0,
    assetsCreated: 0,
    systemLoad: 0
  });

  useEffect(() => {
    // Calculate stats whenever assets change
    const assetCount = 
      (scriptProject.title ? 1 : 0) + 
      shots.length + 
      (uploadedVideoUrl ? 1 : 0) + 
      (videoState.videoUrl || videoState.keyframes.length > 0 ? 1 : 0);

    const logCount = logs.length;
    
    // Simple algorithm to simulate engagement based on interaction count
    const engagement = Math.min(100, Math.round((assetCount * 10 + logCount * 2) / 1.5));
    
    // Simulate system load randomly but correlated with activity
    const baseLoad = 12; // idle load
    const activeLoad = videoState.status !== AgentState.IDLE ? 65 : 0;
    
    setStats({
      studentEngagement: engagement,
      agentInterventions: logCount,
      assetsCreated: assetCount,
      systemLoad: baseLoad + activeLoad
    });
  }, [scriptProject, shots, uploadedVideoUrl, videoState, logs]);


  const addLog = (source: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: LogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      source: source as any,
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveModule(ModuleType.DASHBOARD);
    addLog('System', `用户 ${user.name} (${user.role === 'student' ? '学生' : '教师'}) 已登录系统。`, 'success');
  };

  const handleLogout = () => {
    addLog('System', `用户 ${currentUser?.name} 已退出系统。`, 'info');
    
    // 1. Reset User
    setCurrentUser(null);
    
    // 2. Reset All Application State
    setActiveModule(ModuleType.DASHBOARD);
    setScriptProject({
      title: '',
      genre: '',
      logline: '',
      structureAnalysis: '',
      characterNotes: '',
      scenes: []
    });
    setSceneDescription('');
    setShots([]);
    setUploadedVideoUrl(null);
    setEditingFeedback([]);
    setVideoState({
      userPrompt: '',
      refinedPrompt: '',
      mode: 'ANIMATIC',
      videoUrl: null,
      keyframes: [],
      status: AgentState.IDLE
    });
    setLogs([]); // Clear logs on logout
  };

  const renderContent = () => {
    if (!currentUser) return <LoginView onLogin={handleLogin} />;

    switch(activeModule) {
      case ModuleType.DASHBOARD: 
        return <DashboardView user={currentUser} stats={stats} />;
      
      case ModuleType.PRE_PRODUCTION: 
        return (
          <PreProductionView 
            addLog={addLog} 
            project={scriptProject} 
            setProject={setScriptProject} 
            onNavigateToProduction={() => setActiveModule(ModuleType.PRODUCTION)}
          />
        );
      case ModuleType.PRODUCTION: 
        return (
          <ProductionView 
            addLog={addLog}
            sceneDesc={sceneDescription}
            setSceneDesc={setSceneDescription}
            shots={shots}
            setShots={setShots}
            importedScenes={scriptProject.scenes} 
          />
        );
      case ModuleType.POST_PRODUCTION: 
        return (
          <PostProductionView 
            addLog={addLog}
            videoUrl={uploadedVideoUrl}
            setVideoUrl={setUploadedVideoUrl}
            feedback={editingFeedback}
            setFeedback={setEditingFeedback}
          />
        );
      case ModuleType.AIGC_VIDEO: 
        return (
          <AIGCVideoView 
            addLog={addLog}
            videoState={videoState}
            setVideoState={setVideoState}
          />
        );
      case ModuleType.ARCHITECTURE: 
        return <ArchitectureView />;
      default: 
        return <DashboardView user={currentUser} stats={stats} />;
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-cinematic-900 text-gray-100 font-sans overflow-hidden">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        onLogout={handleLogout} 
        userRole={currentUser.role}
      />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {renderContent()}
      </main>
      <AgentLogs logs={logs} />
    </div>
  );
}
