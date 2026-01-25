
import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { MOCK_TEACHERS } from '../constants';
import { Section } from '../types';
import { generatePedagogicalResponse } from '../services/geminiService';

interface JournalPost {
  id: string;
  teacherName: string;
  teacherAvatar: string;
  className: string;
  section: Section;
  content: string;
  image: string;
  timestamp: string;
  likes: number;
  tags: string[];
  skills: string[];
}

const MOCK_POSTS: JournalPost[] = [
  {
    id: 'p1',
    teacherName: 'مريم المنصوري',
    teacherAvatar: MOCK_TEACHERS[0].avatar,
    className: 'القاعة A1',
    section: Section.PS,
    content: 'اليوم قمنا بنشاط الرسم بالأصابع. الأطفال استمتعوا جداً باستكشاف الألوان والملامح وتفريغ طاقاتهم الإبداعية.',
    image: 'https://picsum.photos/seed/kids1/800/600',
    timestamp: 'منذ ساعتين',
    likes: 12,
    tags: ['فنون', 'رسم'],
    skills: ['التآزر البصري الحركي', 'الخيال']
  },
  {
    id: 'p2',
    teacherName: 'سارة العلمي',
    teacherAvatar: MOCK_TEACHERS[1].avatar,
    className: 'القاعة B2',
    section: Section.MS,
    content: 'حصة الحكاية اليوم كانت حول "القنفذ والسلحفاة". الأطفال شاركوا بحماس في تمثيل الأدوار وفهم قيمة الصبر.',
    image: 'https://picsum.photos/seed/kids2/800/600',
    timestamp: 'منذ 4 ساعات',
    likes: 24,
    tags: ['حكاية', 'تمثيل'],
    skills: ['التعبير الشفهي', 'القيم']
  },
  {
    id: 'p3',
    teacherName: 'فاطمة بناني',
    teacherAvatar: MOCK_TEACHERS[2].avatar,
    className: 'القاعة C1',
    section: Section.GS,
    content: 'تمارين الحساب الذهني باستخدام المكعبات الملونة. تقدم ملحوظ في سرعة البديهة والتعرف على الأرقام الكبيرة.',
    image: 'https://picsum.photos/seed/kids3/800/600',
    timestamp: 'صباح اليوم',
    likes: 8,
    tags: ['رياضيات', 'ذكاء'],
    skills: ['المنطق الرياضي', 'التركيز']
  }
];

