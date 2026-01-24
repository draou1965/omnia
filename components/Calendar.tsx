
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Section } from '../types';

interface SchoolEvent {
  id: string;
  title: string;
  date: Date;
  type: 'pedagogical' | 'administrative' | 'holiday' | 'trip';
  description: string;
  target?: Section | 'all';
}

const MOCK_EVENTS: SchoolEvent[] = [
  {
    id: 'e1',
    title: 'اجتماع تربوي - قسم الحضانة',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
    type: 'pedagogical',
    description: 'مناقشة المناهج الجديدة والأنشطة الحسية للأطفال.',
    target: Section.TPS
  },
  {
    id: 'e2',
    title: 'رحلة إلى حديقة الحيوانات',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    type: 'trip',
    description: 'رحلة تعليمية ترفيهية للأطفال للتعرف على الحيوانات.',
    target: 'all'
  },
  {
    id: 'e3',
    title: 'عطلة ذكرى المسيرة الخضراء',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 6),
    type: 'holiday',
    description: 'عطلة رسمية وطنية.',
    target: 'all'
  },
  {
    id: 'e4',
    title: 'لقاء مع أولياء الأمور',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22),
    type: 'administrative',
    description: 'توزيع نتائج الدورة الأولى ومناقشة تطور الأطفال.',
    target: 'all'
  }
];

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const prevMonthEmptyDays = Array.from({ length: startDay }, (_, i) => i);

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const getEventTypeStyle = (type: SchoolEvent['type']) => {
    switch (type) {
      case 'pedagogical': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'trip': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'holiday': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'administrative': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEventTypeIcon = (type: SchoolEvent['type']) => {
    switch (type) {
      case 'pedagogical': return <LucideIcons.BookOpen size={14} />;
      case 'trip': return <LucideIcons.MapPin size={14} />;
      case 'holiday': return <LucideIcons.Flag size={14} />;
      case 'administrative': return <LucideIcons.ClipboardList size={14} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">الجدول الزمني</h2>
          <p className="text-slate-500">متابعة الأنشطة المدرسية والفعاليات القادمة.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
          <LucideIcons.Plus size={20} />
          إضافة فعالية
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 font-display">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(new Date(year, month - 1))}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
              >
                <LucideIcons.ChevronRight size={20} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              >
                اليوم
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(year, month + 1))}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
              >
                <LucideIcons.ChevronLeft size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {prevMonthEmptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-slate-50/50"></div>
            ))}
            {days.map(day => {
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              const dayEvents = MOCK_EVENTS.filter(e => e.date.getDate() === day && e.date.getMonth() === month);
              
              return (
                <div 
                  key={day} 
                  className={`aspect-square rounded-2xl border transition-all p-2 flex flex-col items-center justify-center relative group cursor-pointer ${
                    isToday ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-300'
                  }`}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                    {day}
                  </span>
                  
                  <div className="flex gap-1 mt-1">
                    {dayEvents.map((e, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${
                          isToday ? 'bg-white' : 
                          e.type === 'pedagogical' ? 'bg-indigo-400' : 
                          e.type === 'trip' ? 'bg-emerald-400' : 
                          'bg-rose-400'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <LucideIcons.CalendarClock className="text-indigo-600" />
              الفعاليات القادمة
            </h3>
            <div className="space-y-4">
              {MOCK_EVENTS.sort((a,b) => a.date.getTime() - b.date.getTime()).map(event => (
                <div key={event.id} className="flex gap-4 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
                  <div className={`shrink-0 w-12 h-12 rounded-xl border flex flex-col items-center justify-center ${getEventTypeStyle(event.type)}`}>
                    <span className="text-xs font-black">{event.date.getDate()}</span>
                    <span className="text-[8px] uppercase font-bold">{monthNames[event.date.getMonth()].substring(0, 3)}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-slate-800 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        {getEventTypeIcon(event.type)}
                        {event.type === 'pedagogical' ? 'تربوي' : event.type === 'trip' ? 'رحلة' : event.type === 'holiday' ? 'عطلة' : 'إداري'}
                      </span>
                      <span>•</span>
                      <span>{event.target === 'all' ? 'الكل' : event.target}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-50">
              مشاهدة الكل
            </button>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <LucideIcons.Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <LucideIcons.Info size={18} />
              نصيحة اليوم
            </h4>
            <p className="text-xs text-indigo-100 leading-relaxed italic">
              "البيئة المنظمة في الروضة هي المعلم الثالث للطفل. تأكد من تجديد ركن القراءة هذا الأسبوع."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
