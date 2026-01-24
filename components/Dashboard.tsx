
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { MOCK_TEACHERS } from '../constants';
import { Section } from '../types';

const dataAbsences = [
  { name: 'الاثنين', absences: 2 },
  { name: 'الثلاثاء', absences: 1 },
  { name: 'الأربعاء', absences: 0 },
  { name: 'الخميس', absences: 4 },
  { name: 'الجمعة', absences: 2 },
];

const sectionData = [
  { name: 'الحضانة', value: MOCK_TEACHERS.filter(t => t.section === Section.TPS).length, color: '#6366f1' },
  { name: 'الأصغر', value: MOCK_TEACHERS.filter(t => t.section === Section.PS).length, color: '#f59e0b' },
  { name: 'الأوسط', value: MOCK_TEACHERS.filter(t => t.section === Section.MS).length, color: '#10b981' },
  { name: 'الأكبر', value: MOCK_TEACHERS.filter(t => t.section === Section.GS).length, color: '#ec4899' },
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
  const totalStudents = MOCK_TEACHERS.reduce((acc, t) => acc + t.studentsCount, 0);
  const presentTeachers = MOCK_TEACHERS.filter(t => t.status === 'present').length;

  return (
    <div className="space-y-10 animate-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            صباح الخير، سيادة المدير
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">أهلاً بك في غرفة القيادة. إليك ملخص أداء المؤسسة اليوم.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            تقرير الأمس
          </button>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
            تحديث البيانات
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="المعلمات المتواجدات" value={`${presentTeachers}/48`} icon="Users" color="text-indigo-600" trend="+4%" />
        <StatCard title="إجمالي الأطفال" value={totalStudents} icon="Baby" color="text-amber-500" trend="+2%" />
        <StatCard title="غيابات الأطفال" value="24" icon="AlertCircle" color="text-rose-500" trend="-1.2%" />
        <StatCard title="رسائل معالجة (IA)" value="12" icon="Sparkles" color="text-emerald-500" trend="+15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100 font-display">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                  <LucideIcons.BarChart3 size={20} />
                </div>
                إحصائيات الحضور الأسبوعية
              </h3>
            </div>
          </div>
          <div className="h-72">
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

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-slate-100 font-display">
             <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg">
                <LucideIcons.PieChart size={20} />
             </div>
             كثافة الأقسام
          </h3>
          <div className="h-60 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {sectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white">48</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">مربية</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
              {sectionData.map((s) => (
                <div key={s.name} className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-xs font-bold text-slate-500 truncate">{s.name}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">{s.value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
