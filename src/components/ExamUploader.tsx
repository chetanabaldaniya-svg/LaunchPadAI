import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { examParserService } from '../services/examParser';
import { schoolDataService } from '../services/schoolData';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';

interface ExamUploaderProps {
  onUploadComplete?: () => void;
}

export const ExamUploader: React.FC<ExamUploaderProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError(t('invalidPdf'));
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const profile = schoolDataService.getProfile();
      const gradeLevel = profile?.grade;
      const exams = await examParserService.parsePDF(file, gradeLevel);
      
      if (exams && exams.length > 0) {
        // Deduplicate exams from the PDF itself
        const uniqueParsedExams = exams.filter((exam, index, self) =>
          index === self.findIndex((t) => (
            t.subject.toLowerCase() === exam.subject.toLowerCase() &&
            t.date === exam.date
          ))
        );

        // Append new exams to existing ones
        const currentExams = schoolDataService.getExams();
        // Avoid duplicates based on subject and date (case-insensitive)
        const newExams = uniqueParsedExams.filter(newExam => 
            !currentExams.some(existing => 
                existing.subject.toLowerCase() === newExam.subject.toLowerCase() && 
                existing.date === newExam.date
            )
        );
        
        if (newExams.length > 0) {
            schoolDataService.updateExams([...currentExams, ...newExams]);
            
            // Save the document
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              // Find the latest exam date to set expiry
              const dates = uniqueParsedExams.map(e => e.date).sort();
              const latestDate = dates[dates.length - 1];
              
              if (latestDate) {
                schoolDataService.addDocument(file.name, base64, latestDate);
              }
            };
            reader.readAsDataURL(file);

            setSuccess(true);
            if (onUploadComplete) onUploadComplete();
        } else {
            setError(t('noNewExams'));
        }
      } else {
        setError(t('noExamDataFound'));
      }
    } catch (err) {
      console.error(err);
      setError(t('failedToProcessPdf'));
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />
      
      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-3 p-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600"
          >
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">{t('analyzingPdf')}</span>
          </motion.div>
        ) : success ? (
           <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700"
          >
            <div className="flex items-center gap-3">
                <div className="p-1 bg-emerald-100 rounded-full">
                    <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{t('examsImported')}</span>
            </div>
            <button onClick={() => setSuccess(false)} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="upload"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-300"
          >
            <div className="p-4 bg-slate-50 rounded-full mb-3 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{t('uploadExamPdf')}</h3>
            <p className="text-xs text-slate-500 text-center max-w-[200px]">
              {t('uploadExamPdfDesc')}
            </p>
            
            {error && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full border border-red-100">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </div>
                </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
