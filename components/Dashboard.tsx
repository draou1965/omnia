
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { MOCK_TEACHERS } from '../constants';

const dataAbsences = [
  { name: 'الاثنين', absences: 2 },
  { name: 'الثلاثاء', absences: 1 },
  { name: 'الأربعاء', absences: 0 },
  { name: 'الخميس', absences: 4 },
  { name: 'الجمعة', absences: 2 },
];

const StatCard = ({ title, value, icon, color, trend }: { title: string, value: string | number, icon: string, color: string, trend?: string }) => {
  const Icon = (LucideIcons as any)[icon];
  
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color.replace('text-', 'dark:bg-').replace('600', '900/20')} transition-transform`}>
          <Icon className={color} size={24} />
        </div>
        {trend && (
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">معدل النمو</span>
             <span className="text-xs font-black text-emerald-500">{trend} ↑</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">{title}</h3>
        <p className="text-4xl font-black text-slate-900 dark:text-white font-display">{value}</p>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [presentToday, setPresentToday] = useState(MOCK_TEACHERS.length);
  const totalStudents = MOCK_TEACHERS.reduce((acc, t) => acc + t.studentsCount, 0);

  useEffect(() => {
    const saved = localStorage.getItem('today_present_teachers');
    if (saved) {
      setPresentToday(parseInt(saved));
    }
  }, []);

  return (
    <div className="space-y-10 animate-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            صباح الخير، سيادة المدير
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">أهلاً بك في غرفة القيادة. إليك ملخص أداء المؤسسة اليوم.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="المعلمات المتواجدات" value={`${presentToday}/48`} icon="Users" color="text-indigo-600" trend="+4%" />
        <StatCard title="إجمالي الأطفال" value={totalStudents} icon="Baby" color="text-amber-500" trend="+2%" />
        <StatCard title="غيابات الأطفال" value="24" icon="AlertCircle" color="text-rose-500" trend="-1.2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100 font-display">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                  <LucideIcons.BarChart3 size={20} />
                </div>
                إحصائيات الحضور الأسبوعية
              </h3>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataAbsences}>
                  <defs>
                    <linearGradient id="colorAbs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} orientation="right" style={{ fontSize: '12px', fontWeight: 'bold', fill: '#94a3b8' }} dx={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px', backgroundColor: '#fff', color: '#000' }} 
                  />
                  <Area type="monotone" dataKey="absences" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAbs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-slate-100 font-display">
             <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg">
                <LucideIcons.Camera size={20} />
             </div>
             آخر اللحظات
          </h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                 <img src={`https://picsum.photos/seed/moment${i}/100/100`} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                 <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">نشاط تربوي جديد</p>
                    <p className="text-[10px] text-slate-400 font-bold mb-2">القاعة A{i} • منذ {i} س</p>
                    <div className="flex gap-1">
                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                       <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
            فتح المجلة الكاملة
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
