
import React from 'react';
import { SCHOOL_NAV_ITEMS } from '../constants';
import * as LucideIcons from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-80 glass-panel border-l border-white/20 dark:border-slate-800/30 flex flex-col h-screen sticky top-0 z-50 transition-all duration-500 overflow-hidden shadow-2xl">
      <div className="p-12">
        <div className="flex items-center gap-5 group cursor-pointer relative">
          <div className="absolute -inset-4 bg-indigo-500/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700"></div>
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-4 rounded-[1.8rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none group-hover:rotate-6 transition-all duration-500 relative z-10">
            <LucideIcons.GraduationCap size={36} />
          </div>
          <div className="flex flex-col relative z-10 overflow-hidden">
            <h1 className="font-black text-2xl tracking-tighter text-slate-900 dark:text-slate-100 font-display leading-tight">جمعية الأمنية</h1>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.4em] mt-2">الإصدار الذكي</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-8 py-4 space-y-3 overflow-y-auto scrollbar-hide">
        <p className="px-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-8 opacity-60">قائمة الإدارة</p>
        {SCHOOL_NAV_ITEMS.map((item) => {
          const Icon = (LucideIcons as any)[item.icon];
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-6 px-6 py-5 rounded-[1.8rem] transition-all duration-500 group relative overflow-hidden ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-300 dark:shadow-none scale-[1.02]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-[-10px] hover:shadow-lg'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 ${
                isActive ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600'
              }`}>
                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
              </div>
              
              <span className={`text-sm font-black transition-all duration-500 tracking-tight ${isActive ? 'translate-x-[-2px]' : ''}`}>
                {item.label}
              </span>

              {isActive && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-xl animate-pulse">
                  <LucideIcons.ChevronLeft size={18} strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-10">
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-white dark:border-slate-800 shadow-xl group/user transition-all hover:scale-105">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/director/150/150" 
                className="w-16 h-16 rounded-[1.5rem] border-4 border-white dark:border-slate-800 shadow-2xl object-cover transition-transform group-hover/user:scale-110" 
                alt="Director" 
              />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full shadow-lg"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-base font-black text-slate-900 dark:text-slate-100 truncate tracking-tight">سيادة المدير</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest mt-1.5 opacity-70">المشرف العام</p>
            </div>
            <button className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-2xl transition-all active:scale-90">
              <LucideIcons.LogOut size={22} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
