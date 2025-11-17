import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white text-black mt-20 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-black">{t("footer.footer_title")}</h3>
            <p className="text-sm text-gray-600">
              {t("footer.footer_description")}
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>+251 911 123 456</p>
              <p>support@Bete.com</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-black">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-black transition-colors">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-black transition-colors">
                  {t("footer.for_landlords_link")}
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-black transition-colors">
                  {t("footer.propertyManagers")}
                </Link>
              </li>
              <li>
                <Link to="/landlord" className="hover:text-black transition-colors">
                  {t("footer.reviews")} 
                </Link>
              </li>
              <li>
                 <Link to="/properties" className="hover:text-black transition-colors">
                  {t("footer.howItWorks")}
                </Link>
              
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-black">{t("footer.workingHours")}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/contact" className="hover:text-black transition-colors">
                  {t("footer.workingHours_mon_fri")}
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:text-black transition-colors">
                  {t("footer.workingHours_sat")}
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  {t("footer.workingHours_sun")}
                </a>
              </li>
             
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-black">{t("footer.subscription")}</h4> 
            <p className="text-sm text-gray-600">
              {t("footer.subscription_text")}
            </p>
            <form className="mt-4">
              <input
                type="email"
                placeholder={t("footer.enterEmail")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                type="submit"
                className="w-full mt-2 px-4 py-2 bg-black text-black rounded-md hover:bg-gray-800 transition-colors"
              >
                {t("footer.send")}
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()}  {t("footer.allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;