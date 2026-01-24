
import React, { useState, useMemo, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { MOCK_TEACHERS } from '../constants';
import { Teacher } from '../types';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  note?: string;
  teacherId?: string;
}

const FINANCE_CATEGORIES = {
  income: ["رسوم التسجيل", "الواجبات الشهرية", "النقل المدرسي", "التأمين", "أنشطة موازية", "أخرى"],
  expense: ["رواتب الموظفين", "كراء المقر", "فواتير (ماء/كهرباء)", "أدوات تعليمية", "صيانة", "تغذية", "نظافة", "أخرى"]
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', title: 'رسوم تسجيل شهر أكتوبر', amount: 45000, type: 'income', category: 'رسوم التسجيل', date: new Date(Date.now() - 86400000 * 2) },
  { id: 'tr2', title: 'رواتب المربيات (دفع جزئي)', amount: 144000, type: 'expense', category: 'رواتب الموظفين', date: new Date(Date.now() - 86400000 * 1) },
  { id: 'tr3', title: 'فواتير الماء والكهرباء', amount: 3200, type: 'expense', category: 'فواتير (ماء/كهرباء)', date: new Date() },
  { id: 'tr4', title: 'مستلزمات أنشطة تربوية', amount: 8500, type: 'expense', category: 'أدوات تعليمية', date: new Date() },
  { id: 'tr5', title: 'واجبات النقل المدرسي', amount: 12000, type: 'income', category: 'النقل المدرسي', date: new Date(Date.now() - 86400000 * 5) },
];

const chartData = [
  { name: 'السبت', income: 14000, expense: 2400 },
  { name: 'الأحد', income: 3000, expense: 1398 },
  { name: 'الاثنين', income: 20000, expense: 9800 },
  { name: 'الثلاثاء', income: 12780, expense: 13908 },
  { name: 'الأربعاء', income: 18900, expense: 4800 },
  { name: 'الخميس', income: 23900, expense: 3800 },
  { name: 'الجمعة', income: 34900, expense: 4300 },
];

