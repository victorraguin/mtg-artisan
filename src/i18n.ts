import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      debug: {
        quickNotificationTest: {
          sendSuccess: 'Notification "{{eventName}}" sent to {{count}} user(s)!',
          sendError: 'Error while sending',
          markAllSuccess: "'Mark all as read' test completed! Check console.",
          markAllError: "Error during 'Mark all as read' test",
        },
        directNotificationTest: {
          createSuccess: 'Notification created directly!',
          createError: 'Error while creating',
        },
      },
    },
  },
  fr: {
    translation: {
      debug: {
        quickNotificationTest: {
          sendSuccess:
            'Notification "{{eventName}}" envoyée à {{count}} utilisateur(s) !',
          sendError: "Erreur lors de l'envoi",
          markAllSuccess: "Test 'Tout lire' terminé ! Vérifiez la console.",
          markAllError: "Erreur lors du test 'Tout lire'",
        },
        directNotificationTest: {
          createSuccess: 'Notification créée directement !',
          createError: 'Erreur lors de la création',
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
