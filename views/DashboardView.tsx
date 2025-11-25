
import React, { useState } from 'react';
import { Users, BrainCircuit, Activity, BookOpen, Film, Layers, X, ExternalLink } from 'lucide-react';
import { MOCK_FILM_KNOWLEDGE_GRAPH } from '../services/mockPythonBackend';
import { User, DashboardStats } from '../types';

interface DashboardViewProps {
  user: User;
  stats: DashboardStats;
}

// Concept definitions for interactivity
const CONCEPT_DEFINITIONS: Record<string, string> = {
  "镜头语言": "电影中通过摄影机的运动、角度、景别等视觉元素来传达故事和情感的语言体系。",
  "蒙太奇": "Montage，一种电影剪辑技术，通过将一系列短镜头拼接在一起，以压缩时间、传达信息或创造情感共鸣。",
  "三点布光": "经典的好莱坞布光法，由主光（Key Light）、补光（Fill Light）和轮廓光（Back Light）组成。",
  "色彩心理学": "研究色彩如何影响人类行为、情绪和生理反应的学科，在电影中用于设定基调和暗示人物心理。",
  "英雄之旅": "约瑟夫·坎贝尔提出的叙事模式，描述了英雄离家、历险并带着力量归来的普遍故事结构。",
  "Davinci Resolve": "好莱坞专业的调色与剪辑软件，广泛用于电影后期制作。",
  "Arri Alexa 操作": "ARRI 数字电影摄影机的操作流程，是高端电影制作的标准设备。",
  "声音设计": "为电影创造听觉世界的过程，包括对白、音效、环境音和音乐的混合与处理。"
};

const DashboardView: React.FC<DashboardViewProps> = ({ user, stats }) => {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const getRoleBadge = (role: string) => {
    return role === 'teacher' 
      ? <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs uppercase font-bold">教师端</span>
      : <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs uppercase font-bold">学生端</span>;
  };

  return (
    <div className="p-8 h-full overflow-y-auto animate-in fade-in duration-500 relative">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             指挥中心 
             {getRoleBadge(user.role)}
          </h1>
          <p className="text-gray-400">
            欢迎回来，<span className="text-cinematic-accent font-medium">{user.name}</span>。
            系统已准备好协助您的{user.role === 'teacher' ? '教学评估' : '创作学习'}。
          </p>
        </div>
        <div className="text-right">
            <div className="text-xs text-gray-500 font-mono">SYSTEM STATUS</div>
            <div className="text-green-400 font-bold flex items-center justify-end gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ONLINE
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded ${stats.studentEngagement > 50 ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
                    {stats.studentEngagement > 50 ? '活跃' : '一般'}
                </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">当前活跃度</h3>
            <p className="text-2xl font-bold text-white mt-1">{stats.studentEngagement}%</p>
        </div>

        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs font-mono text-cinematic-accent bg-cinematic-accent/10 px-2 py-1 rounded">累计</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">智能体交互次数</h3>
            <p className="text-2xl font-bold text-white mt-1">{stats.agentInterventions}</p>
        </div>

        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Film className="w-6 h-6 text-yellow-400" />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">已生成资产</h3>
            <p className="text-2xl font-bold text-white mt-1">{stats.assetsCreated}</p>
        </div>

        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-red-400" />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">系统算力负载</h3>
            <p className="text-2xl font-bold text-white mt-1">{stats.systemLoad}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Knowledge Graph Visualization */}
          <div className="lg:col-span-2 bg-cinematic-900 border border-cinematic-700 rounded-xl p-6 relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                 <Layers className="w-64 h-64 text-cinematic-accent" />
             </div>
             <h3 className="font-semibold text-gray-200 mb-6 flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-cinematic-accent" />
                 影视制作知识图谱 (点击节点查看详情)
             </h3>
             <div className="flex flex-wrap gap-3 mb-auto">
                 {MOCK_FILM_KNOWLEDGE_GRAPH.concepts.map((concept, i) => (
                     <button 
                        key={i} 
                        onClick={() => setSelectedConcept(concept)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                            selectedConcept === concept 
                                ? 'bg-cinematic-accent text-cinematic-900 border-cinematic-accent font-bold shadow-lg shadow-cinematic-accent/20' 
                                : 'bg-cinematic-800 border-cinematic-700 text-gray-300 hover:border-cinematic-accent hover:text-white'
                        }`}
                     >
                         {concept}
                     </button>
                 ))}
                 {MOCK_FILM_KNOWLEDGE_GRAPH.skills.map((skill, i) => (
                     <button 
                        key={`s-${i}`} 
                        onClick={() => setSelectedConcept(skill)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                            selectedConcept === skill
                                ? 'bg-blue-500 text-white border-blue-500 font-bold shadow-lg shadow-blue-500/20'
                                : 'bg-blue-900/20 border-blue-900/50 text-blue-300 hover:border-blue-400'
                        }`}
                     >
                         {skill}
                     </button>
                 ))}
             </div>
             
             {/* Detail Panel */}
             {selectedConcept && (
                 <div className="mt-6 p-4 bg-cinematic-800/80 backdrop-blur border border-cinematic-600 rounded-lg animate-in slide-in-from-bottom-2">
                     <div className="flex justify-between items-start mb-2">
                         <h4 className="text-lg font-bold text-white">{selectedConcept}</h4>
                         <button onClick={() => setSelectedConcept(null)} className="text-gray-500 hover:text-white">
                             <X className="w-4 h-4" />
                         </button>
                     </div>
                     <p className="text-gray-300 text-sm leading-relaxed">
                         {CONCEPT_DEFINITIONS[selectedConcept] || "该知识点的详细定义正在由 AI 生成中，请稍后..."}
                     </p>
                     <div className="mt-3 flex justify-end">
                         <button className="text-xs text-cinematic-accent flex items-center gap-1 hover:underline">
                             查看相关课程 <ExternalLink className="w-3 h-3" />
                         </button>
                     </div>
                 </div>
             )}
          </div>

          {/* Quick Actions / System Status */}
          <div className="bg-gradient-to-br from-cinematic-800 to-cinematic-900 border border-cinematic-700 rounded-xl p-6">
             <h3 className="font-semibold text-gray-200 mb-4">学习/教学进度</h3>
             <div className="space-y-4">
                 <div className="p-4 bg-cinematic-900/50 rounded-lg border border-cinematic-700">
                     <div className="flex justify-between text-xs text-gray-400 mb-1">
                         <span>前期剧本</span>
                         <span>{stats.assetsCreated > 0 ? '进行中' : '未开始'}</span>
                     </div>
                     <div className="w-full bg-cinematic-800 rounded-full h-1.5">
                         <div className="bg-cinematic-accent h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(stats.assetsCreated * 10, 100)}%` }}></div>
                     </div>
                 </div>
                 
                 <div className="p-4 bg-cinematic-900/50 rounded-lg border border-cinematic-700">
                     <div className="flex justify-between text-xs text-gray-400 mb-1">
                         <span>三元协同</span>
                         <span>{stats.agentInterventions > 5 ? '深度交互' : '浅层交互'}</span>
                     </div>
                     <div className="w-full bg-cinematic-800 rounded-full h-1.5">
                         <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(stats.agentInterventions * 2, 100)}%` }}></div>
                     </div>
                 </div>

                 <div className="pt-4 border-t border-cinematic-700">
                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                        您的每一次操作都会被记录在区块链账本中，作为实训成绩的一部分。
                    </p>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardView;
