import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface StudyContextType {
  timeLeft: number;
  isActive: boolean;
  totalTime: number;
  topic: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  startSprint: (minutes: number, topic?: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'English';
  
  const savedLang = localStorage.getItem('preferredLanguage');
  if (savedLang) return savedLang;

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('hi')) return 'Hindi';
  if (browserLang.startsWith('gu')) return 'Gujarati';
  if (browserLang.startsWith('es')) return 'Spanish';
  if (browserLang.startsWith('fr')) return 'French';
  
  return 'English';
};

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [topic, setTopic] = useState<string | null>(null);
  const [language, setLanguageState] = useState(getInitialLanguage());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const startSprint = (minutes: number, topic: string = 'Focus Session') => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setTopic(topic);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setTotalTime(0);
    setTopic(null);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsActive(true);
    }
  };

  return (
    <StudyContext.Provider value={{ 
      timeLeft, 
      isActive, 
      totalTime, 
      topic,
      language,
      setLanguage,
      startSprint, 
      stopTimer, 
      pauseTimer, 
      resumeTimer 
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudySession = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudySession must be used within a StudyProvider');
  }
  return context;
};
