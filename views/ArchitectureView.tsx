import React, { useState } from 'react';
import { Copy, Terminal } from 'lucide-react';
import { PYTHON_CODE_ARCH, PYTHON_CODE_FRAMEWORK, PYTHON_CODE_MODULES } from '../services/mockPythonBackend';

const CodeBlock: React.FC<{ title: string; code: string }> = ({ title, code }) => (
  <div className="rounded-xl border border-cinematic-700 bg-cinematic-900 overflow-hidden mb-6 shadow-xl">
    <div className="px-4 py-2 bg-cinematic-800 border-b border-cinematic-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Terminal className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-mono text-gray-300">{title}</span>
      </div>
      <button className="text-gray-500 hover:text-white transition-colors">
        <Copy className="w-4 h-4" />
      </button>
    </div>
    <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-300">
      <code>{code.trim()}</code>
    </pre>
  </div>
);

const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'core' | 'framework' | 'modules'>('core');

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">系统架构</h1>
        <p className="text-gray-400">
          教育智能体的底层 Python 实现。
          此视图展示了核心架构、分层框架和影视制作模块的类结构设计。
        </p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-cinematic-700">
        {[
          { id: 'core', label: '核心架构' },
          { id: 'framework', label: '分层框架' },
          { id: 'modules', label: '制作模块' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-cinematic-accent' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cinematic-accent" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'core' && (
        <CodeBlock title="core/architecture.py" code={PYTHON_CODE_ARCH} />
      )}
      
      {activeTab === 'framework' && (
        <CodeBlock title="framework/educational_framework.py" code={PYTHON_CODE_FRAMEWORK} />
      )}

      {activeTab === 'modules' && (
        <CodeBlock title="modules/film_production.py" code={PYTHON_CODE_MODULES} />
      )}
    </div>
  );
};

export default ArchitectureView;