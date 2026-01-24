
import React, { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { generatePedagogicalResponse } from '../services/geminiService';
import { Message } from '../types';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "مرحباً بك! أنا مساعدك الذكي المتخصص في الشؤون التربوية. يمكنني مساعدتك في صياغة رسائل للأهل، تقديم استشارات بيداغوجية، أو تنظيم فعاليات الروضة. كيف يمكنني خدمتك اليوم؟",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await generatePedagogicalResponse(input);
    
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response || "عذراً، لم أتمكن من توليد إجابة حالياً. يرجى المحاولة لاحقاً.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const suggestions = [
    "تحضير رسالة ترحيبية للدخول المدرسي",
    "خطة لمواجهة الخوف من المدرسة",
    "أفكار لليوم الوطني للطفل",
    "جدول أعمال اجتماع بيداغوجي"
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-100/10 dark:shadow-none overflow-hidden animate-in">
      <header className="p-8 bg-indigo-600 text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md border border-white/20">
            <LucideIcons.Sparkles size={28} className="text-amber-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black font-display tracking-tight">المساعد التربوي الذكي</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-xs text-indigo-100 font-bold opacity-80 uppercase tracking-widest">متصل • مدعوم بـ Gemini 3</p>
            </div>
          </div>
        </div>
        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-md relative z-10">
          <LucideIcons.Settings size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-slate-50/30 dark:bg-slate-900/50" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end animate-in'}`}>
            <div className={`max-w-[85%] relative group ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`p-6 rounded-[2rem] shadow-xl ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tl-none shadow-indigo-100 dark:shadow-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-none border border-slate-100 dark:border-slate-700 shadow-slate-200/50 dark:shadow-none'
              }`}>
                <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
                <div className={`flex items-center gap-2 mt-4 opacity-50 ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                   <span className="text-[10px] font-black uppercase tracking-widest">
                     {m.timestamp.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   {m.role === 'assistant' && <LucideIcons.CheckCheck size={14} className="text-indigo-500" />}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] rounded-tr-none p-6 border border-slate-100 dark:border-slate-700 shadow-xl flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <span className="text-xs font-black text-slate-400 mr-2 uppercase tracking-widest">المساعد يفكر...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {suggestions.map((s) => (
            <button 
              key={s}
              onClick={() => setInput(s)}
              className="px-5 py-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 text-xs font-black rounded-2xl border border-indigo-100 dark:border-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all whitespace-nowrap active:scale-95 shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="بماذا يمكنني مساعدتك اليوم؟"
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-right dark:text-slate-100 font-bold shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <LucideIcons.Mic size={20} />
               </button>
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <LucideIcons.Paperclip size={20} />
               </button>
            </div>
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white p-5 rounded-[1.5rem] hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95"
          >
            <LucideIcons.Send size={24} className="transform rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
