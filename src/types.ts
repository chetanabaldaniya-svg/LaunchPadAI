export interface SchoolClass {
  id: string;
  name: string;
  time: string;
  day: string;
  notes: string;
  topics?: string;
  materials?: string;
  homework?: string;
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  topics: string;
  prerequisites?: string;
  reminder?: string;
}

export interface StudentProfile {
  name: string;
  grade: string;
  goals: string;
}

export interface SubjectProgress {
  id: string;
  subjectName: string;
  currentGrade: number;
  targetGrade: number;
  studyHours: number;
  lastUpdated: string;
}

export interface StoredDocument {
  id: string;
  name: string;
  data: string; // base64
  uploadDate: string;
  expiryDate: string; // Date of the last exam
}

export interface GamificationStats {
  focusPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface SchoolData {
  timetable: SchoolClass[];
  exams: Exam[];
  profile: StudentProfile;
  progress: SubjectProgress[];
  documents: StoredDocument[];
  stats: GamificationStats;
}

export type SchoolDataCategory = 'timetable' | 'exams' | 'profile' | 'progress' | 'stats';
