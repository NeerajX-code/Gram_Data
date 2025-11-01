import { useEffect, useState, useCallback } from "react";
import { translations } from "../translations";

const DEFAULT = "en";

export function useLanguage() {
  const [lang, setLang] = useState(DEFAULT);

  useEffect(() => {
    try {
      const nav = typeof navigator !== 'undefined' ? navigator.language || navigator.userLanguage : null;
      if (nav) {
        const code = nav.startsWith('hi') ? 'hi' : 'en';
        setLang(code);
      }
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key) => {
    return translations[lang] && translations[lang][key] ? translations[lang][key] : translations['en'][key] || key;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((l) => (l === 'en' ? 'hi' : 'en'));
  }, []);

  return { lang, setLang, t, toggle };
}
