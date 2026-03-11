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
        // Ensure documents exists if loading from old data
        if (!this.data.documents) {
            this.data.documents = [];
        }
        // Ensure stats exists if loading from old data
        if (!this.data.stats) {
            this.data.stats = { ...INITIAL_SCHOOL_DATA.stats };
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

  getStats(): any {
    return this.data.stats || { ...INITIAL_SCHOOL_DATA.stats };
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
    } else if (category === 'stats') {
      return this.getStats();
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

  updateStats(stats: any) {
    this.data.stats = stats;
    this.save();
  }

  addFocusPoints(points: number) {
    const stats = this.getStats();
    stats.focusPoints += points;
    
    // Check streak
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastStudyDate) {
      const lastDate = new Date(stats.lastStudyDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        // Consecutive day
        stats.currentStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        stats.currentStreak = 1;
      }
      // If diffDays === 0, same day, streak doesn't change
    } else {
      // First time studying
      stats.currentStreak = 1;
    }
    
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    
    stats.lastStudyDate = today;
    this.updateStats(stats);
    return stats;
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

  addExam(subject: string, date: string, topics: string, prerequisites: string = '', reminder: string = '') {
    const newExam: Exam = {
      id: Date.now().toString(),
      subject,
      date,
      topics,
      prerequisites,
      reminder
    };
    this.data.exams.push(newExam);
    this.save();
    return newExam;
  }

  updateExam(id: string, date?: string, topics?: string, subject?: string, prerequisites?: string, reminder?: string) {
    const examIndex = this.data.exams.findIndex(e => e.id === id);
    if (examIndex !== -1) {
      if (date) this.data.exams[examIndex].date = date;
      if (topics) this.data.exams[examIndex].topics = topics;
      if (subject) this.data.exams[examIndex].subject = subject;
      if (prerequisites !== undefined) this.data.exams[examIndex].prerequisites = prerequisites;
      if (reminder !== undefined) this.data.exams[examIndex].reminder = reminder;
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

  getDocuments() {
    return this.data.documents || [];
  }

  addDocument(name: string, data: string, expiryDate: string) {
    if (!this.data.documents) {
      this.data.documents = [];
    }
    this.data.documents.push({
      id: Date.now().toString(),
      name,
      data,
      uploadDate: new Date().toISOString(),
      expiryDate
    });
    this.save();
  }

  deleteDocument(id: string) {
    if (!this.data.documents) return;
    this.data.documents = this.data.documents.filter(d => d.id !== id);
    this.save();
  }

  cleanupExpiredDocuments() {
    if (!this.data.documents) return;
    // Compare dates as strings (YYYY-MM-DD) to avoid timezone issues
    // and ensure the document is kept UNTIL the end of the exam day.
    const today = new Date().toISOString().split('T')[0];
    
    this.data.documents = this.data.documents.filter(d => {
      // Keep if expiry date is today or in the future
      return d.expiryDate >= today;
    });
    this.save();
  }

  async syncCalendar(token: string) {
    try {
      const response = await fetch('/api/calendar/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch calendar events');
      
      const { events } = await response.json();
      
      // Process events
      let newExamsCount = 0;
      let newClassesCount = 0;

      events.forEach((event: any) => {
        const summary = event.summary || 'Untitled';
        const start = new Date(event.start);
        const dateStr = start.toISOString().split('T')[0];
        const dayName = start.toLocaleDateString('en-US', { weekday: 'long' });
        const timeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Check if it's an exam
        if (summary.match(/exam|test|quiz|midterm|final/i)) {
          // Check if already exists
          const exists = this.data.exams.some(e => 
            e.subject === summary && e.date === dateStr
          );
          
          if (!exists) {
            this.addExam(summary, dateStr, event.description || 'Imported from Calendar');
            newExamsCount++;
          }
        } else {
          // Assume it's a class
          // Check if already exists in timetable for this day/time
          const exists = this.data.timetable.some(c => 
            c.day === dayName && c.time === timeStr && c.name === summary
          );
          
          if (!exists) {
            this.addSchoolClass(summary, timeStr, dayName, event.description || '');
            newClassesCount++;
          }
        }
      });
      
      return { newExamsCount, newClassesCount };
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }
}

export const schoolDataService = new SchoolDataService();
