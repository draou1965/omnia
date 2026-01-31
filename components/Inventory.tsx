
import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as XLSX from 'xlsx';

interface InventoryItem {
  id: string;
  name: string;
  category: 'stationery' | 'cleaning' | 'toys' | 'other';
  currentStock: number;
  minThreshold: number;
  unit: string;
  lastUpdated: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv1', name: 'أقلام تلوين خشبية (علبة)', category: 'stationery', currentStock: 45, minThreshold: 20, unit: 'علبة', lastUpdated: '2024-03-01' },
  { id: 'inv2', name: 'ورق رسم A4 (رزمة)', category: 'stationery', currentStock: 8, minThreshold: 10, unit: 'رزمة', lastUpdated: '2024-03-05' },
  { id: 'inv3', name: 'صابون سائل للأطفال (5L)', category: 'cleaning', currentStock: 15, minThreshold: 5, unit: 'قارورة', lastUpdated: '2024-03-10' },
  { id: 'inv4', name: 'عجين اللعب (صلصال)', category: 'toys', currentStock: 60, minThreshold: 15, unit: 'وحدة', lastUpdated: '2024-03-12' },
  { id: 'inv5', name: 'مناديل ورقية (عبوة)', category: 'cleaning', currentStock: 4, minThreshold: 12, unit: 'عبوة', lastUpdated: '2024-03-14' },
];

const CATEGORY_LABELS = {
  stationery: 'أدوات مدرسية',
  cleaning: 'مواد تنظيف',
  toys: 'ألعاب تربوية',
  other: 'أخرى'
};

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      lowStock: items.filter(i => i.currentStock <= i.minThreshold).length,
      categories: Object.keys(CATEGORY_LABELS).length
    };
  }, [items]);

  const handleUpdateStock = (id: string, delta: number) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, currentStock: Math.max(0, item.currentStock + delta), lastUpdated: new Date().toISOString().split('T')[0] } 
        : item
    ));
  };

  const exportInventory = () => {
    const data = items.map(i => ({
      'المادة': i.name,
      'الفئة': CATEGORY_LABELS[i.category],
      'المخزون الحالي': i.currentStock,
      'الحد الأدنى': i.minThreshold,
      'الوحدة': i.unit,
      'آخر تحديث': i.lastUpdated,
      'الحالة': i.currentStock <= i.minThreshold ? 'منخفض' : 'متوفر'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "جرد المخزون");
    XLSX.writeFile(wb, `جرد_مخزون_الروضة_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl">
            <LucideIcons.Package size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">المخزون واللوازم</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">تتبع استهلاك الأدوات والمواد بذكاء لـ 48 قاعة درس.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={exportInventory} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <LucideIcons.FileDown size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
            <LucideIcons.Plus size={18} /> إضافة مادة
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500"></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المواد</p>
              <p className="text-3xl font-black text-indigo-600">{stats.total}</p>
           </div>
           <LucideIcons.Box className="text-indigo-100 dark:text-indigo-900/20" size={48} />
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500"></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">مواد قاربت على النفاذ</p>
              <p className="text-3xl font-black text-rose-600">{stats.lowStock}</p>
           </div>
           <LucideIcons.AlertTriangle className="text-rose-100 dark:text-rose-900/20" size={48} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">طلبات الشراء المعلقة</p>
              <p className="text-3xl font-black text-emerald-600">3</p>
           </div>
           <LucideIcons.ShoppingCart className="text-emerald-100 dark:text-emerald-900/20" size={48} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center px-2">
        <button 
          onClick={() => setActiveCategory('all')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800'}`}
        >
          الكل
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button 
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800'}`}
          >
            {label}
          </button>
        ))}
        
        <div className="flex-1 min-w-[200px] relative mr-auto">
          <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="بحث عن مادة..."
            className="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => {
          const isLow = item.currentStock <= item.minThreshold;
          const percentage = Math.min(100, (item.currentStock / (item.minThreshold * 2)) * 100);
          
          return (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${isLow ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'}`}>
                    {item.category === 'stationery' && <LucideIcons.Pencil size={24} />}
                    {item.category === 'cleaning' && <LucideIcons.Waves size={24} />}
                    {item.category === 'toys' && <LucideIcons.Gamepad2 size={24} />}
                    {item.category === 'other' && <LucideIcons.Package size={24} />}
                  </div>
                  {isLow && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg animate-pulse">
                      <LucideIcons.AlertTriangle size={12} />
                      نقص في المخزون
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">{item.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">{CATEGORY_LABELS[item.category]}</p>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المستوى الحالي</span>
                       <span className={`text-sm font-black ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                         {item.currentStock} {item.unit}
                       </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                         style={{ width: `${percentage}%` }}
                       ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleUpdateStock(item.id, -1)}
                          className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-500 rounded-xl shadow-sm transition-all"
                        >
                          <LucideIcons.Minus size={16} />
                        </button>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">تعديل سريع</span>
                        <button 
                          onClick={() => handleUpdateStock(item.id, 1)}
                          className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-emerald-500 rounded-xl shadow-sm transition-all"
                        >
                          <LucideIcons.Plus size={16} />
                        </button>
                     </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <span>آخر تحديث: {item.lastUpdated}</span>
                  <button className="text-indigo-600 hover:underline">عرض السجل</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;
