/**
 * i18n setup (TDD Part 4 §9.2). i18next + expo-localization; v1 en-US; ICU plurals;
 * RTL-ready. All strings are externalized keys — no literals in components. Regional
 * tradition/festival naming is content-driven (server), not client strings.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

const resources = {
  'en-US': { translation: {} }, // keys added per screen during feature work
};

void i18n.use(initReactI18next).init({
  resources,
  lng: getLocales()[0]?.languageTag ?? 'en-US',
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
