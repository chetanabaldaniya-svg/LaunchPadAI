import React, { useState } from 'react';
import { LiveAgent } from './components/LiveAgent';
import { ScheduleEditor } from './components/ScheduleEditor';
import { StudyTimer } from './components/StudyTimer';
import { StudentProfile } from './components/StudentProfile';
import { ProgressDashboard } from './components/ProgressDashboard';
import { MorningCheck } from './components/MorningCheck';
import { StudyProvider } from './context/StudyContext';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from './components/Clock';
import { LanguageSelector } from './components/LanguageSelector';
import { Rocket, GraduationCap, Settings, BookOpen, LayoutDashboard, Calendar, User, Mic, Menu, X } from 'lucide-react';
import { useTranslation } from './hooks/useTranslation';

type View = 'coach' | 'schedule' | 'progress' | 'profile' | 'morning-check' | 'study-sprint';

const AppContent = () => {
  const [activeView, setActiveView] = useState<View>('coach');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const menuItems = [
    { id: 'coach', label: t('voiceCommandCenter'), icon: Mic },
    { id: 'morning-check', label: t('morningCheck'), icon: GraduationCap },
    { id: 'study-sprint', label: t('studySprint'), icon: BookOpen },
    { id: 'schedule', label: t('scheduleExams'), icon: Calendar },
    { id: 'progress', label: t('progressReport'), icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'coach':
        return (
          <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8">
             <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50" />
                  <div className="mb-4 md:mb-8 text-center">
                    <h2 className="text-lg md:text-xl font-medium text-slate-900 mb-1 md:mb-2">{t('voiceCommandCenter')}</h2>
                    <p className="text-xs md:text-sm text-slate-500">"{t('voicePrompt')}"</p>
                  </div>
                  <LiveAgent />
             </div>
          </div>
        );
      case 'morning-check':
        return <MorningCheck />;
      case 'study-sprint':
        return (
          <div className="h-full flex items-center justify-center p-2 md:p-4">
            <div className="w-full max-w-md">
              <StudyTimer />
            </div>
          </div>
        );
      case 'schedule':
        return <ScheduleEditor />;
      case 'progress':
        return <ProgressDashboard />;
      case 'profile':
        return <StudentProfile />;
      default:
        return <LiveAgent />;
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30 selection:text-emerald-900 overflow-hidden flex">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-600/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none whitespace-nowrap">
                LaunchPad AI
              </h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Coach</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
             <Clock />
          </div>
          <div className="flex items-center justify-between gap-2">
            <LanguageSelector />
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-700">Online</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-600 rounded-lg">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 whitespace-nowrap">LaunchPad AI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto h-full">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </main>
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
