
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface Bus {
  id: string;
  number: string;
  driverName: string;
  driverPhone: string;
  route: string;
  capacity: number;
  occupied: number;
  status: 'on_route' | 'parked' | 'maintenance';
}

const MOCK_BUSES: Bus[] = [
  { id: 'b1', number: 'حافلة 01', driverName: 'عمر القاسمي', driverPhone: '06 55 44 33 22', route: 'حي الأمل - حي السلام', capacity: 30, occupied: 28, status: 'on_route' },
  { id: 'b2', number: 'حافلة 02', driverName: 'رشيد العلمي', driverPhone: '06 11 22 33 44', route: 'وسط المدينة - حي النهضة', capacity: 30, occupied: 15, status: 'parked' },
  { id: 'b3', number: 'حافلة 03', driverName: 'كريم التازي', driverPhone: '06 99 88 77 66', route: 'الحي الجامعي - القدس', capacity: 25, occupied: 25, status: 'on_route' },
  { id: 'b4', number: 'حافلة 04', driverName: 'إدريس فوزي', driverPhone: '06 00 11 22 33', route: 'المنطقة الصناعية - تيكوين', capacity: 30, occupied: 10, status: 'maintenance' },
];

const Transport: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [search, setSearch] = useState('');

  const getStatusConfig = (status: Bus['status']) => {
    switch (status) {
      case 'on_route': return { label: 'في الطريق', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' };
      case 'parked': return { label: 'متوقفة', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' };
      case 'maintenance': return { label: 'صيانة', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' };
    }
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl">
            <LucideIcons.Bus size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">إدارة النقل المدرسي</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">متابعة 12 حافلة مدرسية وتوزيع الأطفال على المسارات.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
             <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="بحث عن حافلة أو سائق..."
               className="pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none w-64 shadow-inner text-sm font-bold"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
             <LucideIcons.Plus size={18} /> إضافة حافلة
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {buses.map(bus => {
           const status = getStatusConfig(bus.status);
           const fillPercentage = (bus.occupied / bus.capacity) * 100;
           return (
             <div key={bus.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
               <div className="p-6">
                 <div className="flex justify-between items-start mb-6">
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                     {status.label}
                   </div>
                   <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <LucideIcons.MapPin size={20} />
                   </div>
                 </div>

                 <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">{bus.number}</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 flex items-center gap-1">
                   <LucideIcons.Navigation size={12} />
                   {bus.route}
                 </p>

                 <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                       <LucideIcons.User size={20} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السائق</p>
                       <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{bus.driverName}</p>
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مستوى الامتلاء</span>
                       <span className="text-xs font-black text-slate-900 dark:text-slate-100">{bus.occupied}/{bus.capacity}</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${fillPercentage > 90 ? 'bg-rose-500' : fillPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                         style={{ width: `${fillPercentage}%` }}
                       ></div>
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mt-8">
                    <a 
                      href={`tel:${bus.driverPhone}`}
                      className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      <LucideIcons.Phone size={14} /> اتصــال
                    </a>
                    <a 
                      href={`https://wa.me/212${bus.driverPhone.replace(/\s/g, '').substring(1)}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <LucideIcons.MessageSquare size={14} /> واتساب
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

export default Transport;
