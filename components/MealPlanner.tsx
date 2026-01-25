
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'snack';
  title: string;
  description: string;
  calories?: number;
}

interface DayPlan {
  day: string;
  meals: Meal[];
}

const INITIAL_PLAN: DayPlan[] = [
  { day: 'الإثنين', meals: [
    { id: 'm1', type: 'breakfast', title: 'حليب وتمر', description: 'كوب حليب طازج مع 3 تمرات ونصف خبز قمح' },
    { id: 'm2', type: 'lunch', title: 'كسكس بالخضر', description: 'كسكس مغربي تقليدي مع خضر موسمية ودجاج' },
    { id: 'm3', type: 'snack', title: 'فواكه مشكلة', description: 'تفاح وموز مقطع' }
  ]},
  { day: 'الثلاثاء', meals: [
    { id: 'm4', type: 'breakfast', title: 'حريرة شعير', description: 'حساء بلبولة الشعير بزيت الزيتون' },
    { id: 'm5', type: 'lunch', title: 'طاجين خضر', description: 'طاجين اللحم مع الجلبانة والبطاطس' },
    { id: 'm6', type: 'snack', title: 'بسكويت منزلي', description: 'بسكويت الشوفان مع عصير برتقال' }
  ]},
  { day: 'الأربعاء', meals: [
    { id: 'm7', type: 'breakfast', title: 'جبن وعسل', description: 'خبز كامل مع جبن طري وعسل طبيعي' },
    { id: 'm8', type: 'lunch', title: 'أرز بالدجاج', description: 'أرز مفور مع قطع الدجاج والجزر' },
    { id: 'm9', type: 'snack', title: 'ياغورت طبيعي', description: 'ياغورت بدون سكر مع زبيب' }
  ]}
];

const MealPlanner: React.FC = () => {
  const [plans, setPlans] = useState<DayPlan[]>(INITIAL_PLAN);
  const [selectedDay, setSelectedDay] = useState(plans[0].day);

  const getMealIcon = (type: Meal['type']) => {
    switch (type) {
      case 'breakfast': return <LucideIcons.Sun className="text-amber-500" />;
      case 'lunch': return <LucideIcons.UtensilsCrossed className="text-indigo-600" />;
      case 'snack': return <LucideIcons.Coffee className="text-emerald-500" />;
    }
  };

  const getMealLabel = (type: Meal['type']) => {
    switch (type) {
      case 'breakfast': return 'الفطور (09:00)';
      case 'lunch': return 'الغداء (12:30)';
      case 'snack': return 'اللمجة (16:00)';
    }
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-rose-500 text-white rounded-3xl shadow-xl">
            <LucideIcons.Apple size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">التغذية والوجبات</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">البرنامج الغذائي الأسبوعي وتتبع جودة الوجبات المقدمة.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50">
             <LucideIcons.Printer size={18} /> طباعة القائمة
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700">
             <LucideIcons.Plus size={18} /> تعديل البرنامج
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">أيام الأسبوع</h3>
             <div className="space-y-2">
               {plans.map(p => (
                 <button 
                  key={p.day}
                  onClick={() => setSelectedDay(p.day)}
                  className={`w-full text-right px-6 py-4 rounded-2xl font-bold transition-all ${selectedDay === p.day ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                   {p.day}
                 </button>
               ))}
             </div>
           </div>

           <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30">
             <div className="flex items-center gap-3 text-rose-600 mb-4">
               <LucideIcons.AlertTriangle size={20} />
               <h4 className="font-black text-sm uppercase tracking-widest">تنبيه الحساسية</h4>
             </div>
             <p className="text-xs text-rose-500 font-bold leading-relaxed">
               هناك 12 طفلاً يعانون من حساسية الجلوتين و 5 أطفال من حساسية اللاكتوز. المرجو التأكد من توفر البدائل.
             </p>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {plans.find(p => p.day === selectedDay)?.meals.map((meal) => (
            <div key={meal.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
               <div className="p-8 flex items-start gap-8">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] group-hover:scale-110 transition-transform">
                    {getMealIcon(meal.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{getMealLabel(meal.type)}</span>
                      <button className="text-slate-400 hover:text-indigo-600"><LucideIcons.Edit2 size={16} /></button>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">{meal.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{meal.description}</p>
                    
                    <div className="flex gap-4 mt-6">
                      <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <LucideIcons.CheckCircle size={12} /> متوازن غذائياً
                      </div>
                      <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <LucideIcons.Flame size={12} /> 350 سعرة حرارية
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;
