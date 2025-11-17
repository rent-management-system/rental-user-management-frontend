import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        signup: "Signup",
        login: "Login",
        name: "Name",
        phone: "Phone Number",
        password: "Password",
        submit: "Submit",
      }
    },
    am: {
      translation: {
        signup: "ይመዝገቡ",
        login: "ግባ",
        name: "ስም",
        phone: "ስልክ ቁጥር",
        password: "የይለፍ ቃል",
        submit: "አስገባ",
      }
    },
    or: {
      translation: {
        signup: "Galmaa'i",
        login: "Seeni",
        name: "Maqaa",
        phone: "Lakkoofsa Bilbilaa",
        password: "Jecha Darbii",
        submit: "Ergi",
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
});

export default i18n;
