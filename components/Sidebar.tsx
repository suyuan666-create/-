import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Film, 
  Code2, 
  Settings,
  Sparkles
} from 'lucide-react';
import { ModuleType } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    { id: ModuleType.DASHBOARD, label: '指挥中心', icon: LayoutDashboard },
    { id: ModuleType.PRE_PRODUCTION, label: '创意与剧本 (AIGC)', icon: Sparkles },
    { id: ModuleType.PRODUCTION, label: '分镜与虚拟拍摄', icon: Video },
    { id: ModuleType.POST_PRODUCTION, label: '后期视觉分析', icon: Film },
    { id: ModuleType.ARCHITECTURE, label: '系统核心 (Python)', icon: Code2 },
  ];

  return (
    <div className="w-64 bg-cinematic-900 border-r border-cinematic-700 flex flex-col h-full shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cinematic-accent to-purple-600 flex items-center justify-center">
          <Film className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          CineEdu AI
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-cinematic-800 text-cinematic-accent shadow-lg shadow-black/20' 
                  : 'text-gray-400 hover:bg-cinematic-800/50 hover:text-gray-200'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-cinematic-accent' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cinematic-accent animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cinematic-700">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">系统配置</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;