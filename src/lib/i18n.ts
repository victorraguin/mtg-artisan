import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enNotifications from "../locales/en/notifications";
import frNotifications from "../locales/fr/notifications";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { notifications: enNotifications },
      fr: { notifications: frNotifications },
    },
    lng: "fr",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
