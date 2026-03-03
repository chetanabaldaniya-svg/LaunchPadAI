import React, { useState, useEffect } from 'react';
import { schoolDataService } from '../services/schoolData';
import { SubjectProgress } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Target, Save, Edit2, Plus, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { motion } from 'motion/react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ProgressDashboard: React.FC = () => {
  const [progressData, setProgressData] = useState<SubjectProgress[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<SubjectProgress | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setProgressData(schoolDataService.getProgress());
  }, []);

  const handleSave = () => {
    schoolDataService.updateProgress(progressData);
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleUpdateItem = (updatedItem: SubjectProgress) => {
    const newData = progressData.map(item => item.id === updatedItem.id ? updatedItem : item);
    setProgressData(newData);
    if (editingItem && editingItem.id === updatedItem.id) {
      setEditingItem(updatedItem);
    }
  };

  const handleAddItem = () => {
    const newItem: SubjectProgress = {
      id: Date.now().toString(),
      subjectName: 'New Subject',
      currentGrade: 0,
      targetGrade: 0,
      studyHours: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProgressData([...progressData, newItem]);
    setEditingItem(newItem);
    setIsEditing(true);
  };

  const handleDeleteItem = (id: string) => {
    const newData = progressData.filter(item => item.id !== id);
    setProgressData(newData);
  };

  // Calculate averages
  const averageGrade = progressData.length > 0 
    ? Math.round(progressData.reduce((acc, curr) => acc + curr.currentGrade, 0) / progressData.length) 
    : 0;
  
  const totalStudyHours = progressData.reduce((acc, curr) => acc + curr.studyHours, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light tracking-tight text-slate-900">
          {t('missionDataProgress')}
        </h2>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-emerald-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('averageGrade')}</p>
            <p className="text-2xl font-bold text-slate-900">{averageGrade}%</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-blue-50 rounded-xl">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('totalStudyHours')}</p>
            <p className="text-2xl font-bold text-slate-900">{totalStudyHours}h</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-purple-50 rounded-xl">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('activeSubjects')}</p>
            <p className="text-2xl font-bold text-slate-900">{progressData.length}</p>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">{t('gradePerformance')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subjectName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar name="Current" dataKey="currentGrade" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1500} />
                <Bar name="Target" dataKey="targetGrade" fill="#e2e8f0" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Study Distribution Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">{t('studyDistribution')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="studyHours"
                  animationDuration={1500}
                  animationBegin={200}
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Data Table / Editor */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('subjectDetails')}</h3>
          {isEditing && (
            <button 
              onClick={handleAddItem}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> {t('addSubject')}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">{t('subject')}</th>
                <th className="px-6 py-3">{t('currentGrade')}</th>
                <th className="px-6 py-3">{t('targetGrade')}</th>
                <th className="px-6 py-3">{t('studyHours')}</th>
                {isEditing && <th className="px-6 py-3 text-right">{t('actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {progressData.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50 hover:scale-[1.01] hover:shadow-sm transition-all duration-200 cursor-default"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">{item.subjectName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.currentGrade >= item.targetGrade ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.currentGrade}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.targetGrade}%</td>
                  <td className="px-6 py-4 text-slate-500">{item.studyHours}h</td>
                  {isEditing && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-red-400 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">{t('editSubjectProgress')}</h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('subjectName')}</label>
                <input
                  type="text"
                  value={editingItem.subjectName}
                  onChange={(e) => setEditingItem({ ...editingItem, subjectName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('currentGrade')} (%)</label>
                  <input
                    type="number"
                    value={editingItem.currentGrade}
                    onChange={(e) => setEditingItem({ ...editingItem, currentGrade: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('targetGrade')} (%)</label>
                  <input
                    type="number"
                    value={editingItem.targetGrade}
                    onChange={(e) => setEditingItem({ ...editingItem, targetGrade: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('studyHoursLogged')}</label>
                <input
                  type="number"
                  value={editingItem.studyHours}
                  onChange={(e) => setEditingItem({ ...editingItem, studyHours: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  handleUpdateItem(editingItem);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-colors"
              >
                {t('saveDetails')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
