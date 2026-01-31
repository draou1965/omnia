
export enum Section {
  TPS = "الحضانة الصغرى",
  PS = "القسم الأصغر",
  MS = "القسم الأوسط",
  GS = "القسم الأكبر"
}

export interface Teacher {
  id: string;
  name: string;
  section: Section;
  classRoom: string;
  email: string;
  phone: string;
  studentsCount: number;
  avatar: string;
  status: 'present' | 'absent' | 'formation';
  monthlySalary: number;
  paidAmount: number;
}

export type AssessmentStatus = 'acquired' | 'ongoing' | 'not_acquired';

export interface CompetencyAssessment {
  language: AssessmentStatus;
  math: AssessmentStatus;
  social: AssessmentStatus;
  motor: AssessmentStatus;
  art: AssessmentStatus;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  massarNumber: string;
  birthDate: string;
  gender: 'male' | 'female';
  section: Section;
  avatar: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  className: string;
  teacherId: string;
  teacherName: string;
  assessments?: CompetencyAssessment;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export interface PrivateMessage {
  id: string;
  sender: 'school' | 'parent';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  parentName: string;
  studentName: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  messages: PrivateMessage[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'info' | 'urgent' | 'event';
  targetedSection: Section | 'all';
  scheduledFor?: Date;
}