const SchoolJournal: React.FC = () => {
  const [posts, setPosts] = useState<JournalPost[]>(MOCK_POSTS);
  const [activeFilter, setActiveFilter] = useState<Section | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newPost, setNewPost] = useState({
    teacherId: MOCK_TEACHERS[0].id,
    content: '',
    section: Section.PS,
    image: null as string | null
  });

  const filteredPosts = useMemo(() => {
    return activeFilter === 'all' 
      ? posts 
      : posts.filter(p => p.section === activeFilter);
  }, [posts, activeFilter]);

  const handleGenerateCaption = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const prompt = `اكتب وصفاً تربوياً قصيراً وجذاباً لنشاط مدرسي في الروضة لمستوى ${newPost.section}. النشاط هو: ${newPost.content || "نشاط فني وموسيقي"}. اجعل الأسلوب ملهماً للأهالي.`;
    const response = await generatePedagogicalResponse(prompt);
    setNewPost(prev => ({ ...prev, content: response }));
    setIsGenerating(false);
  };

  const handleAddPost = () => {
    const teacher = MOCK_TEACHERS.find(t => t.id === newPost.teacherId) || MOCK_TEACHERS[0];
    const post: JournalPost = {
      id: `p-${Date.now()}`,
      teacherName: teacher.name,
      teacherAvatar: teacher.avatar,
      className: teacher.classRoom,
      section: newPost.section,
      content: newPost.content,
      image: newPost.image || 'https://picsum.photos/seed/newactivity/800/600',
      timestamp: 'الآن',
      likes: 0,
      tags: ['نشاط_جديد'],
      skills: ['مهارات متنوعة']
    };
    setPosts([post, ...posts]);
    setIsModalOpen(false);
    setNewPost({ teacherId: MOCK_TEACHERS[0].id, content: '', section: Section.PS, image: null });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in pb-20">
      <header className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl relative z-10">
            <LucideIcons.Camera size={48} />
          </div>
          <div className="absolute inset-0 bg-indigo-400 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse"></div>
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 font-display">نبض الأقسام</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">توثيق اللحظات الإبداعية والمسارات التربوية لأطفالنا.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 no-print">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all border-2 ${activeFilter === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}
          >
            الكل
          </button>
          {Object.values(Section).map(sec => (
            <button 
              key={sec}
              onClick={() => setActiveFilter(sec)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all border-2 ${activeFilter === sec ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}
            >
              {sec}
            </button>
          ))}
        </div>
      </header>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 left-10 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-40 group"
      >
        <LucideIcons.Plus size={32} />
        <span className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">إضافة نشاط جديد</span>
      </button>

      <div className="grid grid-cols-1 gap-12">
        {filteredPosts.map((post) => (
          <article key={post.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={post.teacherAvatar} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg">{post.teacherName}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="text-indigo-600">{post.section}</span>
                    <span>•</span>
                    <span>{post.className}</span>
                    <span>•</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all">
                  <LucideIcons.Bookmark size={20} />
                </button>
              </div>
            </div>

            <div className="px-6">
              <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden group/img">
                <img src={post.image} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-1000" alt="" />
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2 translate-y-12 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all">
                   <button className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-xl shadow-lg hover:bg-white"><LucideIcons.Maximize2 size={18} /></button>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                 {post.skills.map(skill => (
                   <span key={skill} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 dark:border-emerald-900/30 whitespace-nowrap">
                     <LucideIcons.Zap size={10} className="inline ml-1" /> {skill}
                   </span>
                 ))}
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-lg mb-8 text-right">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-rose-500 group/like">
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 group-hover/like:bg-rose-500 group-hover/like:text-white transition-all scale-100 active:scale-90">
                      <LucideIcons.Heart size={20} className={post.likes > 20 ? 'fill-current' : ''} />
                    </div>
                    <span className="text-sm font-black">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 group/comm">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover/comm:bg-indigo-600 group-hover/comm:text-white transition-all">
                      <LucideIcons.MessageCircle size={20} />
                    </div>
                    <span className="text-sm font-black">تعليق</span>
                  </button>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <LucideIcons.Share2 size={16} /> مشاركة تربوية
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* مودال إضافة نشاط */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                  <LucideIcons.Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-display">توثيق نشاط جديد</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-all"><LucideIcons.X size={24} /></button>
            </header>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المستوى الدراسي</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                    value={newPost.section}
                    onChange={(e) => setNewPost({...newPost, section: e.target.value as Section})}
                  >
                    {Object.values(Section).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المعلمة المسؤولة</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                    value={newPost.teacherId}
                    onChange={(e) => setNewPost({...newPost, teacherId: e.target.value})}
                  >
                    {MOCK_TEACHERS.slice(0, 5).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">وصف النشاط</label>
                  <button 
                    onClick={handleGenerateCaption}
                    disabled={isGenerating}
                    className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {isGenerating ? <LucideIcons.Loader2 size={14} className="animate-spin" /> : <LucideIcons.Brain size={14} />}
                    اقتراح بيداغوجي بالذكاء الاصطناعي
                  </button>
                </div>
                <textarea 
                  rows={4}
                  placeholder="ماذا فعل الأطفال اليوم؟ (مثال: حصة الأعمال اليدوية باستخدام الورق المقوى...)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-right"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center group hover:border-indigo-400 transition-all cursor-pointer">
                 <LucideIcons.ImagePlus size={48} className="mx-auto text-slate-300 group-hover:text-indigo-500 transition-all mb-4" />
                 <p className="text-xs font-bold text-slate-400">اسحب الصور هنا أو انقر لتحميلها من الجهاز</p>
                 <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-tighter">يدعم: JPG, PNG, WEBP (بحد أقصى 5MB)</p>
              </div>
            </div>

            <footer className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
               <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-sm font-black text-slate-400">إلغاء</button>
               <button 
                onClick={handleAddPost}
                disabled={!newPost.content}
                className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
               >
                 نشر في المجلة
               </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolJournal;
