import React, { useState, useEffect } from 'react';
import { schoolDataService } from '../services/schoolData';
import { SchoolClass, Exam } from '../types';
import { Edit2, Save, X, Calendar, Clock, BookOpen, Info, RefreshCw, FileText, Trash2, Download, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { ExamUploader } from './ExamUploader';
import { StoredDocument } from '../types';

export const ScheduleEditor: React.FC = () => {
  const [timetable, setTimetable] = useState<SchoolClass[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [deletingItem, setDeletingItem] = useState<{ type: 'class' | 'exam' | 'document', id: string } | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    setTimetable(schoolDataService.getTimetable());
    setExams(schoolDataService.getExams());
    setDocuments(schoolDataService.getDocuments());
    schoolDataService.cleanupExpiredDocuments();

    // Listen for OAuth success
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_SUCCESS' && event.data.tokens) {
        setIsSyncing(true);
        setSyncStatus({ type: null, message: '' });
        try {
          const { access_token } = event.data.tokens;
          const result = await schoolDataService.syncCalendar(access_token);
          
          // Refresh data
          setTimetable(schoolDataService.getTimetable());
          setExams(schoolDataService.getExams());
          
          setSyncStatus({ 
            type: 'success', 
            message: `Synced! Added ${result.newClassesCount} classes and ${result.newExamsCount} exams.` 
          });
          
          // Clear success message after 5 seconds
          setTimeout(() => setSyncStatus({ type: null, message: '' }), 5000);
        } catch (error: any) {
          console.error('Sync failed', error);
          setSyncStatus({ 
            type: 'error', 
            message: error.message || 'Failed to sync calendar. Please try again.' 
          });
        } finally {
          setIsSyncing(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectCalendar = async () => {
    try {
      setSyncStatus({ type: null, message: '' });
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) {
        throw new Error('Failed to fetch authentication URL from server.');
      }
      const { url } = await response.json();
      
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        url,
        'Google Calendar Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site to connect your calendar.');
      }
    } catch (error: any) {
      console.error('Failed to get auth URL', error);
      setSyncStatus({ 
        type: 'error', 
        message: error.message || 'Failed to initiate calendar connection. Please check your network.' 
      });
    }
  };

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

  const handleDeleteDocument = (id: string) => {
    setDeletingItem({ type: 'document', id });
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    
    if (deletingItem.type === 'class') {
      schoolDataService.deleteSchoolClass(deletingItem.id);
      setTimetable(schoolDataService.getTimetable());
    } else if (deletingItem.type === 'exam') {
      schoolDataService.deleteExam(deletingItem.id);
      setExams(schoolDataService.getExams());
    } else if (deletingItem.type === 'document') {
      schoolDataService.deleteDocument(deletingItem.id);
      setDocuments(schoolDataService.getDocuments());
    }
    setDeletingItem(null);
  };

  const cancelDelete = () => {
    setDeletingItem(null);
  };

  const handleDownloadDocument = (doc: StoredDocument) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddClass = (day: string) => {
    schoolDataService.addSchoolClass("New Class", "09:00 AM", day, "Notes");
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
          {t('missionDataSchedule')}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectCalendar}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Calendar'}
          </button>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${isEditing 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}
          `}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          {isEditing ? t('saveChanges') : t('editData')}
        </button>
        </div>
      </div>

      {/* Sync Status Message */}
      {syncStatus.type && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          syncStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {syncStatus.type === 'success' ? (
            <div className="p-1 bg-emerald-100 rounded-full">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
          ) : (
            <div className="p-1 bg-red-100 rounded-full">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold mb-0.5">
              {syncStatus.type === 'success' ? 'Sync Successful' : 'Sync Failed'}
            </h4>
            <p className="text-sm opacity-90">{syncStatus.message}</p>
          </div>
          <button 
            onClick={() => setSyncStatus({ type: null, message: '' })}
            className="p-1 hover:bg-black/5 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="grid gap-4">
        <h3 className="text-sm font-mono text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" /> {t('weeklyTimetable')}
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
                  <div className="col-span-2">{t('time')}</div>
                  <div className="col-span-4">{t('class')}</div>
                  <div className={isEditing ? "col-span-5" : "col-span-6"}>{t('notes')}</div>
                  {isEditing && <div className="col-span-1 text-center">{t('action')}</div>}
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
                            className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                            className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                            className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                        ) : item.notes}
                      </div>
                      {isEditing && (
                        <div className="col-span-1 flex justify-center gap-1">
                          <button 
                            onClick={() => setEditingClass(item)}
                            className="p-1 text-emerald-400 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Edit Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClass(item.id)}
                            className="p-1 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Class"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayClasses.length === 0 && isEditing && (
                    <div className="p-4 text-center text-slate-400 text-sm italic">
                      {t('noClasses')} {day}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="p-2 border-t border-slate-200 bg-slate-50">
                    <button
                      onClick={() => handleAddClass(day)}
                      className="w-full py-2 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-dashed border-emerald-200"
                    >
                      + {t('addClassTo')} {day}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono text-emerald-600 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {t('upcomingExams')}
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 focus:outline-none focus:border-emerald-500"
              placeholder={t('startDate')}
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 focus:outline-none focus:border-emerald-500"
              placeholder={t('endDate')}
            />
            {(filterStartDate || filterEndDate) && (
              <button
                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                className="text-slate-400 hover:text-slate-600"
                title={t('clearFilter')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* PDF Uploader */}
        {isEditing && (
            <div className="mb-4">
                <ExamUploader onUploadComplete={() => {
                  setExams(schoolDataService.getExams());
                  setDocuments(schoolDataService.getDocuments());
                }} />
            </div>
        )}

        {/* Stored Documents */}
        {documents.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> {t('storedDocuments')}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{doc.name}</div>
                      <div className="text-xs text-slate-500">
                        Uploaded: {new Date(doc.uploadDate).toLocaleDateString()} • Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <div className="col-span-2">{t('date')}</div>
            <div className="col-span-3">{t('subject')}</div>
            <div className="col-span-4">{t('topics')}</div>
            <div className={isEditing ? "col-span-2" : "col-span-3"}>{t('reminder')}</div>
            {isEditing && <div className="col-span-1 text-center">{t('action')}</div>}
          </div>
          <div className="divide-y divide-slate-100">
            {exams
              .filter(exam => {
                if (!filterStartDate && !filterEndDate) return true;
                const examDate = new Date(exam.date);
                const start = filterStartDate ? new Date(filterStartDate) : null;
                const end = filterEndDate ? new Date(filterEndDate) : null;

                if (start && examDate < start) return false;
                if (end && examDate > end) return false;
                return true;
              })
              .map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors items-center">
                <div className="col-span-2 font-mono text-slate-500">
                  {isEditing ? (
                    <input 
                      type="date"
                      value={item.date} 
                      onChange={(e) => {
                        const newExams = exams.map(ex => ex.id === item.id ? { ...ex, date: e.target.value } : ex);
                        setExams(newExams);
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  ) : item.date}
                </div>
                <div className="col-span-3 font-medium text-slate-900">
                  {isEditing ? (
                    <input 
                      value={item.subject} 
                      onChange={(e) => {
                        const newExams = exams.map(ex => ex.id === item.id ? { ...ex, subject: e.target.value } : ex);
                        setExams(newExams);
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  ) : item.subject}
                </div>
                <div className="col-span-4 text-slate-500">
                  {isEditing ? (
                    <input 
                      value={item.topics} 
                      onChange={(e) => {
                        const newExams = exams.map(ex => ex.id === item.id ? { ...ex, topics: e.target.value } : ex);
                        setExams(newExams);
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  ) : item.topics}
                </div>
                <div className={isEditing ? "col-span-2" : "col-span-3"}>
                  {isEditing ? (
                    <input 
                      value={item.reminder || ''} 
                      onChange={(e) => {
                        const newExams = exams.map(ex => ex.id === item.id ? { ...ex, reminder: e.target.value } : ex);
                        setExams(newExams);
                      }}
                      placeholder={t('placeholderDaysBefore')}
                      className="bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs italic">{item.reminder || 'No reminder'}</span>
                  )}
                </div>
                {isEditing && (
                  <div className="col-span-1 flex justify-center gap-1">
                    <button 
                      onClick={() => setEditingExam(item)}
                      className="p-1 text-emerald-400 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Edit Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteExam(item.id)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Exam"
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
                className="w-full py-2 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-dashed border-emerald-200"
              >
                + {t('addNewExam')}
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Save className="w-5 h-5" />
            {t('saveChanges')}
          </button>
        </div>
      )}

      {/* Class Details Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">{t('classDetails')} {editingClass.name}</h3>
              <button 
                onClick={() => setEditingClass(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('topicsCovered')}</label>
                <input
                  type="text"
                  value={editingClass.topics || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, topics: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={t('placeholderTopics')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('requiredMaterials')}</label>
                  <input
                    type="text"
                    value={editingClass.materials || ''}
                    onChange={(e) => setEditingClass({ ...editingClass, materials: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder={t('placeholderItems')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('homework')}</label>
                  <input
                    type="text"
                    value={editingClass.homework || ''}
                    onChange={(e) => setEditingClass({ ...editingClass, homework: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder={t('placeholderNotes')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('generalNotes')}</label>
                <textarea
                  value={editingClass.notes}
                  onChange={(e) => setEditingClass({ ...editingClass, notes: e.target.value })}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder={t('placeholderOtherDetails')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  const newTimetable = timetable.map(t => t.id === editingClass.id ? editingClass : t);
                  setTimetable(newTimetable);
                  setEditingClass(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
              >
                {t('saveDetails')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Details Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">{t('examDetails')} {editingExam.subject}</h3>
              <button 
                onClick={() => setEditingExam(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('topicsToCover')}</label>
                <textarea
                  value={editingExam.topics}
                  onChange={(e) => setEditingExam({ ...editingExam, topics: e.target.value })}
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder={t('placeholderSpecificTopics')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('prerequisiteKnowledge')}</label>
                <textarea
                  value={editingExam.prerequisites || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, prerequisites: e.target.value })}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder={t('placeholderBeforeStarting')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('reminderInstructions')}</label>
                <input
                  type="text"
                  value={editingExam.reminder || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, reminder: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={t('placeholderReminder')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingExam(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  const newExams = exams.map(e => e.id === editingExam.id ? editingExam : e);
                  setExams(newExams);
                  setEditingExam(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
              >
                {t('saveDetails')}
              </button>
            </div>
          </div>
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
                {t('cancel')}
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
