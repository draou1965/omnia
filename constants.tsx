
import { Teacher, Section, Student, Conversation, Announcement } from './types';

const firstNames = ["مريم", "سارة", "فاطمة", "ليلى", "زينب", "نورة", "خديجة", "عائشة", "هناء", "سلمى"];
const lastNames = ["المنصوري", "الفاسي", "العلمي", "بناني", "الإدريسي", "التازي", "الحداد", "السعدي"];
const childFirstNamesMale = ["أحمد", "ياسين", "جاد", "يحيى", "ريان", "آدم", "عمر", "سامي", "إياد", "مهدي"];
const childFirstNamesFemale = ["لينا", "آية", "نور", "إيناس", "مريم", "سلمى", "كنزة", "دعاء", "صفاء", "رانية"];

export const MOCK_TEACHERS: Teacher[] = Array.from({ length: 48 }).map((_, i) => {
  const baseSalary = 3000 + (i % 5) * 200;
  const isFullyPaid = i % 3 === 0;
  const isPartiallyPaid = i % 7 === 0;
  
  return {
    id: `t-${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / (firstNames.length)) % lastNames.length]}`,
    section: i < 12 ? Section.TPS : i < 24 ? Section.PS : i < 36 ? Section.MS : Section.GS,
    classRoom: `القاعة ${String.fromCharCode(65 + (i % 8))}${Math.floor(i / 8) + 1}`,
    email: `teacher${i + 1}@ecole.ma`,
    phone: `06 12 34 56 ${String(i).padStart(2, '0')}`,
    studentsCount: 20 + (i % 5),
    avatar: `https://picsum.photos/seed/${i + 100}/100/100`,
    status: 'present',
    monthlySalary: baseSalary,
    paidAmount: isFullyPaid ? baseSalary : isPartiallyPaid ? baseSalary / 2 : 0
  };
});

export const MOCK_STUDENTS: Student[] = [];
MOCK_TEACHERS.forEach(teacher => {
  for (let j = 0; j < teacher.studentsCount; j++) {
    const studentIdx = MOCK_STUDENTS.length;
    const gender = j % 2 === 0 ? 'male' : 'female';
    const firstName = gender === 'male' ? childFirstNamesMale[j % 10] : childFirstNamesFemale[j % 10];
    const lastName = lastNames[(studentIdx + teacher.name.length) % lastNames.length];
    
    MOCK_STUDENTS.push({
      id: `s-${studentIdx + 1}`,
      firstName,
      lastName,
      massarNumber: `${String.fromCharCode(65 + (studentIdx % 26))}${100000000 + studentIdx}`,
      birthDate: `202${studentIdx % 2 === 0 ? '0' : '1'}-0${(studentIdx % 9) + 1}-15`,
      gender,
      section: teacher.section,
      avatar: `https://i.pravatar.cc/150?u=student-${studentIdx}`,
      parentName: `السيد(ة) ${firstNames[(studentIdx + 5) % 10]} ${lastName}`,
      parentPhone: `07 89 ${String(studentIdx).slice(-2).padStart(2, '0')} 12 34`,
      parentEmail: `parent.${lastName.toLowerCase()}@email.com`,
      address: `حي الأمل، زنقة ${studentIdx + 10}، الدار البيضاء`,
      className: teacher.classRoom,
      teacherId: teacher.id,
      teacherName: teacher.name
    });
  }
});

export const SCHOOL_NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
  { id: 'attendance', label: 'تسجيل الحضور', icon: 'UserCheck' },
  { id: 'journal', label: 'مجلة الأنشطة', icon: 'Camera' },
  { id: 'meals', label: 'التغذية والوجبات', icon: 'Utensils' },
  { id: 'performance', label: 'تقييم الأداء', icon: 'Trophy' }, // إضافة جديدة
  { id: 'teachers', label: 'المعلمات (48)', icon: 'Users' },
  { id: 'students', label: 'لائحة الأطفال', icon: 'Baby' },
  { id: 'transport', label: 'النقل المدرسي', icon: 'Bus' },
  { id: 'inventory', label: 'المخزون واللوازم', icon: 'Package' },
  { id: 'assessment-grid', label: 'شبكة التقييم التربوي', icon: 'ClipboardCheck' },
  { id: 'finance', label: 'التسيير المالي', icon: 'Wallet' },
  { id: 'messages', label: 'المراسلات', icon: 'MessageSquareText' },
  { id: 'ai-assistant', label: 'مساعد الذكاء الاصطناعي', icon: 'Sparkles' },
  { id: 'calendar', label: 'الجدول الزمني', icon: 'Calendar' }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    parentName: 'محمد بناني',
    studentName: 'جاد بناني',
    avatar: 'https://i.pravatar.cc/150?u=p1',
    lastMessage: 'هل يمكنني الحضور غداً لمناقشة التقرير؟',
    timestamp: new Date(),
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'parent', content: 'السلام عليكم، كيف حال جاد اليوم؟', timestamp: new Date(Date.now() - 3600000) },
      { id: 'm2', sender: 'school', content: 'وعليكم السلام، جاد يبلي بلاءً حسناً في حصة الرسم.', timestamp: new Date(Date.now() - 3000000) },
      { id: 'm3', sender: 'parent', content: 'هل يمكنني الحضور غداً لمناقشة التقرير؟', timestamp: new Date() }
    ]
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'تذكير: رحلة الحديقة',
    content: 'نذكركم أن رحلة يوم الخميس ستنطلق على الساعة التاسعة صباحاً. المرجو إحضار القبعات.',
    sender: 'الإدارة',
    timestamp: new Date(),
    type: 'info',
    targetedSection: 'all'
  }
];
