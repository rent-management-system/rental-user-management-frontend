import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enTranslations from "@/locales/en.json"
import amTranslations from "@/locales/am.json"
import omTranslations from "@/locales/om.json"

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    am: { translation: amTranslations },
    om: { translation: omTranslations },
  },
  lng: localStorage.getItem("preferred_language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("preferred_language", lng)
})

export default i18n
