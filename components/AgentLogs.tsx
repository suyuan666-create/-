import React, { useEffect, useRef } from 'react';
import { Activity, Cpu, User, GraduationCap } from 'lucide-react';
import { LogEntry } from '../types';

interface AgentLogsProps {
  logs: LogEntry[];
}

const AgentLogs: React.FC<AgentLogsProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getIcon = (source: string) => {
    switch (source) {
      case 'Teacher Agent': return <User className="w-3 h-3 text-yellow-400" />;
      case 'Student Agent': return <GraduationCap className="w-3 h-3 text-green-400" />;
      case 'Assistant Agent': return <Cpu className="w-3 h-3 text-cinematic-accent" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 border-red-900/30 bg-red-900/10';
      case 'success': return 'text-green-400 border-green-900/30 bg-green-900/10';
      case 'warning': return 'text-yellow-400 border-yellow-900/30 bg-yellow-900/10';
      default: return 'text-gray-300 border-cinematic-700 bg-cinematic-800/30';
    }
  };

  const getSourceLabel = (source: string) => {
      switch(source) {
          case 'Teacher Agent': return '教师智能体';
          case 'Student Agent': return '学生智能体';
          case 'Assistant Agent': return '辅助智能体';
          case 'Director Agent': return '导演智能体';
          case 'Cinematography Agent': return '摄影智能体';
          case 'Editor Agent': return '剪辑智能体';
          case 'System': return '系统';
          default: return source;
      }
  };

  return (
    <div className="w-80 bg-cinematic-900 border-l border-cinematic-700 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-cinematic-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cinematic-accent" />
          三元协同循环
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cinematic-accent/20 text-cinematic-accent animate-pulse">
          实时
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
        {logs.length === 0 && (
          <div className="text-center text-gray-600 py-10">
            系统初始化中...
          </div>
        )}
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`p-3 rounded border ${getColor(log.type)} transition-all duration-300 animate-in slide-in-from-right-4 fade-in`}
          >
            <div className="flex items-center justify-between mb-1 opacity-70">
              <span className="flex items-center gap-1.5">
                {getIcon(log.source)}
                {getSourceLabel(log.source)}
              </span>
              <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</span>
            </div>
            <p className="leading-relaxed">{log.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-cinematic-700 bg-cinematic-800/50">
        <div className="flex gap-2 text-[10px] text-gray-500 justify-center">
           <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>教师</span>
           <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>学生</span>
           <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cinematic-accent"></span>AI</span>
        </div>
      </div>
    </div>
  );
};

export default AgentLogs;