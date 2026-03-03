import React, { useState } from 'react';
import { LiveAgent } from './components/LiveAgent';
import { ScheduleEditor } from './components/ScheduleEditor';
import { StudyTimer } from './components/StudyTimer';
import { StudentProfile } from './components/StudentProfile';
import { ProgressDashboard } from './components/ProgressDashboard';
import { StudyProvider } from './context/StudyContext';
import { motion } from 'motion/react';
import { Clock } from './components/Clock';
import { LanguageSelector } from './components/LanguageSelector';
import { Rocket, GraduationCap, Settings, BookOpen, LayoutDashboard, Calendar } from 'lucide-react';
import { useTranslation } from './hooks/useTranslation';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'progress'>('schedule');
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col gap-8 md:gap-16">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 pb-6 md:pb-8 gap-6 md:gap-0"
        >
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {t('appTitle')}
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
                {t('appSubtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
            <Clock />
            <LanguageSelector />
            <div className="hidden md:block h-8 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600">{t('systemOnline')}</span>
            </div>
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Live Agent Interface */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-6 md:gap-8 order-1"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50" />
              
              <div className="mb-8 text-center">
                <h2 className="text-lg font-medium text-slate-900 mb-2">{t('voiceCommandCenter')}</h2>
                <p className="text-sm text-slate-500">
                  "{t('voicePrompt')}"
                </p>
              </div>

              <LiveAgent />
              
              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('morningCheck')}</span>
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                    {t('morningCheckDesc')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2 text-green-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('studySprint')}</span>
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                    {t('studySprintDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Study Timer Component */}
            <StudyTimer />

            {/* Student Profile */}
            <StudentProfile />

          </motion.div>

          {/* Right Column: Data Editor */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-7 space-y-6 order-2"
          >
            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl w-full md:w-fit overflow-x-auto">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`
                  flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === 'schedule' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
                `}
              >
                <Calendar className="w-4 h-4" />
                {t('scheduleExams')}
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`
                  flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === 'progress' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('progressReport')}
              </button>
            </div>

            {/* Content Area */}
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-1">
              {activeTab === 'schedule' ? <ScheduleEditor /> : <ProgressDashboard />}
            </div>
          </motion.div>

        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
