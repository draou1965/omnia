
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TeacherList from './components/TeacherList';
import StudentList from './components/StudentList';
import AssessmentGrid from './components/AssessmentGrid';
import AIAssistant from './components/AIAssistant';
import Messaging from './components/Messaging';
import Calendar from './components/Calendar';
import Finance from './components/Finance';
import * as LucideIcons from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [filterByTeacherId, setFilterByTeacherId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleNavigateToTeacher = (name: string) => {
    setTeacherSearchQuery(name);
    setFilterByTeacherId(null);
    setActiveTab('teachers');
  };

  const handleNavigateToClass = (teacherId: string) => {
    setFilterByTeacherId(teacherId);
    setActiveTab('students');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'teachers': return (
        <TeacherList 
          initialSearch={teacherSearchQuery} 
          onSearchChange={setTeacherSearchQuery} 
          onViewClass={handleNavigateToClass}
        />
      );
      case 'students': return (
        <StudentList 
          initialTeacherFilter={filterByTeacherId} 
          onNavigateToTeacher={handleNavigateToTeacher} 
        />
      );
      case 'assessment-grid': return <AssessmentGrid />;
      case 'finance': return <Finance />;
      case 'messages': return <Messaging />;
      case 'ai-assistant': return <AIAssistant />;
      case 'calendar': return <Calendar />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 dark:text-slate-600 space-y-4">
          <LucideIcons.Construction size={64} className="animate-pulse" />
          <p className="text-xl font-medium font-display">هذه الخاصية قيد التطوير</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
          >
            العودة للوحة التحكم
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen font-display relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-slate-950" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8 overflow-y-auto max-h-screen relative z-10">
        <header className="flex justify-between items-center mb-12 glass-panel p-4 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 mr-4">
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">جمعية الأمنية للتعليم الأولي</span>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <span className="text-sm font-bold opacity-70">{new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
              title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDarkMode ? <LucideIcons.Sun size={20} /> : <LucideIcons.Moon size={20} />}
            </button>
            <button className="relative p-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100 shadow-sm">
              <LucideIcons.Bell size={20} />
              <span className="absolute top-3 left-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button className="p-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100 shadow-sm">
              <LucideIcons.Settings size={20} />
            </button>
          </div>
        </header>

        <div className="relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
