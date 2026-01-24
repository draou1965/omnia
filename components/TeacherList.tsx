
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MOCK_TEACHERS } from '../constants';
import * as LucideIcons from 'lucide-react';
import { Teacher, Section } from '../types';
import * as XLSX from 'xlsx';

interface TeacherListProps {
  initialSearch?: string;
  onSearchChange?: (val: string) => void;
  onViewClass?: (teacherId: string) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ initialSearch = '', onSearchChange, onViewClass }) => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState(initialSearch);
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('ecogestion_teachers_list');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedProfileTeacher, setSelectedProfileTeacher] = useState<Teacher | null>(null);
  const [showConfirmAction, setShowConfirmAction] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    section: Section.TPS,
    classRoom: '',
    email: '',
    phone: '',
    monthlySalary: 3000,
    avatar: '',
    status: 'present'
  });

  const [pendingTeachers, setPendingTeachers] = useState<Teacher[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('ecogestion_teachers_list', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const filteredTeachers = teachers.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.classRoom.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleExportTeachers = () => {
    const dataToExport = teachers.map(t => ({
      'الإسم الكامل': t.name,
      'القسم': t.section,
      'القاعة': t.classRoom,
      'الهاتف': t.phone,
      'البريد الإلكتروني': t.email,
      'الراتب الشهري': t.monthlySalary,
      'عدد الأطفال': t.studentsCount,
      'الحالة': t.status === 'present' ? 'حاضرة' : t.status === 'absent' ? 'غائبة' : 'تكوين'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "طاقم المعلمات");
    XLSX.writeFile(workbook, `قائمة_المعلمات_${new Date().toLocaleDateString('ar-MA')}.xlsx`);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      section: Section.TPS,
      classRoom: '',
      email: '',
      phone: '',
      monthlySalary: 3000,
      avatar: '',
      status: 'present'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ ...teacher });
    setIsModalOpen(true);
  };

  const handleSaveTeacher = () => {
    setShowConfirmAction(true);
  };

  const confirmSave = () => {
    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...formData } as Teacher : t));
    } else {
      const newTeacher: Teacher = {
        ...formData,
        id: `t-${Date.now()}`,
        studentsCount: 0,
        paidAmount: 0,
        avatar: formData.avatar || `https://picsum.photos/seed/${Date.now()}/100/100`
      } as Teacher;
      setTeachers(prev => [newTeacher, ...prev]);
    }
    setIsModalOpen(false);
    setShowConfirmAction(false);
  };

  const handleDeleteTeacher = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف ملف هذه المعلمة؟')) {
      setTeachers(prev => prev.filter(t => t.id !== id));
    }
  };

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

      const imported: Teacher[] = data.map((row, index) => {
        const sectionStr = row['القسم'] || row['المستوى'] || '';
        let section: Section = Section.TPS;
        if (sectionStr.includes('أصغر')) section = Section.PS;
        else if (sectionStr.includes('أوسط')) section = Section.MS;
        else if (sectionStr.includes('أكبر')) section = Section.GS;

        return {
          id: `t-imp-${Date.now()}-${index}`,
          name: row['الإسم الكامل'] || row['Nom complet'] || 'معلمة جديدة',
          section: section,
          classRoom: row['القاعة'] || row['Salle'] || 'غير محددة',
          email: row['الإيميل'] || '',
          phone: row['الهاتف'] || '0600000000',
          studentsCount: 0,
          avatar: `https://picsum.photos/seed/teacher-${index + Date.now()}/100/100`,
          status: 'present',
          monthlySalary: Number(row['الراتب']) || 3000,
          paidAmount: 0
        };
      });

      setPendingTeachers(imported);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const getStatusConfig = (status: Teacher['status']) => {
    switch (status) {
      case 'present': return { label: 'حاضرة', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' };
      case 'absent': return { label: 'غائبة', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', dot: 'bg-rose-500' };
      case 'formation': return { label: 'تكوين', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' };
    }
  };

  const getSectionBadge = (section: Section) => {
    const colors: Record<Section, string> = {
      [Section.TPS]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      [Section.PS]: 'bg-amber-50 text-amber-600 border-amber-100',
      [Section.MS]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      [Section.GS]: 'bg-pink-50 text-pink-600 border-pink-100',
    };
    return colors[section] || 'bg-slate-50 text-slate-600';
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">الهيئة التدريسية ({teachers.length})</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">إدارة ومتابعة طاقم المربيات والمعلمات.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <LucideIcons.Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="البحث بالاسم أو القاعة..."
              className="pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-inner transition-all text-sm font-bold"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md transition-all"
          >
            <LucideIcons.Plus size={18} />
            إضافة معلمة
          </button>

          <button 
            onClick={handleExportTeachers}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <LucideIcons.FileDown size={18} />
            تصدير Excel
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 shadow-md transition-all"
          >
            <LucideIcons.FileUp size={18} />
            استيراد
          </button>
        </div>
      </header>

      {/* مودال الملف الشخصي */}
      {selectedProfileTeacher && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[120] flex items-center justify-center p-6" onClick={() => setSelectedProfileTeacher(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="h-40 bg-indigo-600 relative">
               <button onClick={() => setSelectedProfileTeacher(null)} className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl transition-all">
                 <LucideIcons.X size={20} />
               </button>
               <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                 <img src={selectedProfileTeacher.avatar} className="w-32 h-32 rounded-[2rem] border-8 border-white dark:border-slate-900 shadow-2xl object-cover" alt="" />
               </div>
            </div>
            <div className="pt-20 pb-10 px-10 text-center">
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">{selectedProfileTeacher.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getSectionBadge(selectedProfileTeacher.section)}`}>
                  {selectedProfileTeacher.section}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusConfig(selectedProfileTeacher.status).bg}`}>
                  {getStatusConfig(selectedProfileTeacher.status).label}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-right">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">القاعة الدراسية</p>
                  <p className="text-lg font-black text-indigo-600">{selectedProfileTeacher.classRoom}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">عدد الأطفال</p>
                  <p className="text-lg font-black text-indigo-600">{selectedProfileTeacher.studentsCount} طفل</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button onClick={() => { onViewClass?.(selectedProfileTeacher.id); setSelectedProfileTeacher(null); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95">
                   عرض لائحة القسم
                 </button>
                 <a href={`tel:${selectedProfileTeacher.phone}`} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                   <LucideIcons.Phone size={24} />
                 </a>
                 <a href={`mailto:${selectedProfileTeacher.email}`} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                   <LucideIcons.Mail size={24} />
                 </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال الإضافة والتعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                  <LucideIcons.UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
                    {editingTeacher ? 'تعديل بيانات المعلمة' : 'تسجيل معلمة جديدة'}
                  </h3>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                <LucideIcons.X size={24} />
              </button>
            </header>

            <div className="p-10 overflow-y-auto max-h-[70vh] space-y-8">
              <div className="flex flex-col items-center">
                 <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                   <div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                     {formData.avatar ? (
                       <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
                     ) : (
                       <LucideIcons.Camera size={32} className="text-slate-300" />
                     )}
                   </div>
                   <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الإسم الكامل</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">القسم الدراسي</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value as Section})}
                  >
                    {Object.values(Section).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم الحجرة</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                    value={formData.classRoom}
                    onChange={(e) => setFormData({...formData, classRoom: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الهاتف</label>
                  <input 
                    type="tel" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <footer className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-500">إلغاء</button>
              <button 
                onClick={handleSaveTeacher}
                disabled={!formData.name}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {editingTeacher ? 'تأكيد التعديلات' : 'تسجيل المعلمة'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* مودال التأكيد */}
      {showConfirmAction && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideIcons.Check size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">تأكيد الحفظ</h3>
              <p className="text-sm text-slate-500 mb-8">هل تريد حفظ بيانات المعلمة في قاعدة البيانات؟</p>
              <div className="flex gap-3">
                 <button onClick={() => setShowConfirmAction(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-bold">تراجع</button>
                 <button onClick={confirmSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">نعم، حفظ</button>
              </div>
           </div>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
        {['all', 'present', 'absent', 'formation'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border-2 ${
              filter === f 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
            }`}
          >
            {f === 'all' ? 'الكل' : f === 'present' ? 'حاضرة' : f === 'absent' ? 'غائبة' : 'تكوين'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredTeachers.map((teacher) => {
          const status = getStatusConfig(teacher.status);
          return (
            <div key={teacher.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
              <div className="h-20 bg-slate-50 dark:bg-slate-800/50 p-4 relative">
                <div className="absolute top-4 left-4">
                   <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.bg}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}></div>
                      {status.label}
                   </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => handleOpenEditModal(teacher)}
                     className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm"
                   >
                     <LucideIcons.Edit3 size={14} />
                   </button>
                   <button 
                     onClick={() => handleDeleteTeacher(teacher.id)}
                     className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-500 rounded-lg shadow-sm"
                   >
                     <LucideIcons.Trash2 size={14} />
                   </button>
                </div>
              </div>
              
              <div className="p-6 pt-0 -mt-10 relative flex flex-col items-center">
                <div className="relative">
                   <img src={teacher.avatar} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg" alt={teacher.name} />
                </div>

                <div className="text-center mt-4 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg leading-tight">{teacher.name}</h4>
                    <button 
                      onClick={() => setSelectedProfileTeacher(teacher)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      title="عرض الملف الشخصي"
                    >
                      <LucideIcons.Info size={16} />
                    </button>
                  </div>
                  <div className={`mt-2 px-3 py-1 rounded-full text-[9px] font-bold border inline-block ${getSectionBadge(teacher.section)}`}>
                    {teacher.section}
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 mb-6 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">الحجرة</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{teacher.classRoom}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">الأطفال</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{teacher.studentsCount} طفل</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full">
                  <button 
                    onClick={() => onViewClass?.(teacher.id)}
                    className="flex-1 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all active:scale-95"
                  >
                    عرض القسم
                  </button>
                  <a 
                    href={`https://wa.me/212${teacher.phone.replace(/\s/g, '').substring(1)}`} 
                    target="_blank" 
                    className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <LucideIcons.MessageCircle size={18} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherList;
