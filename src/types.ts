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
}

export interface StudentProfile {
  name: string;
  grade: string;
  goals: string;
}

export interface SchoolData {
  timetable: SchoolClass[];
  exams: Exam[];
  profile: StudentProfile;
}

export type SchoolDataCategory = 'timetable' | 'exams' | 'profile';
