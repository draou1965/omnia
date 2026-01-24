
import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { MOCK_STUDENTS, MOCK_TEACHERS } from '../constants';
import { Section, Student, Teacher } from '../types';
import * as XLSX from 'xlsx';

interface StudentListProps {
  initialTeacherFilter?: string | null;
  onNavigateToTeacher?: (name: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ initialTeacherFilter = null, onNavigateToTeacher }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<Section | 'all'>('all');
  const [teacherFilter, setTeacherFilter] = useState<string | 'all'>(initialTeacherFilter || 'all');
  
  // سحب المعلمات من localStorage لضمان تحديث الربط بعد الاستيراد
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('ecogestion_teachers_list');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('ecogestion_students_list');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });
  
  const [pendingStudents, setPendingStudents] = useState<Student[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('ecogestion_students_list', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    if (initialTeacherFilter) {
      setTeacherFilter(initialTeacherFilter);
      setActiveSection('all');
    }
  }, [initialTeacherFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`;
      const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            student.massarNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = activeSection === 'all' || student.section === activeSection;
      const matchesTeacher = teacherFilter === 'all' || student.teacherId === teacherFilter;
      
      return matchesSearch && matchesSection && matchesTeacher;
    });
  }, [searchQuery, activeSection, teacherFilter, students]);

  const selectedTeacher = useMemo(() => {
    return teachers.find(t => t.id === teacherFilter);
  }, [teacherFilter, teachers]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const imported: Student[] = data.map((row, index) => {
        const sectionStr = row['القسم'] || row['المستوى'] || '';
        let section: Section = Section.TPS;
        if (sectionStr.includes('أصغر')) section = Section.PS;
        else if (sectionStr.includes('أوسط')) section = Section.MS;
        else if (sectionStr.includes('أكبر')) section = Section.GS;

        // الربط بالمعلمة المناسبة من القائمة الحالية (المستوردة أو الافتراضية)
        const teacher = teachers.find(t => t.section === section) || teachers[0];

        return {
          id: `imp-${Date.now()}-${index}`,
          firstName: row['الإسم الشخصي'] || row['Prénom'] || 'تلميذ',
          lastName: row['الإسم العائلي'] || row['Nom'] || 'جديد',
          massarNumber: row['رقم مسار'] || row['Code Massar'] || `M${Date.now()}${index}`,
          birthDate: row['تاريخ الازدياد'] || '2020-01-01',
          gender: (row['الجنس'] === 'أنثى' || row['Sexe'] === 'F') ? 'female' : 'male',
          section: section,
          avatar: `https://i.pravatar.cc/150?u=imported-${index + Date.now()}`,
          parentName: row['ولي الأمر'] || 'غير مسجل',
          parentPhone: row['الهاتف'] || '0600000000',
          parentEmail: '',
          address: row['العنوان'] || '',
          className: teacher.classRoom,
          teacherId: teacher.id,
          teacherName: teacher.name
        };
      });

      setPendingStudents(imported);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = () => {
    if (pendingStudents) {
      setStudents(prev => [...pendingStudents, ...prev]);
      setPendingStudents(null);
    }
  };

  const updatePendingName = (index: number, field: 'firstName' | 'lastName', value: string) => {
    if (!pendingStudents) return;
    const updated = [...pendingStudents];
    updated[index][field] = value;
    setPendingStudents(updated);
  };

  const exportToExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      'الإسم الشخصي': s.firstName,
      'الإسم العائلي': s.lastName,
      'رقم مسار': s.massarNumber,
      'تاريخ الازدياد': s.birthDate,
      'الصنف': s.gender === 'male' ? 'ذكر' : 'أنثى',
      'المستوى الدراسي': s.section,
      'المعلمة': s.teacherName,
      'إسم ولي الأمر': s.parentName,
      'هاتف التواصل': s.parentPhone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "لائحة الأطفال");
    XLSX.writeFile(workbook, `لائحة_أطفال_الروضة_${new Date().toLocaleDateString('ar-MA')}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-white dark:border-slate-800 shadow-xl shadow-indigo-100/10 dark:shadow-none">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">قاعدة بيانات الأطفال ({students.length})</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 italic">
            {teacherFilter !== 'all' ? `عرض أطفال فصل: ${selectedTeacher?.name}` : 'إدارة الملفات الشخصية وأرقام مسار لجميع الأقسام.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="إسم أو رقم مسار..."
              className="pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none w-64 shadow-inner text-sm font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all font-bold text-sm">
            <LucideIcons.FileUp size={18} /> استيراد أطفال
          </button>
          <button onClick={exportToExcel} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
            <LucideIcons.FileDown size={20} />
          </button>
        </div>
      </header>

      {pendingStudents && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-5xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-display">مراجعة بيانات الأطفال المستوردة</h3>
                <p className="text-sm text-slate-500">تحقق من الأسماء وصحتها قبل إضافتها للقاعدة الرسمية.</p>
              </div>
              <button onClick={() => setPendingStudents(null)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                <LucideIcons.X size={24} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="overflow-x-auto">
                 <table className="w-full text-right border-collapse">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                          <th className="p-4">الإسم الشخصي</th>
                          <th className="p-4">الإسم العائلي</th>
                          <th className="p-4">رقم مسار</th>
                          <th className="p-4">المستوى</th>
                          <th className="p-4">ولي الأمر</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                       {pendingStudents.map((s, idx) => (
                          <tr key={idx}>
                             <td className="p-3"><input type="text" value={s.firstName} onChange={(e) => updatePendingName(idx, 'firstName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none" /></td>
                             <td className="p-3"><input type="text" value={s.lastName} onChange={(e) => updatePendingName(idx, 'lastName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none" /></td>
                             <td className="p-3 text-xs font-bold text-slate-500">{s.massarNumber}</td>
                             <td className="p-3 text-xs font-bold text-indigo-600">{s.section}</td>
                             <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300">{s.parentName}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
            <footer className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
              <button onClick={() => setPendingStudents(null)} className="px-8 py-3 text-sm font-black text-slate-500 hover:text-slate-700 transition-colors">إلغاء</button>
              <button onClick={confirmImport} className="px-10 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-3">
                <LucideIcons.CheckCircle size={20} /> تأكيد إضافة {pendingStudents.length} طفل
              </button>
            </footer>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center px-2">
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
          {['all', ...Object.values(Section)].map((sec) => (
            <button key={sec} onClick={() => { setActiveSection(sec as any); setTeacherFilter('all'); }} className={`px-5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${activeSection === sec ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{sec === 'all' ? 'كل المستويات' : sec}</button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px]">
          <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-500" value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)}>
            <option value="all">تصفية حسب المعلمة (الكل)</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} - {t.classRoom}</option>)}
          </select>
        </div>
        {teacherFilter !== 'all' && (
          <button onClick={() => setTeacherFilter('all')} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><LucideIcons.X size={20} /></button>
        )}
      </div>

      {selectedTeacher && teacherFilter !== 'all' && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-6">
            <img src={selectedTeacher.avatar} className="w-20 h-20 rounded-[1.5rem] border-4 border-white/20 shadow-lg object-cover" alt="" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">المعلمة المسؤولة</p>
              <h3 className="text-2xl font-black font-display">{selectedTeacher.name}</h3>
              <div className="flex gap-4 mt-2">
                <span className="text-xs font-bold flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg"><LucideIcons.DoorOpen size={14} /> {selectedTeacher.classRoom}</span>
                <span className="text-xs font-bold flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg"><LucideIcons.Users size={14} /> {filteredStudents.length} طفل مسجل</span>
              </div>
            </div>
          </div>
          <button onClick={() => onNavigateToTeacher?.(selectedTeacher.name)} className="px-6 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs hover:bg-indigo-50 transition-all shadow-lg active:scale-95">الملف الشخصي</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredStudents.length > 0 ? filteredStudents.map((student) => (
          <div key={student.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-5 mb-5">
                <div className="relative">
                  <img src={student.avatar} className="w-16 h-16 rounded-[1.5rem] object-cover ring-4 ring-slate-50 dark:ring-slate-800 shadow-md group-hover:scale-105 transition-transform" alt="" />
                  <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${student.gender === 'male' ? 'bg-indigo-500' : 'bg-pink-500'}`}></div>
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-slate-900 dark:text-slate-100 truncate text-lg leading-tight">{student.firstName} {student.lastName}</h4>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{student.section}</span>
                    <span className="text-[9px] font-bold text-slate-400">مسار: {student.massarNumber}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[1.8rem] border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-slate-400 uppercase tracking-tighter">المعلمة</span>
                   <button onClick={() => onNavigateToTeacher?.(student.teacherName)} className="text-indigo-600 hover:underline">{student.teacherName}</button>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-slate-400 uppercase tracking-tighter">ولي الأمر</span>
                   <span className="text-slate-700 dark:text-slate-300">{student.parentName}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
              <a href={`https://wa.me/${student.parentPhone.replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 group/wa">
                 <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md group-hover/wa:scale-110 transition-transform"><LucideIcons.MessageCircle size={14} /></div>
                 <span className="text-[10px] font-black text-slate-500 group-hover/wa:text-emerald-600 transition-colors">{student.parentPhone}</span>
              </a>
              <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"><LucideIcons.ExternalLink size={16} /></button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center"><LucideIcons.Inbox size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-500 font-bold">لا يوجد أطفال مسجلون حالياً. استخدم زر الاستيراد لإضافة تلاميذ جدد.</p></div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
