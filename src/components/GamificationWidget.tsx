import React, { useEffect, useState } from 'react';
import { schoolDataService } from '../services/schoolData';
import { GamificationStats } from '../types';
import { Flame, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GamificationWidget: React.FC = () => {
  const [stats, setStats] = useState<GamificationStats>(schoolDataService.getStats());

  useEffect(() => {
    const handleStatsUpdate = () => {
      setStats(schoolDataService.getStats());
    };

    window.addEventListener('statsUpdated', handleStatsUpdate);
    return () => window.removeEventListener('statsUpdated', handleStatsUpdate);
  }, []);

  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Streak</div>
          <motion.div 
            key={stats.currentStreak}
            initial={{ scale: 1.5, color: '#f97316' }}
            animate={{ scale: 1, color: '#1e293b' }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="text-sm font-bold text-slate-800"
          >
            {stats.currentStreak} Days
          </motion.div>
        </div>
      </div>
      
      <div className="w-px h-8 bg-indigo-200/50" />
      
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg">
          <Star className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Points</div>
          <motion.div 
            key={stats.focusPoints}
            initial={{ scale: 1.5, color: '#4f46e5' }}
            animate={{ scale: 1, color: '#1e293b' }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="text-sm font-bold text-slate-800"
          >
            {stats.focusPoints}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
