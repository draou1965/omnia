
import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { MOCK_STUDENTS, MOCK_TEACHERS } from '../constants';
import { Section, AssessmentStatus, CompetencyAssessment, Teacher, Student } from '../types';
import { generateStudentReportComment } from '../services/geminiService';
import * as XLSX from 'xlsx';

const AssessmentGrid: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.TPS);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [pendingSection, setPendingSection] = useState<{section: Section, teacherId: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assessments, setAssessments] = useState<Record<string, CompetencyAssessment>>({});
  const [studentComments, setStudentComments] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Individual Report View
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [isGeneratingComment, setIsGeneratingComment] = useState<string | null>(null);

  const teachers = useMemo(() => {
    const saved = localStorage.getItem('ecogestion_teachers_list');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  }, []);

  const students = useMemo(() => {
    const saved = localStorage.getItem('ecogestion_students_list');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  }, []);

  useEffect(() => {
    const savedAssess = localStorage.getItem('ecogestion_student_assessments');
    const savedComments = localStorage.getItem('ecogestion_student_comments');
    if (savedAssess) {
      try { setAssessments(JSON.parse(savedAssess)); } catch (e) { console.error(e); }
    }
    if (savedComments) {
      try { setStudentComments(JSON.parse(savedComments)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('ecogestion_student_assessments', JSON.stringify(assessments));
    localStorage.setItem('ecogestion_student_comments', JSON.stringify(studentComments));
    setHasUnsavedChanges(false);
    alert('تم حفظ كافة البيانات بنجاح');
  };

  const toggleStatus = (studentId: string, field: keyof CompetencyAssessment) => {
    const current = assessments[studentId] || {
      language: 'not_acquired', math: 'not_acquired', social: 'not_acquired', motor: 'not_acquired', art: 'not_acquired'
    };
    
    const statusCycle: AssessmentStatus[] = ['not_acquired', 'ongoing', 'acquired'];
    const currentIndex = statusCycle.indexOf(current[field]);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    const updated = { ...current, [field]: nextStatus };
    setAssessments(prev => ({ ...prev, [studentId]: updated }));
    setHasUnsavedChanges(true);
  };

  const handleGenerateComment = async (student: Student) => {
    if (isGeneratingComment) return;
    setIsGeneratingComment(student.id);
    
    const currentAssess = assessments[student.id] || {
      language: 'not_acquired', math: 'not_acquired', social: 'not_acquired', motor: 'not_acquired', art: 'not_acquired'
    };

    const comment = await generateStudentReportComment(
      `${student.firstName} ${student.lastName}`,
      student.section,
      currentAssess as CompetencyAssessment
    );

    setStudentComments(prev => ({ ...prev, [student.id]: comment }));
    setHasUnsavedChanges(true);
    setIsGeneratingComment(null);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSection = s.section === activeSection;
      const matchesTeacher = selectedTeacherId === 'all' || s.teacherId === selectedTeacherId;
      const matchesSearch = (`${s.firstName} ${s.lastName}`).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesTeacher && matchesSearch;
    });
  }, [activeSection, selectedTeacherId, searchQuery, students]);

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

  const competencies = [
    { id: 'language', label: 'اللغة والتواصل', icon: LucideIcons.Languages },
    { id: 'math', label: 'المنطق والرياضيات', icon: LucideIcons.Calculator },
    { id: 'social', label: 'السلوك والقيم', icon: LucideIcons.Users },
    { id: 'motor', label: 'الحس-حركي', icon: LucideIcons.Activity },
    { id: 'art', label: 'التعبير الفني', icon: LucideIcons.Palette },
  ];

  const StatusBadge = ({ status }: { status: AssessmentStatus }) => {
    const configs = {
      acquired: { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: LucideIcons.CheckCircle2, label: 'مكتسب' },
      ongoing: { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: LucideIcons.RotateCcw, label: 'جاري' },
      not_acquired: { color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50', icon: LucideIcons.Circle, label: 'لم يكتسب' }
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Modal: Individual Student Report */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <img src={selectedStudentForReport.avatar} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-indigo-50" alt="" />
                <div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">{selectedStudentForReport.firstName} {selectedStudentForReport.lastName}</h3>
                   <p className="text-sm font-bold text-slate-500">{selectedStudentForReport.section} • {selectedStudentForReport.teacherName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentForReport(null)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all">
                <LucideIcons.X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] scrollbar-hide">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {competencies.map(c => {
                    const status = (assessments[selectedStudentForReport.id] as any)?.[c.id] || 'not_acquired';
                    return (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white dark:bg-slate-700 text-indigo-600 rounded-lg shadow-sm">
                             <c.icon size={16} />
                           </div>
                           <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.label}</span>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                    );
                  })}
               </div>

               <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/40 relative">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-indigo-700 dark:text-indigo-400 text-sm flex items-center gap-2">
                      <LucideIcons.Sparkles size={16} /> الملاحظة التربوية (AI)
                    </h4>
                    <button 
                      onClick={() => handleGenerateComment(selectedStudentForReport)}
                      className="text-xs font-black text-indigo-600 hover:underline"
                    >
                      {isGeneratingComment ? "جاري التوليد..." : "تحديث الملاحظة"}
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    {studentComments[selectedStudentForReport.id] || "لا يوجد تعليق مخصص حالياً. انقر على الزر لتوليد واحد."}
                  </p>
               </div>
            </div>

            <footer className="p-10 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
               <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                 <LucideIcons.Printer size={18} /> طباعة بطاقة التقدم
               </button>
               <button className="flex-1 py-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm">
                 إرسال للأهل عبر واتساب
               </button>
            </footer>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl">
            <LucideIcons.LayoutGrid size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">شبكة التقييم التربوي</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic font-medium">متابعة دقيقة لمكتسبات الأطفال في جميع الكفايات.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={saveToLocalStorage} 
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${hasUnsavedChanges ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
          >
            <LucideIcons.Save size={18} /> حفظ التقدم
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 items-center no-print">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          {Object.values(Section).map((sec) => (
            <button 
              key={sec} 
              onClick={() => setActiveSection(sec)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap ${activeSection === sec ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {sec}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px] relative">
           <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <input 
             type="text" 
             placeholder="بحث عن طفل..."
             className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-10 py-2.5 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-500"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-widest">
                <th className="px-8 py-6 text-right sticky right-0 bg-slate-50 dark:bg-slate-800/90 z-10 w-64">الطفل</th>
                {competencies.map(c => (
                  <th key={c.id} className="px-4 py-6 text-center">{c.label}</th>
                ))}
                <th className="px-8 py-6 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors group">
                  <td className="px-8 py-4 sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 z-10 border-l border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <img src={student.avatar} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shadow-sm" alt="" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{student.teacherName}</p>
                      </div>
                    </div>
                  </td>
                  {competencies.map(c => {
                    const status = (assessments[student.id] as any)?.[c.id] || 'not_acquired';
                    return (
                      <td key={c.id} className="px-4 py-4">
                        <button onClick={() => toggleStatus(student.id, c.id as any)} className="w-full flex justify-center">
                          <StatusBadge status={status} />
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-8 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedStudentForReport(student)}
                        className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="عرض التقرير المفصل"
                      >
                        <LucideIcons.BarChart3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleGenerateComment(student)}
                        className={`p-2 rounded-lg transition-all ${isGeneratingComment === student.id ? 'bg-amber-100 text-amber-600 animate-pulse' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-600 hover:text-white'}`}
                        title="توليد ملاحظة بذكاء اصطناعي"
                      >
                        <LucideIcons.Brain size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6 no-print">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <LucideIcons.Target className="text-indigo-600" /> ميزان المستوى العام
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <Radar name="الأداء" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-bold italic">
              "يعكس الرسم البياني أعلاه متوسط تمكن الأطفال في المستوى الحالي. هناك فجوة ملحوظة في 'المنطق والرياضيات' تتطلب أنشطة مكثفة."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentGrid;
