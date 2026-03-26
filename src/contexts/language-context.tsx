
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { translations } from '@/lib/translations';

type Language = 'en' | 'es' | 'pt';
type TranslationKey = keyof typeof translations;
type Replacements = { [key: string]: string | number };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, replacements?: Replacements) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setStateLanguage] = useState<Language>('es');

  useEffect(() => {
    // Read from cookie first
    const cookies = document.cookie.split('; ');
    const langCookie = cookies.find(row => row.startsWith('language='))?.split('=')[1] as Language;
    
    if (langCookie && ['en', 'es', 'pt'].includes(langCookie)) {
        setStateLanguage(langCookie);
        return;
    }

    // Fallback to browser preference
    const browserLang = navigator.language.split('-')[0] as Language;
    if (['en', 'es', 'pt'].includes(browserLang)) {
      setLanguage(browserLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setStateLanguage(lang);
    // Persist in cookie for server-side access
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };
  
  const t = (key: TranslationKey, replacements?: Replacements): string => {
    let translation = translations[key]?.[language] || key;
    
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{${placeholder}}`, 'g');
            translation = translation.replace(regex, String(replacements[placeholder]));
        });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};


export const useLanguageContextImpl = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
