
import React, { useState } from 'react';
import { ClipboardList, Plus, Send, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { Task, ModuleType } from '../types';

interface TeacherTaskViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  addLog: (source: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const TeacherTaskView: React.FC<TeacherTaskViewProps> = ({ tasks, onAddTask, addLog }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetModule, setTargetModule] = useState<ModuleType>(ModuleType.PRE_PRODUCTION);
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      targetModule,
      deadline: deadline || '无截止日期',
      status: 'active',
      timestamp: new Date().toISOString()
    };

    onAddTask(newTask);
    addLog('Teacher Agent', `已发布新学习任务: "${title}"`, 'success');
    
    // Reset form
    setTitle('');
    setDescription('');
    setDeadline('');
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ClipboardList className="text-purple-400 w-8 h-8" />
            任务控制台
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            发布实训任务给学生智能体与人类学生。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">
        {/* Create Task Form */}
        <div className="lg:col-span-1 flex flex-col h-full overflow-y-auto">
          <div className="bg-cinematic-800/50 border border-cinematic-700 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cinematic-accent" />
              新建任务
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">任务标题</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-cinematic-900 border border-cinematic-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cinematic-accent transition-all"
                  placeholder="例如：完成科幻短片剧本初稿..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">任务详情</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 bg-cinematic-900 border border-cinematic-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cinematic-accent resize-none transition-all"
                  placeholder="详细描述任务要求..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">关联模块</label>
                  <select 
                    value={targetModule}
                    onChange={(e) => setTargetModule(e.target.value as ModuleType)}
                    className="w-full bg-cinematic-900 border border-cinematic-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinematic-accent transition-all text-sm"
                  >
                    <option value={ModuleType.PRE_PRODUCTION}>剧本创意 (AIGC)</option>
                    <option value={ModuleType.PRODUCTION}>虚拟拍摄</option>
                    <option value={ModuleType.POST_PRODUCTION}>后期制作</option>
                    <option value={ModuleType.AIGC_VIDEO}>全流程成片</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">截止日期</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-cinematic-900 border border-cinematic-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinematic-accent transition-all text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!title || !description}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-cinematic-accent hover:from-purple-500 hover:to-cinematic-accent_hover text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" /> 发布任务给学生
              </button>
            </form>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2 bg-cinematic-900 border border-cinematic-700 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-cinematic-700 bg-cinematic-800/30 flex justify-between items-center">
             <h3 className="font-bold text-white flex items-center gap-2">
               <Target className="w-5 h-5 text-green-400" />
               已发布任务 ({tasks.length})
             </h3>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <ClipboardList className="w-16 h-16 mb-4 opacity-20" />
                <p>暂无活跃任务，请在左侧创建。</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="bg-cinematic-800/40 border border-cinematic-700 rounded-xl p-5 hover:border-cinematic-500 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-white group-hover:text-cinematic-accent transition-colors">
                      {task.title}
                    </h4>
                    <span className="px-2 py-1 rounded text-xs font-bold bg-green-900/30 text-green-400 border border-green-800">
                      进行中
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 bg-cinematic-900 px-2 py-1 rounded border border-cinematic-700">
                      <Target className="w-3 h-3" /> 
                      {task.targetModule === ModuleType.PRE_PRODUCTION && '剧本模块'}
                      {task.targetModule === ModuleType.PRODUCTION && '拍摄模块'}
                      {task.targetModule === ModuleType.POST_PRODUCTION && '后期模块'}
                      {task.targetModule === ModuleType.AIGC_VIDEO && 'AIGC模块'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {task.deadline}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <CheckCircle2 className="w-3 h-3" /> 0/1 学生已提交
                    </span>
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

export default TeacherTaskView;
