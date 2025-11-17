import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";


const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const closeNav = () => setIsNavOpen(false);
  const changeLanguage = (lang: string) => i18n.changeLanguage(lang);

  // Prevent page scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "";
  }, [isNavOpen]);

  return (
    <header className="w-full absolute top-0 left-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-5">

        {/* LEFT — LOGO */}
        <div className="flex items-center">
          <img
            src="/W.jpg"
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* DESKTOP NAVIGATION */}
       <nav className="hidden md:flex items-center space-x-10 text-[18px]">
  <a href="/" className="text-black hover:text-gray-700">{t("header.home")}</a>
  <a href="/#about" className="text-black hover:text-gray-700">{t("header.about")}</a>
  <a href="/#product" className="text-black hover:text-gray-700">{t("header.properties")}</a>
  <a href="/#testimonials" className="text-black hover:text-gray-700">{t("header.testimonials")}</a>
  <a href="/contact" className="text-black hover:text-gray-700">{t("header.contact")}</a>
</nav>


        {/* RIGHT SIDE — LANGUAGE SELECT + ACCOUNT (NO SHADCN) */}
        <div className="hidden md:flex items-center space-x-4">

          {/* LANGUAGE SELECT */}
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent border border-gray-400 rounded px-2 py-1 text-sm text-black"

          >
            <option value="en">{t("header.english_option")}</option>
            <option value="am">{t("header.amharic_option")}</option>
            <option value="om">{t("header.afan_oromo_option")}</option>
          </select>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={toggleNav}
        >
          <span className="w-8 h-[3px] bg-black" />
          <span className="w-8 h-[3px] bg-black" />
          <span className="w-8 h-[3px] bg-black" />
        </button>
      </div>

      {/* MOBILE SLIDE MENU */}
      <div
        className={`fixed top-0 right-0 h-screen bg-[#222a2f] text-white w-[55%] z-50 transform transition-transform duration-300 ${
          isNavOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col mt-28 ml-6 space-y-6 text-[22px] uppercase tracking-wider">
          <li><a href="/" onClick={closeNav}>{t("header.home")}</a></li>
          <li><a href="/#about" onClick={closeNav}>{t("header.about")}</a></li>
          <li><a href="/#product" onClick={closeNav}>{t("header.properties")}</a></li>
          <li><a href="/#testimonials" onClick={closeNav}>{t("header.testimonials")}</a></li>
          <li><a href="/contact" onClick={closeNav}>{t("header.contact")}</a></li>

          {/* MOBILE LANGUAGE SELECT */}
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="mt-4 bg-transparent border border-gray-300 rounded px-3 py-2"
          >
            <option value="en">{t("header.english_option")}</option>
            <option value="am">{t("header.amharic_option")}</option>
            <option value="om">{t("header.afan_oromo_option")}</option>
          </select>
        </ul>
      </div>
    </header>
  );
};

export default Header;
