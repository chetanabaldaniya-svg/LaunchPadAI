import React, { useEffect, useState } from 'react';
import { schoolDataService } from '../services/schoolData';
import { SchoolClass } from '../types';
import { CheckCircle, Circle, Sun, Backpack } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const MorningCheck: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const allClasses = schoolDataService.getTimetable();
    const todaysClasses = allClasses.filter(c => c.day === today);
    setClasses(todaysClasses);
  }, []);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = classes.length > 0 && classes.every(c => checkedItems[c.id]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
          <Sun className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{t('morningCheck')}</h2>
        <p className="text-slate-500">{t('morningCheckDesc')}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-medium text-slate-700 flex items-center gap-2">
            <Backpack className="w-4 h-4" />
            Pack Your Bag
          </h3>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {classes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic">
              No classes scheduled for today. Enjoy your day off!
            </div>
          ) : (
            classes.map((cls) => (
              <div 
                key={cls.id} 
                onClick={() => toggleItem(cls.id)}
                className={`
                  p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-slate-50
                  ${checkedItems[cls.id] ? 'bg-emerald-50/50' : ''}
                `}
              >
                <div className={`mt-1 transition-colors ${checkedItems[cls.id] ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {checkedItems[cls.id] ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${checkedItems[cls.id] ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {cls.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">{cls.time}</span>
                  </div>
                  {(cls.materials || cls.homework) && (
                    <div className="text-sm text-slate-500 space-y-1">
                      {cls.materials && (
                        <p className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          Bring: {cls.materials}
                        </p>
                      )}
                      {cls.homework && (
                        <p className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          Due: {cls.homework}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {allChecked && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl text-center font-medium animate-bounce">
          🎉 All set! You're ready to go!
        </div>
      )}
    </div>
  );
};
