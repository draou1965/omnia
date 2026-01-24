
import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { MOCK_CONVERSATIONS, MOCK_ANNOUNCEMENTS } from '../constants';
import { Conversation, Announcement, Section } from '../types';

const Messaging: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'private' | 'announcements'>('private');
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(MOCK_CONVERSATIONS[0].id);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Announcement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    targetedSection: 'all' as Section | 'all',
    type: 'info' as 'info' | 'urgent' | 'event',
    scheduleDate: '',
    scheduleTime: ''
  });

  const selectedConv = conversations.find(c => c.id === selectedConvId) || null;

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      conv.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, conversations]);

  const cleanPhoneForWA = (phone: string) => {
    // We need to find the parent phone from mock data since it's not directly in Conversation type
    // In a real app, it would be part of the object. For now, we'll try to match by parentName
    // or just use a dummy logic since MOCK_CONVERSATIONS doesn't have phones.
    // In this specific mock setup, we'll assume a standard clean.
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return '212' + digits.substring(1);
    return digits;
  };

  const handleCreateAnnouncement = () => {
    const scheduledDate = isScheduling && newAnn.scheduleDate && newAnn.scheduleTime 
      ? new Date(`${newAnn.scheduleDate}T${newAnn.scheduleTime}`) 
      : undefined;

    const announcement: Announcement = {
      id: `a-${Date.now()}`,
      title: newAnn.title,
      content: newAnn.content,
      sender: 'الإدارة',
      timestamp: new Date(),
      scheduledFor: scheduledDate,
      targetedSection: newAnn.targetedSection,
      type: newAnn.type
    };

    setAnnouncements([announcement, ...announcements]);
    setIsModalOpen(false);
    setNewAnn({ title: '', content: '', targetedSection: 'all', type: 'info', scheduleDate: '', scheduleTime: '' });
    setIsScheduling(false);
  };

  const renderPrivateMessages = () => (
    <div className="flex h-[calc(100vh-14rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="w-80 border-l border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-50">
          <div className="relative">
            <LucideIcons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="البحث عن ولي أمر..."
              className="w-full pr-9 pl-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full p-4 flex gap-3 transition-colors text-right relative ${
                selectedConvId === conv.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative shrink-0">
                <img src={conv.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="" />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-bold text-slate-900 truncate text-sm">{conv.parentName}</h4>
                  <span className="text-[9px] text-slate-400 whitespace-nowrap mr-2">
                    {conv.timestamp.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-indigo-600 font-bold truncate mb-1">
                  <LucideIcons.Baby size={10} className="inline ml-1" />
                  {conv.studentName}
                </p>
                <p className="text-[11px] text-slate-400 truncate italic">"{conv.lastMessage}"</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50/30">
        {selectedConv ? (
          <>
            <header className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedConv.avatar} className="w-10 h-10 rounded-full shadow-sm" alt="" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedConv.parentName}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                      ولي أمر {selectedConv.studentName}
                    </p>
                    <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      متصل الآن
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100" 
                  onClick={() => window.open(`https://wa.me/212612345678`, '_blank')}
                  title="تواصل عبر واتساب"
                >
                  <LucideIcons.MessageCircle size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-all" onClick={() => alert('جاري الاتصال...')}>
                  <LucideIcons.Phone size={20} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConv.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'school' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                    msg.sender === 'school' 
                      ? 'bg-indigo-600 text-white rounded-tl-none' 
                      : 'bg-white text-slate-700 rounded-tr-none border border-slate-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className="flex items-center gap-1 mt-1 opacity-60 justify-end">
                      <p className="text-[9px]">
                        {msg.timestamp.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-3 items-center">
                <input 
                  type="text" 
                  placeholder="اكتب ردك هنا..."
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                  <LucideIcons.Send size={18} className="transform rotate-180" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <LucideIcons.MessageCircle size={64} className="opacity-20" />
            <p className="font-bold">اختر محادثة للبدء</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">الإعلانات العامة</h3>
          <p className="text-sm text-slate-500">نشر المعلومات لجميع أولياء الأمور أو لأقسام معينة.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          <LucideIcons.Plus size={18} />
          إعلان جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => {
          const isScheduled = ann.scheduledFor && ann.scheduledFor > new Date();
          return (
            <div key={ann.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              {ann.type === 'urgent' && <div className="absolute top-0 right-0 w-1 h-full bg-rose-500"></div>}
              {isScheduled && <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                    ann.type === 'urgent' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {ann.type === 'urgent' ? '⚠️ عاجل' : 'ℹ️ تنبيه'}
                  </div>
                  {isScheduled && (
                    <div className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 flex items-center gap-1">
                      <LucideIcons.Clock size={10} />
                      مجدول
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isScheduled ? 
                    `مجدول لـ: ${ann.scheduledFor?.toLocaleString('ar-MA')}` : 
                    ann.timestamp.toLocaleDateString('ar-MA')}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors text-sm">{ann.title}</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">{ann.content}</p>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="bg-slate-100 px-2 py-1 rounded text-[9px] font-bold text-slate-500 border border-slate-200">
                  {ann.targetedSection === 'all' ? 'كل الأقسام' : ann.targetedSection}
                </div>
                <span className="text-[10px] text-slate-400 italic">من: {ann.sender}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <header className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 font-display">إنشاء إعلان جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <LucideIcons.X size={20} />
              </button>
            </header>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">العنوان</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({...newAnn, title: e.target.value})}
                  placeholder="مثال: رحلة مدرسية، عطلة..."
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">المحتوى</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({...newAnn, content: e.target.value})}
                  placeholder="اكتب تفاصيل الإعلان هنا..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">القسم المستهدف</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={newAnn.targetedSection}
                    onChange={(e) => setNewAnn({...newAnn, targetedSection: e.target.value as any})}
                  >
                    <option value="all">كل الأقسام</option>
                    {Object.values(Section).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">نوع الإعلان</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={newAnn.type}
                    onChange={(e) => setNewAnn({...newAnn, type: e.target.value as any})}
                  >
                    <option value="info">معلومة ℹ️</option>
                    <option value="urgent">عاجل ⚠️</option>
                    <option value="event">حدث 📅</option>
                  </select>
                </div>
              </div>

              {/* Scheduling Section */}
              <div className="pt-2">
                <button 
                  onClick={() => setIsScheduling(!isScheduling)}
                  className={`flex items-center gap-2 text-xs font-bold transition-colors ${isScheduling ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isScheduling ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isScheduling ? 'left-1' : 'left-6'}`}></div>
                  </div>
                  جدولة النشر لاحقاً
                </button>

                {isScheduling && (
                  <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">التاريخ</label>
                      <input 
                        type="date" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newAnn.scheduleDate}
                        onChange={(e) => setNewAnn({...newAnn, scheduleDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">الوقت</label>
                      <input 
                        type="time" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newAnn.scheduleTime}
                        onChange={(e) => setNewAnn({...newAnn, scheduleTime: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleCreateAnnouncement}
                disabled={!newAnn.title || !newAnn.content}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isScheduling ? 'جدولة الإعلان' : 'نشر الإعلان الآن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <header className="flex items-center gap-6 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('private')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'private' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LucideIcons.MessagesSquare size={18} />
          الرسائل الخاصة
          {activeTab === 'private' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('announcements')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'announcements' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LucideIcons.Megaphone size={18} />
          الإعلانات والتنبيهات
          {activeTab === 'announcements' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
      </header>

      {activeTab === 'private' ? renderPrivateMessages() : renderAnnouncements()}
    </div>
  );
};

export default Messaging;
