import React, { useState, useEffect, useRef } from 'react';
import { schoolDataService } from '../services/schoolData';
import { StudentProfile as StudentProfileType } from '../types';
import { User, GraduationCap, Target, Edit2, Save, Mic, MicOff } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileType>({
    name: '',
    grade: '',
    goals: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeField, setActiveField] = useState<keyof StudentProfileType | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setProfile(schoolDataService.getProfile());
  }, []);

  const handleSave = () => {
    schoolDataService.updateProfile(profile);
    setIsEditing(false);
    stopListening();
  };

  const startListening = (field: keyof StudentProfileType) => {
    if (activeField === field) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setProfile(prev => ({
        ...prev,
        [field]: transcript
      }));
      setActiveField(null);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setActiveField(null);
    };

    recognition.onend = () => {
      setActiveField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setActiveField(field);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setActiveField(null);
  };

  const renderMicButton = (field: keyof StudentProfileType) => {
    if (!isEditing) return null;
    
    const isActive = activeField === field;
    
    return (
      <button
        onClick={() => startListening(field)}
        className={`
          p-2 rounded-lg transition-colors ml-2
          ${isActive 
            ? 'bg-red-50 text-red-500 animate-pulse' 
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
        `}
        title={isActive ? "Stop Recording" : "Record Input"}
      >
        {isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50" />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-slate-900">{t('studentProfile')}</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`
            p-2 rounded-lg transition-colors
            ${isEditing 
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
          `}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="flex gap-4">
          <div className="p-3 bg-slate-50 rounded-xl h-fit">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t('name')}
            </label>
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile.name}</p>
              )}
              {renderMicButton('name')}
            </div>
          </div>
        </div>

        {/* Grade */}
        <div className="flex gap-4">
          <div className="p-3 bg-slate-50 rounded-xl h-fit">
            <GraduationCap className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t('gradeLevel')}
            </label>
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={profile.grade}
                  onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile.grade}</p>
              )}
              {renderMicButton('grade')}
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="flex gap-4">
          <div className="p-3 bg-slate-50 rounded-xl h-fit">
            <Target className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t('currentGoals')}
            </label>
            <div className="flex items-start">
              {isEditing ? (
                <textarea
                  value={profile.goals}
                  onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed">{profile.goals}</p>
              )}
              {renderMicButton('goals')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
