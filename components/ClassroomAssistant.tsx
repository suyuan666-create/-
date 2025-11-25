
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { askClassroomAssistant } from '../services/gemini';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const ClassroomAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', sender: 'ai', text: '你好！我是你的 AI 课堂助教。关于剧本、拍摄或剪辑有什么不明白的吗？随时问我！' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askClassroomAssistant(input);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: '抱歉，我现在有点忙，请稍后再试。' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-cinematic-900/95 backdrop-blur-xl border border-cinematic-700 rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
          {/* Header */}
          <div className="p-4 bg-cinematic-800 border-b border-cinematic-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cinematic-accent" />
              <span className="font-bold text-white text-sm">AI 课堂助教</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-cinematic-accent'}`}>
                  {msg.sender === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-cinematic-900" />}
                </div>
                <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600/20 text-blue-100 border border-blue-600/30' 
                    : 'bg-cinematic-800 text-gray-200 border border-cinematic-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                 <div className="w-6 h-6 rounded-full bg-cinematic-accent flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 text-cinematic-900" />
                 </div>
                 <div className="px-3 py-2 rounded-xl bg-cinematic-800 border border-cinematic-700">
                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-cinematic-900 border-t border-cinematic-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="询问关于电影制作的问题..."
                className="w-full bg-cinematic-800 border border-cinematic-700 rounded-full pl-4 pr-10 py-2 text-xs text-white focus:outline-none focus:border-cinematic-accent"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1 top-1 p-1.5 bg-cinematic-accent text-cinematic-900 rounded-full hover:bg-cinematic-accent_hover disabled:opacity-50 transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-105 ${
          isOpen 
            ? 'bg-cinematic-800 text-white border border-cinematic-600' 
            : 'bg-gradient-to-br from-cinematic-accent to-blue-600 text-white animate-bounce-subtle'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ClassroomAssistant;
