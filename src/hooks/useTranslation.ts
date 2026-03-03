import { useStudySession } from '../context/StudyContext';
import { translations, Language, TranslationKey } from '../translations';

export const useTranslation = () => {
  const { language } = useStudySession();
  
  // Default to English if language not found
  const currentTranslations = translations[language as Language] || translations.English;

  const t = (key: TranslationKey): string => {
    return currentTranslations[key] || translations.English[key] || key;
  };

  return { t, language };
};
