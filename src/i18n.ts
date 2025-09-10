import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import fr from './locales/fr/translation.json';

// Fonction pour détecter la langue du navigateur
const getBrowserLanguage = () => {
  const supportedLanguages = ['en', 'fr'];
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.split('-')[0]; // Prendre seulement la partie langue (ex: 'fr' de 'fr-FR')
  
  return supportedLanguages.includes(langCode) ? langCode : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: getBrowserLanguage(), // Détection automatique de la langue du navigateur
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'], // Langues supportées
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
