
import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { MOCK_STUDENTS, MOCK_TEACHERS } from '../constants';
import { Section, AssessmentStatus, CompetencyAssessment, Teacher, Student } from '../types';
import * as XLSX from 'xlsx';

const AssessmentGrid: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.TPS);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [pendingSection, setPendingSection] = useState<{section: Section, teacherId: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assessments, setAssessments] = useState<Record<string, CompetencyAssessment>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // سحب المعلمات المحدثة
  const teachers = useMemo(() => {
    const saved = localStorage.getItem('ecogestion_teachers_list');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  }, []);

  const students = useMemo(() => {
    const saved = localStorage.getItem('ecogestion_students_list');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ecogestion_student_assessments');
    if (saved) {
      try { setAssessments(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const saveToLocalStorage = () => {
    localStorage.setItem('ecogestion_student_assessments', JSON.stringify(assessments));
    setHasUnsavedChanges(false);
  };

  const updateAssessmentState = (newAssessments: Record<string, CompetencyAssessment>) => {
    setAssessments(newAssessments);
    setHasUnsavedChanges(true);
  };

  const toggleStatus = (studentId: string, field: keyof CompetencyAssessment) => {
    const current = assessments[studentId] || {
      language: 'not_acquired', math: 'not_acquired', social: 'not_acquired', motor: 'not_acquired', art: 'not_acquired'
    };
    
    const statusCycle: AssessmentStatus[] = ['not_acquired', 'ongoing', 'acquired'];
    const currentIndex = statusCycle.indexOf(current[field]);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    const updated = { ...current, [field]: nextStatus };
    updateAssessmentState({ ...assessments, [studentId]: updated });
  };

  // ميزة التقييم الجماعي للعمود
  const bulkUpdateStatus = (field: keyof CompetencyAssessment, status: AssessmentStatus) => {
    const newAssessments = { ...assessments };
    filteredStudents.forEach(student => {
      if (!newAssessments[student.id]) {
        newAssessments[student.id] = {
          language: 'not_acquired', math: 'not_acquired', social: 'not_acquired', motor: 'not_acquired', art: 'not_acquired'
        };
      }
      newAssessments[student.id][field] = status;
    });
    updateAssessmentState(newAssessments);
  };

  const handleSectionSwitch = (sec: Section) => {
    if (hasUnsavedChanges) {
      setPendingSection({ section: sec, teacherId: 'all' });
      setShowConfirmModal(true);
    } else {
      setActiveSection(sec);
      setSelectedTeacherId('all');
    }
  };

  const confirmSwitch = () => {
    if (pendingSection) {
      setActiveSection(pendingSection.section);
      setSelectedTeacherId(pendingSection.teacherId);
      setHasUnsavedChanges(false);
      setShowConfirmModal(false);
      setPendingSection(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSection = s.section === activeSection;
      const matchesTeacher = selectedTeacherId === 'all' || s.teacherId === selectedTeacherId;
      const matchesSearch = (`${s.firstName} ${s.lastName}`).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesTeacher && matchesSearch;
    });
  }, [activeSection, selectedTeacherId, searchQuery, students]);

  const sectionTeachers = useMemo(() => {
    return teachers.filter((t: Teacher) => t.section === activeSection);
  }, [activeSection, teachers]);

  const chartData = useMemo(() => {
    const comps = [
      { key: 'language', label: 'اللغة' },
      { key: 'math', label: 'المنطق' },
      { key: 'social', label: 'السلوك' },
      { key: 'motor', label: 'الحركي' },
      { key: 'art', label: 'الفن' },
    ];

    return comps.map(c => {
      const scores = filteredStudents.map(s => {
        const status = (assessments[s.id] as any)?.[c.key] || 'not_acquired';
        if (status === 'acquired') return 100;
        if (status === 'ongoing') return 50;
        return 10;
      });
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { subject: c.label, A: avg, fullMark: 100 };
    });
  }, [filteredStudents, assessments]);

  const statusLabels: Record<AssessmentStatus, string> = {
    acquired: 'مكتسب',
    ongoing: 'في طور الاكتساب',
    not_acquired: 'لم يكتسب'
  };

  const StatusBadge = ({ status }: { status: AssessmentStatus }) => {
    const configs = {
      acquired: { color: 'text-emerald-500', stroke: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: LucideIcons.CheckCircle2, label: 'مكتسب' },
      ongoing: { color: 'text-amber-500', stroke: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: LucideIcons.RotateCcw, label: 'جاري' },
      not_acquired: { color: 'text-slate-400', stroke: '#94a3b8', bg: 'bg-slate-50 dark:bg-slate-800/50', icon: LucideIcons.Circle, label: 'لم يكتسب' }
    };
    const config = configs[status];
    const Icon = config.icon;

    return (
      <div className="flex flex-col items-center gap-1 group">
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${config.bg} transition-all group-hover:scale-110 shadow-sm border border-transparent group-hover:border-current`}>
          <Icon className={config.color} size={18} />
        </div>
        <span className={`text-[8px] font-black uppercase tracking-tighter ${config.color}`}>{config.label}</span>
      </div>
    );
  };

  const competencies = [
    { id: 'language', label: 'اللغة والتواصل', icon: LucideIcons.Languages },
    { id: 'math', label: 'المنطق والرياضيات', icon: LucideIcons.Calculator },
    { id: 'social', label: 'السلوك والقيم', icon: LucideIcons.Users },
    { id: 'motor', label: 'الحس-حركي', icon: LucideIcons.Activity },
    { id: 'art', label: 'التعبير الفني', icon: LucideIcons.Palette },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <LucideIcons.AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">تغييرات غير محفوظة!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">هل تريد الانتقال دون حفظ التقييمات الحالية؟</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold">البقاء</button>
              <button onClick={confirmSwitch} className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-bold shadow-lg">تجاهل</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-100/10 dark:shadow-none">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl">
            <LucideIcons.LayoutGrid size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">التقييم الجماعي</h2>
              {hasUnsavedChanges && (
                <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full animate-pulse">تعديلات معلقة</span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              إدارة مكتسبات {filteredStudents.length} طفل في مستوى <span className="text-indigo-600 font-black">{activeSection}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={saveToLocalStorage} 
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${hasUnsavedChanges ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
          >
            <LucideIcons.Save size={18} />
            حفظ التغييرات
          </button>
          <button onClick={() => window.print()} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <LucideIcons.Printer size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center no-print">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {Object.values(Section).map((sec) => (
            <button 
              key={sec} 
              onClick={() => handleSectionSwitch(sec)}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap border-2 ${activeSection === sec ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select 
            className="flex-1 lg:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-500"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="all">كل معلمات {activeSection}</option>
            {sectionTeachers.map((t: Teacher) => (
              <option key={t.id} value={t.id}>{t.name} ({t.classRoom})</option>
            ))}
          </select>
          <div className="relative">
            <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="بحث سريع..."
              className="pr-10 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-44 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest sticky right-0 bg-white/95 dark:bg-slate-900/95 z-10 w-72">الطفل / القسم</th>
                  {competencies.map(c => (
                    <th key={c.id} className="p-4 min-w-[140px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg"><c.icon size={18} /></div>
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{c.label}</span>
                        {/* أزرار التقييم الجماعي للعمود */}
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => bulkUpdateStatus(c.id as any, 'acquired')} className="p-1 hover:bg-emerald-100 rounded text-emerald-600" title="الكل مكتسب"><LucideIcons.CheckCircle2 size={12} /></button>
                          <button onClick={() => bulkUpdateStatus(c.id as any, 'not_acquired')} className="p-1 hover:bg-slate-200 rounded text-slate-400" title="الكل لم يكتسب"><LucideIcons.Circle size={12} /></button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all group/row">
                    <td className="p-4 sticky right-0 bg-white dark:bg-slate-900 group-hover/row:bg-indigo-50/40 z-10 border-l border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <img src={student.avatar} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm" alt="" />
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{student.firstName} {student.lastName}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{student.teacherName} - {student.className}</p>
                        </div>
                      </div>
                    </td>
                    {competencies.map(c => {
                      const status = (assessments[student.id] || {} as any)[c.id] || 'not_acquired';
                      return (
                        <td key={c.id} className="p-3 text-center">
                          <button onClick={() => toggleStatus(student.id, c.id as any)} className="w-full transform transition-all active:scale-90">
                            <StatusBadge status={status} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl p-6 flex flex-col no-print">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <LucideIcons.Target className="text-rose-500" size={18} />
              مستوى أداء المجموعة
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                  <Radar name="القسم" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
                  <RechartsTooltip contentStyle={{ fontSize: '10px', borderRadius: '10px', border: 'none', background: '#0f172a', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <LucideIcons.Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
            <h4 className="font-black text-lg mb-3">تحليل ذكي للنتائج</h4>
            <p className="text-xs text-indigo-100 leading-relaxed italic opacity-90">
              {filteredStudents.length > 0 
                ? `يتم تحليل نتائج ${filteredStudents.length} طفلاً حالياً. نسبة التمكن في التواصل اللغوي مرتفعة لهذا القسم مقارنة بالمعدل العام.`
                : "يرجى اختيار قسم أو معلمة لبدء التحليل التربوي."}
            </p>
            <button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all">
              طلب نصيحة بيداغوجية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentGrid;
