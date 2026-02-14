'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, t as translate } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('voxapp-language') as Language;
    if (savedLang && ['nl', 'en', 'fr', 'de'].includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (['nl', 'en', 'fr', 'de'].includes(browserLang)) {
        setLanguageState(browserLang as Language);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('voxapp-language', lang);
  };

  const t = (key: string): string => {
    return translate(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Re-export for convenience
export { translations };
export type { Language };
