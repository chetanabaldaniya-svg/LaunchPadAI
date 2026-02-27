import { INITIAL_SCHOOL_DATA } from '../constants';
import { SchoolData, SchoolClass, Exam, SchoolDataCategory } from '../types';

class SchoolDataService {
  private data: SchoolData;
  private STORAGE_KEY = 'launchpad_school_data';

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored school data', e);
        this.data = { ...INITIAL_SCHOOL_DATA };
      }
    } else {
      this.data = { ...INITIAL_SCHOOL_DATA };
    }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  getTimetable(): SchoolClass[] {
    return this.data.timetable;
  }

  getExams(): Exam[] {
    return this.data.exams;
  }

  getData(category: SchoolDataCategory): any {
    if (category === 'timetable') {
      return this.getTimetable();
    } else if (category === 'exams') {
      return this.getExams();
    }
    return null;
  }

  updateTimetable(timetable: SchoolClass[]) {
    this.data.timetable = timetable;
    this.save();
  }

  updateExams(exams: Exam[]) {
    this.data.exams = exams;
    this.save();
  }

  addSchoolClass(name: string, time: string, day: string, notes: string) {
    const newClass: SchoolClass = {
      id: Date.now().toString(),
      name,
      time,
      day,
      notes
    };
    this.data.timetable.push(newClass);
    this.save();
    return newClass;
  }

  addExam(subject: string, date: string, topics: string) {
    const newExam: Exam = {
      id: Date.now().toString(),
      subject,
      date,
      topics
    };
    this.data.exams.push(newExam);
    this.save();
    return newExam;
  }

  updateExam(id: string, date?: string, topics?: string, subject?: string) {
    const examIndex = this.data.exams.findIndex(e => e.id === id);
    if (examIndex !== -1) {
      if (date) this.data.exams[examIndex].date = date;
      if (topics) this.data.exams[examIndex].topics = topics;
      if (subject) this.data.exams[examIndex].subject = subject;
      this.save();
      return this.data.exams[examIndex];
    }
    return null;
  }

  updateSchoolClass(id: string, name?: string, time?: string, day?: string, notes?: string) {
    const classIndex = this.data.timetable.findIndex(c => c.id === id);
    if (classIndex !== -1) {
      if (name) this.data.timetable[classIndex].name = name;
      if (time) this.data.timetable[classIndex].time = time;
      if (day) this.data.timetable[classIndex].day = day;
      if (notes) this.data.timetable[classIndex].notes = notes;
      this.save();
      return this.data.timetable[classIndex];
    }
    return null;
  }

  deleteSchoolClass(id: string) {
    this.data.timetable = this.data.timetable.filter(c => c.id !== id);
    this.save();
  }

  deleteExam(id: string) {
    this.data.exams = this.data.exams.filter(e => e.id !== id);
    this.save();
  }
}

export const schoolDataService = new SchoolDataService();
