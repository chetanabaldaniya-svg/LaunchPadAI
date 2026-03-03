import { INITIAL_SCHOOL_DATA } from '../constants';
import { SchoolData, SchoolClass, Exam, SchoolDataCategory, StudentProfile } from '../types';

class SchoolDataService {
  private data: SchoolData;
  private STORAGE_KEY = 'launchpad_school_data';

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
        // Ensure profile exists if loading from old data
        if (!this.data.profile) {
            this.data.profile = { ...INITIAL_SCHOOL_DATA.profile };
        }
        // Ensure progress exists if loading from old data
        if (!this.data.progress) {
            this.data.progress = [...(INITIAL_SCHOOL_DATA.progress || [])];
        }
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

  getProfile(): StudentProfile {
    return this.data.profile;
  }

  getProgress(): any[] {
    return this.data.progress || [];
  }

  getData(category: SchoolDataCategory): any {
    if (category === 'timetable') {
      return this.getTimetable();
    } else if (category === 'exams') {
      return this.getExams();
    } else if (category === 'profile') {
      return this.getProfile();
    } else if (category === 'progress') {
      return this.getProgress();
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

  updateProfile(profile: StudentProfile) {
    this.data.profile = profile;
    this.save();
  }

  updateProgress(progress: any[]) {
    this.data.progress = progress;
    this.save();
  }

  addSchoolClass(name: string, time: string, day: string, notes: string, topics: string = '', materials: string = '', homework: string = '') {
    const newClass: SchoolClass = {
      id: Date.now().toString(),
      name,
      time,
      day,
      notes,
      topics,
      materials,
      homework
    };
    this.data.timetable.push(newClass);
    this.save();
    return newClass;
  }

  addExam(subject: string, date: string, topics: string, prerequisites: string = '') {
    const newExam: Exam = {
      id: Date.now().toString(),
      subject,
      date,
      topics,
      prerequisites
    };
    this.data.exams.push(newExam);
    this.save();
    return newExam;
  }

  updateExam(id: string, date?: string, topics?: string, subject?: string, prerequisites?: string) {
    const examIndex = this.data.exams.findIndex(e => e.id === id);
    if (examIndex !== -1) {
      if (date) this.data.exams[examIndex].date = date;
      if (topics) this.data.exams[examIndex].topics = topics;
      if (subject) this.data.exams[examIndex].subject = subject;
      if (prerequisites !== undefined) this.data.exams[examIndex].prerequisites = prerequisites;
      this.save();
      return this.data.exams[examIndex];
    }
    return null;
  }

  updateSchoolClass(id: string, name?: string, time?: string, day?: string, notes?: string, topics?: string, materials?: string, homework?: string) {
    const classIndex = this.data.timetable.findIndex(c => c.id === id);
    if (classIndex !== -1) {
      if (name) this.data.timetable[classIndex].name = name;
      if (time) this.data.timetable[classIndex].time = time;
      if (day) this.data.timetable[classIndex].day = day;
      if (notes) this.data.timetable[classIndex].notes = notes;
      if (topics !== undefined) this.data.timetable[classIndex].topics = topics;
      if (materials !== undefined) this.data.timetable[classIndex].materials = materials;
      if (homework !== undefined) this.data.timetable[classIndex].homework = homework;
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
