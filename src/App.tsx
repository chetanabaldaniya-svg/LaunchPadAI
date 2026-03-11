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
import { GamificationWidget } from './components/GamificationWidget';
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
             <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl shadow-indigo-900/5 relative overflow-hidden"
              >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 opacity-50" />
                  <div className="mb-4 md:mb-8 text-center">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2">{t('voiceCommandCenter')}</h2>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">"{t('voicePrompt')}"</p>
                  </div>
                  <LiveAgent />
             </motion.div>
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

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 overflow-hidden flex">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-400/20 rounded-full blur-[120px]" />
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
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-lg shadow-indigo-600/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none whitespace-nowrap">
                LaunchPad AI
              </h1>
              <span className="text-[10px] text-indigo-600 font-bold tracking-wide uppercase">Elite Coach</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <motion.nav 
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 p-4 space-y-2 overflow-y-auto"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <motion.button
                variants={itemVariants}
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"
                  />
                )}
              </motion.button>
            );
          })}
        </motion.nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <GamificationWidget />
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
             <Clock />
          </div>
          <div className="flex items-center justify-between gap-2">
            <LanguageSelector />
            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg">
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
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
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
