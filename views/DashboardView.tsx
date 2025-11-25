import React from 'react';
import { Users, BrainCircuit, Activity, BookOpen, Film, Layers } from 'lucide-react';
import { MOCK_FILM_KNOWLEDGE_GRAPH } from '../services/mockPythonBackend';

const DashboardView: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">指挥中心</h1>
        <p className="text-gray-400">三元协同引擎与项目状态的实时概览。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded">活跃</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">学生参与度</h3>
            <p className="text-2xl font-bold text-white mt-1">87%</p>
        </div>

        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs font-mono text-cinematic-accent bg-cinematic-accent/10 px-2 py-1 rounded">处理中</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">智能体干预</h3>
            <p className="text-2xl font-bold text-white mt-1">24/小时</p>
        </div>

        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Film className="w-6 h-6 text-yellow-400" />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">制作资产</h3>
            <p className="text-2xl font-bold text-white mt-1">1,042</p>
        </div>

        <div className="bg-cinematic-800/50 border border-cinematic-700 p-6 rounded-xl hover:bg-cinematic-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-red-400" />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">系统负载</h3>
            <p className="text-2xl font-bold text-white mt-1">12%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Knowledge Graph Visualization */}
          <div className="lg:col-span-2 bg-cinematic-900 border border-cinematic-700 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                 <Layers className="w-64 h-64 text-cinematic-accent" />
             </div>
             <h3 className="font-semibold text-gray-200 mb-6 flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-cinematic-accent" />
                 活跃知识图谱节点
             </h3>
             <div className="flex flex-wrap gap-3">
                 {MOCK_FILM_KNOWLEDGE_GRAPH.concepts.map((concept, i) => (
                     <span key={i} className="px-4 py-2 rounded-full bg-cinematic-800 border border-cinematic-700 text-gray-300 text-sm hover:border-cinematic-accent hover:text-white transition-all cursor-default">
                         {concept}
                     </span>
                 ))}
                 {MOCK_FILM_KNOWLEDGE_GRAPH.skills.map((skill, i) => (
                     <span key={`s-${i}`} className="px-4 py-2 rounded-full bg-blue-900/20 border border-blue-900/50 text-blue-300 text-sm hover:border-blue-400 transition-all cursor-default">
                         {skill}
                     </span>
                 ))}
             </div>
             
             <div className="mt-8 border-t border-cinematic-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-4">近期智能体活动</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-xs font-mono text-gray-500">10:42:15</span>
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-gray-300">教师智能体更新了“摄影基础 101”的评估细则。</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-xs font-mono text-gray-500">10:41:03</span>
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-300">学生智能体请求关于“三点布光”的帮助。</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Quick Actions / System Status */}
          <div className="bg-gradient-to-br from-cinematic-800 to-cinematic-900 border border-cinematic-700 rounded-xl p-6">
             <h3 className="font-semibold text-gray-200 mb-4">系统状态</h3>
             <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-cinematic-900/50 rounded-lg border border-cinematic-700">
                     <span className="text-sm text-gray-400">协同引擎</span>
                     <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                         <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> 在线
                     </span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-cinematic-900/50 rounded-lg border border-cinematic-700">
                     <span className="text-sm text-gray-400">媒体渲染农场</span>
                     <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                         <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 空闲
                     </span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-cinematic-900/50 rounded-lg border border-cinematic-700">
                     <span className="text-sm text-gray-400">Python 后端</span>
                     <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                         <span className="w-2 h-2 rounded-full bg-green-400"></span> 已连接
                     </span>
                 </div>
             </div>
             
             <div className="mt-8">
                 <button className="w-full py-2 bg-cinematic-700 hover:bg-cinematic-600 text-gray-200 rounded-lg text-sm font-medium transition-colors">
                     查看部署日志
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardView;