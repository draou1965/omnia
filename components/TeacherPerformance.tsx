
import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { MOCK_TEACHERS } from '../constants';
import { Teacher } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface PerformanceMetric {
  subject: string;
  score: number;
  fullMark: number;
}

const TeacherPerformance: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const teachersWithScores = useMemo(() => {
    return MOCK_TEACHERS.map((t, i) => ({
      ...t,
      scores: [
        { subject: 'البيداغوجيا', score: 70 + (i % 30), fullMark: 100 },
        { subject: 'الانضباط', score: 80 + (i % 20), fullMark: 100 },
        { subject: 'تفاعل الأهل', score: 65 + (i % 35), fullMark: 100 },
        { subject: 'الابتكار', score: 60 + (i % 40), fullMark: 100 },
        { subject: 'إدارة القسم', score: 75 + (i % 25), fullMark: 100 },
      ]
    }));
  }, []);

  const filteredTeachers = teachersWithScores.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeacher = teachersWithScores.find(t => t.id === selectedTeacherId);

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-xl">
            <LucideIcons.Trophy size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">تقييم أداء المعلمات</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">مراقبة الجودة التربوية لـ 48 مربية ومعلمة.</p>
          </div>
        </div>
        <div className="relative">
          <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث عن معلمة..."
            className="pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none w-64 shadow-inner text-sm font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قائمة المعلمات */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">الطاقم التعليمي</h3>
          </div>
          <div className="overflow-y-auto flex-1 scrollbar-hide">
            {filteredTeachers.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeacherId(t.id)}
                className={`w-full p-4 flex items-center gap-4 transition-all border-b border-slate-50 dark:border-slate-800/50 ${selectedTeacherId === t.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-r-4 border-r-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <img src={t.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{t.classRoom}</p>
                </div>
                <div className="mr-auto">
                   <div className="flex items-center gap-1 text-amber-500">
                     <LucideIcons.Star size={12} fill="currentColor" />
                     <span className="text-xs font-black">{(t.scores.reduce((a, b) => a + b.score, 0) / 5 / 10).toFixed(1)}</span>
                   </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* تفاصيل التقييم */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeacher ? (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl p-10 animate-in zoom-in-95">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-50 dark:border-slate-800">
                <img src={selectedTeacher.avatar} className="w-32 h-32 rounded-[2rem] border-8 border-slate-50 dark:border-slate-800 shadow-2xl object-cover" alt="" />
                <div className="text-center md:text-right">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">{selectedTeacher.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                    <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedTeacher.section}</span>
                    <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedTeacher.classRoom}</span>
                  </div>
                </div>
                <div className="md:mr-auto flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">التقييم العام</p>
                   <p className="text-4xl font-black text-indigo-600">{(selectedTeacher.scores.reduce((a, b) => a + b.score, 0) / 5 / 10).toFixed(1)}</p>
                   <div className="flex gap-1 mt-2">
                     {[1,2,3,4,5].map(i => <LucideIcons.Star key={i} size={12} className={i <= 4 ? 'text-amber-500' : 'text-slate-200'} fill="currentColor" />)}
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedTeacher.scores}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar name="الأداء" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                   <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                     <LucideIcons.TrendingUp className="text-indigo-600" size={18} />
                     تحليل نقاط القوة
                   </h4>
                   <div className="space-y-4">
                     {selectedTeacher.scores.map(s => (
                       <div key={s.subject}>
                         <div className="flex justify-between items-end mb-1.5">
                           <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{s.subject}</span>
                           <span className="text-xs font-black text-slate-900 dark:text-white">{s.score}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-1000 ${s.score > 80 ? 'bg-emerald-500' : s.score > 60 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                             style={{ width: `${s.score}%` }}
                           ></div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30">
                 <h4 className="font-black text-indigo-600 mb-4 flex items-center gap-2">
                   <LucideIcons.MessageSquare size={18} /> ملاحظات الإدارة
                 </h4>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic font-medium">
                   "المعلمة {selectedTeacher.name} تظهر حماساً كبيراً في الأنشطة المبتكرة. نوصي بتعزيز مهارات إدارة الوقت في القاعة الدراسية لضمان إنهاء البرنامج اليومي بسلاسة."
                 </p>
                 <button className="mt-6 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">إضافة ملاحظة جديدة</button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 space-y-4 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 border-dashed">
              <LucideIcons.UserCheck size={80} strokeWidth={1} />
              <p className="font-black text-xl">اختر معلمة لعرض تقرير الأداء</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPerformance;