const Finance: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'salaries'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showModal, setShowModal] = useState(false);
  const [salarySearch, setSalarySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'income',
    date: new Date(),
    category: FINANCE_CATEGORIES.income[0]
  });

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => 
    filterType === 'all' || t.type === filterType
  ).sort((a, b) => b.date.getTime() - a.date.getTime());

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(salarySearch.toLowerCase())
  );

  const handleAddTransaction = () => {
    if (!newTx.title || !newTx.amount) return;
    
    const transaction: Transaction = {
      id: `tr-${Date.now()}`,
      title: newTx.title,
      amount: Number(newTx.amount),
      type: newTx.type as 'income' | 'expense',
      category: newTx.category || 'أخرى',
      date: new Date(newTx.date || Date.now()),
      note: newTx.note,
      teacherId: newTx.teacherId
    };

    setTransactions([transaction, ...transactions]);
    
    // إذا كانت دفعة راتب، نقوم بتحديث حالة المعلمة
    if (newTx.teacherId) {
      setTeachers(prev => prev.map(t => 
        t.id === newTx.teacherId 
          ? { ...t, paidAmount: t.paidAmount + Number(newTx.amount) }
          : t
      ));
    }

    setShowModal(false);
    setNewTx({ type: 'income', date: new Date(), category: FINANCE_CATEGORIES.income[0] });
  };

  const handleQuickPay = (teacher: Teacher) => {
    const remaining = teacher.monthlySalary - teacher.paidAmount;
    if (remaining <= 0) return;

    setNewTx({
      type: 'expense',
      title: `راتب شهر ${new Date().toLocaleString('ar-MA', { month: 'long' })} - ${teacher.name}`,
      amount: remaining,
      category: 'رواتب الموظفين',
      teacherId: teacher.id,
      date: new Date()
    });
    setShowModal(true);
  };

  const exportSalariesToExcel = () => {
    const data = teachers.map(t => ({
      'المعلمة': t.name,
      'القسم': t.section,
      'الراتب الشهري': t.monthlySalary,
      'المبلغ المحصل': t.paidAmount,
      'الباقي': t.monthlySalary - t.paidAmount,
      'الحالة': t.paidAmount >= t.monthlySalary ? 'مكتمل' : t.paidAmount > 0 ? 'جزئي' : 'لم يدفع'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "رواتب المعلمات");
    XLSX.writeFile(wb, `وضعية_الرواتب_${new Date().toLocaleDateString('ar-MA')}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">التسيير المالي</h2>
          <p className="text-slate-500 dark:text-slate-400">مراقبة دقيقة للتدفقات ورواتب 48 معلمة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveSubTab('overview')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeSubTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
          >
            نظرة عامة
          </button>
          <button 
            onClick={() => setActiveSubTab('salaries')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeSubTab === 'salaries' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
          >
            وضعية الرواتب
          </button>
        </div>
      </header>

      {activeSubTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <LucideIcons.TrendingUp size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المداخيل</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 font-display">{stats.income.toLocaleString()} <span className="text-xs font-bold text-slate-400">د.م</span></p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <LucideIcons.TrendingDown size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المصاريف</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 font-display">{stats.expense.toLocaleString()} <span className="text-xs font-bold text-slate-400">د.م</span></p>
            </div>

            <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group">
              <LucideIcons.ShieldCheck size={120} className="absolute -bottom-8 -left-8 text-white/10 rotate-12" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/20 text-white rounded-2xl">
                  <LucideIcons.Wallet size={24} />
                </div>
                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">الرصيد الصافي</span>
              </div>
              <p className="text-3xl font-black text-white font-display relative z-10">{stats.balance.toLocaleString()} <span className="text-xs font-bold text-indigo-200">د.م</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <LucideIcons.BarChart3 className="text-indigo-600" size={20} />
                  تحليل التدفقات الأسبوعية
                </h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px', fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} orientation="right" style={{ fontSize: '12px', fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#incGrad)" name="مداخيل" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#expGrad)" name="مصاريف" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <LucideIcons.Activity className="text-indigo-600" size={20} />
                توزيع المصاريف
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'رواتب المعلمات', amount: teachers.reduce((acc, t) => acc + t.paidAmount, 0), percentage: 65, color: 'bg-indigo-500' },
                  { label: 'كراء وفواتير', amount: 32000, percentage: 15, color: 'bg-amber-500' },
                  { label: 'أدوات تعليمية', amount: 8500, percentage: 8, color: 'bg-emerald-500' },
                ].map((cat) => (
                  <div key={cat.label} className="group cursor-default">
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.label}</span>
                        <span className="text-[10px] text-slate-400">{cat.amount.toLocaleString()} د.م</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">{cat.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: `${cat.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <LucideIcons.Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 font-display">رواتب الهيئة التدريسية</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">تتبع الأجر المحصل والباقي لـ 48 معلمة</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="بحث عن معلمة..."
                  className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs outline-none w-48 focus:ring-2 focus:ring-indigo-500"
                  value={salarySearch}
                  onChange={(e) => setSalarySearch(e.target.value)}
                />
              </div>
              <button 
                onClick={exportSalariesToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-all"
              >
                <LucideIcons.FileDown size={16} />
                تصدير
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">المعلمة</th>
                  <th className="px-6 py-4">الراتب المتفق عليه</th>
                  <th className="px-6 py-4">الأجرة المحصلة</th>
                  <th className="px-6 py-4">الباقي من الأجر</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredTeachers.map((teacher) => {
                  const remaining = teacher.monthlySalary - teacher.paidAmount;
                  const isPaid = remaining <= 0;
                  const isPartial = teacher.paidAmount > 0 && remaining > 0;
                  
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={teacher.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{teacher.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{teacher.section}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{teacher.monthlySalary.toLocaleString()} د.م</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{teacher.paidAmount.toLocaleString()} د.م</td>
                      <td className={`px-6 py-4 font-black ${remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                        {remaining.toLocaleString()} د.م
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black ${
                          isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          isPartial ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {isPaid ? 'مكتمل' : isPartial ? 'جزئي' : 'غير مدفوع'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!isPaid && (
                          <button 
                            onClick={() => handleQuickPay(teacher)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            title="تسجيل دفعة"
                          >
                            <LucideIcons.BadgeDollarSign size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* سجل العمليات العام */}
      {activeSubTab === 'overview' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 font-display">آخر العمليات المالية</h3>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === t ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t === 'all' ? 'الكل' : t === 'income' ? 'مداخيل' : 'مصاريف'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">العملية / التصنيف</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredTransactions.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tr.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {tr.type === 'income' ? <LucideIcons.ArrowDownLeft size={16} /> : <LucideIcons.ArrowUpRight size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{tr.title}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{tr.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{tr.date.toLocaleDateString('ar-MA')}</td>
                    <td className={`px-6 py-4 font-black text-sm text-left ${tr.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tr.type === 'income' ? '+' : '-'}{tr.amount.toLocaleString()} د.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* مودال إضافة عملية مالية */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">تسجيل عملية مالية</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <LucideIcons.X size={20} />
              </button>
            </header>
            
            <div className="p-6 space-y-5">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button 
                  onClick={() => setNewTx({ ...newTx, type: 'income', category: FINANCE_CATEGORIES.income[0], teacherId: undefined })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${newTx.type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  مدخول
                </button>
                <button 
                  onClick={() => setNewTx({ ...newTx, type: 'expense', category: FINANCE_CATEGORIES.expense[0] })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${newTx.type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-500'}`}
                >
                  مصروف
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">العنوان</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                  value={newTx.title || ''}
                  onChange={(e) => setNewTx({ ...newTx, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">المبلغ (د.م)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 font-bold"
                    value={newTx.amount || ''}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">التصنيف</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  >
                    {FINANCE_CATEGORIES[newTx.type as 'income' | 'expense'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500">إلغاء</button>
              <button 
                onClick={handleAddTransaction}
                disabled={!newTx.title || !newTx.amount}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                حفظ العملية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
