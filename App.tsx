import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AgentLogs from './components/AgentLogs';
import DashboardView from './views/DashboardView';
import PreProductionView from './views/PreProductionView';
import ProductionView from './views/ProductionView';
import PostProductionView from './views/PostProductionView';
import ArchitectureView from './views/ArchitectureView';
import { ModuleType, LogEntry, ScriptProject, ShotPlan, EditingFeedback } from './types';
import { generateId } from './services/mockPythonBackend';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // === Hoisted State for Persistence ===
  // Pre-Production State
  const [scriptProject, setScriptProject] = useState<ScriptProject>({
    title: '',
    genre: '',
    logline: '',
    structureAnalysis: '',
    characterNotes: ''
  });

  // Production State
  const [sceneDescription, setSceneDescription] = useState('');
  const [shots, setShots] = useState<ShotPlan[]>([]);

  // Post-Production State
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<EditingFeedback[]>([]);

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

  const renderContent = () => {
    switch(activeModule) {
      case ModuleType.DASHBOARD: 
        return <DashboardView />;
      case ModuleType.PRE_PRODUCTION: 
        return (
          <PreProductionView 
            addLog={addLog} 
            project={scriptProject} 
            setProject={setScriptProject} 
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
      case ModuleType.ARCHITECTURE: 
        return <ArchitectureView />;
      default: 
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-cinematic-900 text-gray-100 font-sans overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {renderContent()}
      </main>
      <AgentLogs logs={logs} />
    </div>
  );
}