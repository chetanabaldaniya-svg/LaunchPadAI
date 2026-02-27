export interface SchoolClass {
  id: string;
  name: string;
  time: string;
  day: string;
  notes: string;
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  topics: string;
}

export interface SchoolData {
  timetable: SchoolClass[];
  exams: Exam[];
}

export type SchoolDataCategory = 'timetable' | 'exams';
