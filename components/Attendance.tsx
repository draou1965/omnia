
import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { MOCK_TEACHERS } from '../constants';
import { Teacher } from '../types';
import * as XLSX from 'xlsx';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceRecord {
  teacherId: string;
  status: AttendanceStatus;
  note?: string;
  time?: string;
}

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
  const [teachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('ecogestion_teachers_list');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });

  // تحميل السجلات من localStorage حسب التاريخ المختار
  useEffect(() => {
    const saved = localStorage.getItem(`attendance_${selectedDate}`);
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      // افتراض الحضور للجميع إذا لم يكن هناك سجل سابق
      const initial: Record<string, AttendanceRecord> = {};
      teachers.forEach(t => {
        initial[t.id] = { teacherId: t.id, status: 'present' };
      });
      setRecords(initial);
    }
  }, [selectedDate, teachers]);

  const saveAttendance = () => {
    localStorage.setItem(`attendance_${selectedDate}`, JSON.stringify(records));
    // تحديث الحالة في لوحة التحكم (محاكاة)
    // Fix: Cast Object.values result to AttendanceRecord[] to fix property 'status' does not exist on type 'unknown' error
    const presentCount = (Object.values(records) as AttendanceRecord[]).filter(r => r.status === 'present' || r.status === 'late').length;
    localStorage.setItem('today_present_teachers', presentCount.toString());
    alert('تم حفظ سجل الحضور بنجاح');
  };

  const updateStatus = (teacherId: string, status: AttendanceStatus) => {
    setRecords(prev => ({
      ...prev,
      // Ensuring spreading an object matches the interface even if previous record was undefined
      [teacherId]: { ...(prev[teacherId] || { teacherId, status: 'present' }), status }
    }));
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.classRoom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = useMemo(() => {
    // Fix: Cast Object.values result to AttendanceRecord[] to fix property 'status' does not exist on type 'unknown' error
    const vals = Object.values(records) as AttendanceRecord[];
    return {
      present: vals.filter(v => v.status === 'present').length,
      absent: vals.filter(v => v.status === 'absent').length,
      late: vals.filter(v => v.status === 'late').length,
    };
  }, [records]);

  const exportDailyReport = () => {
    const data = teachers.map(t => ({
      'المعلمة': t.name,
      'القسم': t.section,
      'القاعة': t.classRoom,
      'الحالة': records[t.id]?.status === 'present' ? 'حاضرة' : records[t.id]?.status === 'absent' ? 'غائبة' : 'متأخرة',
      'ملاحظات': records[t.id]?.note || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "حضور اليوم");
    XLSX.writeFile(wb, `تقرير_الحضور_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500 text-white rounded-3xl shadow-xl">
            <LucideIcons.UserCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">سجل الحضور اليومي</h2>
            <div className="flex items-center gap-2 mt-1">
               <input 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-transparent border-none text-indigo-600 font-black focus:ring-0 outline-none p-0 cursor-pointer"
               />
               <LucideIcons.Calendar size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={saveAttendance}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
          >
            <LucideIcons.Save size={18} /> حفظ السجل
          </button>
          <button 
            onClick={exportDailyReport}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <LucideIcons.FileDown size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">حاضرة</p>
              <p className="text-3xl font-black text-emerald-600">{stats.present}</p>
           </div>
           <LucideIcons.CheckCircle className="text-emerald-100 dark:text-emerald-900/20" size={48} />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500"></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">غائبة</p>
              <p className="text-3xl font-black text-rose-600">{stats.absent}</p>
           </div>
           <LucideIcons.XCircle className="text-rose-100 dark:text-rose-900/20" size={48} />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500"></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">متأخرة</p>
              <p className="text-3xl font-black text-amber-600">{stats.late}</p>
           </div>
           <LucideIcons.Clock className="text-amber-100 dark:text-amber-900/20" size={48} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative">
             <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="بحث بالاسم أو القاعة..."
               className="pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none w-64 focus:ring-2 focus:ring-indigo-500"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex gap-4">
             <button onClick={() => {
               const updated = {...records};
               teachers.forEach(t => updated[t.id] = {teacherId: t.id, status: 'present'});
               setRecords(updated);
             }} className="text-xs font-black text-indigo-600 hover:underline">تأشير الجميع كحاضر</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-widest">
                <th className="px-8 py-4">المعلمة / القسم</th>
                <th className="px-8 py-4">القاعة</th>
                <th className="px-8 py-4 text-center">حالة الحضور اليوم</th>
                <th className="px-8 py-4">ملاحظة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredTeachers.map((teacher) => {
                const record = records[teacher.id];
                const status = record?.status || 'present';
                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <img src={teacher.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-slate-100">{teacher.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{teacher.section}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{teacher.classRoom}</td>
                    <td className="px-8 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => updateStatus(teacher.id, 'present')}
                          className={`p-2.5 rounded-xl transition-all ${status === 'present' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                        >
                          <LucideIcons.Check size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(teacher.id, 'late')}
                          className={`p-2.5 rounded-xl transition-all ${status === 'late' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
                        >
                          <LucideIcons.Clock size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(teacher.id, 'absent')}
                          className={`p-2.5 rounded-xl transition-all ${status === 'absent' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}
                        >
                          <LucideIcons.X size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <input 
                        type="text" 
                        placeholder="..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                        value={record?.note || ''}
                        onChange={(e) => setRecords(prev => ({
                          ...prev,
                          [teacher.id]: { ...(prev[teacher.id] || { teacherId: teacher.id, status: 'present' }), note: e.target.value }
                        }))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
