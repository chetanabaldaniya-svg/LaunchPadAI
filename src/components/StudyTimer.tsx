import React from 'react';
import { useStudySession } from '../context/StudyContext';
import { motion } from 'motion/react';
import { Timer, Play, Pause, Square, Zap } from 'lucide-react';

export const StudyTimer: React.FC = () => {
  const { timeLeft, isActive, totalTime, topic, startSprint, stopTimer, pauseTimer, resumeTimer } = useStudySession();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  if (totalTime === 0 && !isActive) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-slate-500">
          <Timer className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Study Sprint</span>
        </div>
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm mb-4">Ready to focus?</p>
          <button 
            onClick={() => startSprint(25)}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 mx-auto"
          >
            <Zap className="w-4 h-4" />
            Start 25m Sprint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      {/* Background Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <motion.div 
          className="h-full bg-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            {topic || 'Focus Session'}
          </h3>
          <p className="text-xs text-emerald-200/60 uppercase tracking-wider font-mono mt-1">
            {isActive ? 'Sprint Active' : 'Paused'}
          </p>
        </div>
        <div className="flex gap-2">
          {isActive ? (
            <button onClick={pauseTimer} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={resumeTimer} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
              <Play className="w-4 h-4" />
            </button>
          )}
          <button onClick={stopTimer} className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors">
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center py-6">
        <div className="text-6xl font-mono font-light tracking-tighter text-white tabular-nums">
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};
