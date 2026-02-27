import React, { useState, useEffect } from 'react';
import { schoolDataService } from '../services/schoolData';
import { SchoolClass, Exam } from '../types';
import { Edit2, Save, X, Calendar, Clock, BookOpen } from 'lucide-react';

export const ScheduleEditor: React.FC = () => {
  const [timetable, setTimetable] = useState<SchoolClass[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'class' | 'exam', id: string } | null>(null);

  useEffect(() => {
    setTimetable(schoolDataService.getTimetable());
    setExams(schoolDataService.getExams());
  }, []);

  const handleSave = () => {
    schoolDataService.updateTimetable(timetable);
    schoolDataService.updateExams(exams);
    setIsEditing(false);
  };

  const handleDeleteClass = (id: string) => {
    setDeletingItem({ type: 'class', id });
  };

  const handleDeleteExam = (id: string) => {
    setDeletingItem({ type: 'exam', id });
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    
    if (deletingItem.type === 'class') {
      schoolDataService.deleteSchoolClass(deletingItem.id);
      setTimetable(schoolDataService.getTimetable());
    } else {
      schoolDataService.deleteExam(deletingItem.id);
      setExams(schoolDataService.getExams());
    }
    setDeletingItem(null);
  };

  const cancelDelete = () => {
    setDeletingItem(null);
  };

  const handleAddClass = () => {
    schoolDataService.addSchoolClass("New Class", "09:00 AM", "Monday", "Notes");
    setTimetable(schoolDataService.getTimetable());
  };

  const handleAddExam = () => {
    const today = new Date().toISOString().split('T')[0];
    schoolDataService.addExam("New Exam", today, "Topics");
    setExams(schoolDataService.getExams());
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light tracking-tight text-slate-900">
          Mission Data <span className="text-slate-400">/ School Schedule</span>
        </h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${isEditing 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}
          `}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          {isEditing ? 'Save Changes' : 'Edit Data'}
        </button>
      </div>

      {/* Timetable Grid */}
      <div className="grid gap-4">
        <h3 className="text-sm font-mono text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Weekly Timetable
        </h3>
        <div className="space-y-6">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
            const dayClasses = timetable.filter(t => t.day === day);
            if (dayClasses.length === 0 && !isEditing) return null;

            return (
              <div key={day} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{day}</h4>
                </div>
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="col-span-2">Time</div>
                  <div className="col-span-4">Class</div>
                  <div className={isEditing ? "col-span-5" : "col-span-6"}>Notes</div>
                  {isEditing && <div className="col-span-1 text-center">Action</div>}
                </div>
                <div className="divide-y divide-slate-100">
                  {dayClasses.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 p-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors items-center">
                      <div className="col-span-2 font-mono text-slate-500">
                        {isEditing ? (
                          <input 
                            value={item.time} 
                            onChange={(e) => {
                              const newTimetable = timetable.map(t => 
                                t.id === item.id ? { ...t, time: e.target.value } : t
                              );
                              setTimetable(newTimetable);
                            }}
                            className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        ) : item.time}
                      </div>
                      <div className="col-span-4 font-medium text-slate-900">
                        {isEditing ? (
                          <input 
                            value={item.name} 
                            onChange={(e) => {
                              const newTimetable = timetable.map(t => 
                                t.id === item.id ? { ...t, name: e.target.value } : t
                              );
                              setTimetable(newTimetable);
                            }}
                            className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        ) : item.name}
                      </div>
                      <div className={`${isEditing ? "col-span-5" : "col-span-6"} text-slate-500 italic`}>
                        {isEditing ? (
                          <input 
                            value={item.notes} 
                            onChange={(e) => {
                              const newTimetable = timetable.map(t => 
                                t.id === item.id ? { ...t, notes: e.target.value } : t
                              );
                              setTimetable(newTimetable);
                            }}
                            className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        ) : item.notes}
                      </div>
                      {isEditing && (
                        <div className="col-span-1 flex justify-center">
                          <button 
                            onClick={() => handleDeleteClass(item.id)}
                            className="p-1 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayClasses.length === 0 && isEditing && (
                    <div className="p-4 text-center text-slate-400 text-sm italic">
                      No classes scheduled for {day}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {isEditing && (
            <div className="p-2 border-t border-slate-200 bg-slate-50 rounded-xl">
              <button
                onClick={handleAddClass}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-200"
              >
                + Add New Class
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid gap-4">
        <h3 className="text-sm font-mono text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Upcoming Exams
        </h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Date</div>
            <div className="col-span-3">Subject</div>
            <div className={isEditing ? "col-span-5" : "col-span-6"}>Topics</div>
            {isEditing && <div className="col-span-1 text-center">Action</div>}
          </div>
          <div className="divide-y divide-slate-100">
            {exams.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors items-center">
                <div className="col-span-3 font-mono text-slate-500">
                  {isEditing ? (
                    <input 
                      value={item.date} 
                      onChange={(e) => {
                        const newExams = [...exams];
                        newExams[index].date = e.target.value;
                        setExams(newExams);
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  ) : item.date}
                </div>
                <div className="col-span-3 font-medium text-slate-900">
                  {isEditing ? (
                    <input 
                      value={item.subject} 
                      onChange={(e) => {
                        const newExams = [...exams];
                        newExams[index].subject = e.target.value;
                        setExams(newExams);
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  ) : item.subject}
                </div>
                <div className={`${isEditing ? "col-span-5" : "col-span-6"} text-slate-500`}>
                  {isEditing ? (
                    <input 
                      value={item.topics} 
                      onChange={(e) => {
                        const newExams = [...exams];
                        newExams[index].topics = e.target.value;
                        setExams(newExams);
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  ) : item.topics}
                </div>
                {isEditing && (
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => handleDeleteExam(item.id)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="p-2 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleAddExam}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-200"
              >
                + Add New Exam
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Save className="w-5 h-5" />
            Save All Changes
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Confirm Deletion</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this {deletingItem.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
