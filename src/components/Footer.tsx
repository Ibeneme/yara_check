import React from "react";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Mail, Phone, MapPin, Youtube } from "lucide-react";
const Footer = () => {
  const { t } = useTranslation();
  return <footer className="bg-yaracheck-darkBlue text-white py-8 mt-12">
      <div className="yaracheck-container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">YaraCheck</h3>
            <p className="text-sm text-gray-300 mb-4">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Stoke Park Mews, St Michaels Road, Coventry CV2 4NU</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+447405672016 (WhatsApp)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@yaracheck.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  {t('footer.home')}
                </a>
              </li>
              <li>
                <a href="/verify-item" className="hover:text-white transition-colors">
                  {t('footer.verifyItem')}
                </a>
              </li>
              <li>
                <a href="/submit-report" className="hover:text-white transition-colors">
                  {t('footer.submitReport')}
                </a>
              </li>
              <li>
                <a href="/my-reports" className="hover:text-white transition-colors">
                  {t('footer.myReports')}
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-white transition-colors">
                  {t('footer.support')}
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>{t('footer.reportingServices')}</li>
              <li>{t('footer.deviceTracking')}</li>
              <li>{t('footer.vehicleRecovery')}</li>
              <li>{t('footer.anonymousTips')}</li>
              <li>{t('footer.supportServices')}</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.socialMedia')}</h4>
            <div className="flex space-x-4 mb-4">
              <a href="https://facebook.com/yaracheck" target="_blank" rel="noopener noreferrer" className="bg-yaracheck-blue hover:bg-yaracheck-lightBlue p-2 rounded-full transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://x.com/YaraCheck" target="_blank" rel="noopener noreferrer" className="bg-yaracheck-blue hover:bg-yaracheck-lightBlue p-2 rounded-full transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@YaraCheck" target="_blank" rel="noopener noreferrer" className="bg-yaracheck-blue hover:bg-yaracheck-lightBlue p-2 rounded-full transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-gray-300">
              {t('footer.stayConnected')}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300 mb-4 md:mb-0">© 2024 YaraCheck. {t('footer.allRightsReserved')}</p>
          <div className="flex space-x-6 text-sm text-gray-300">
            <a href="/privacy" className="hover:text-white transition-colors">
              {t('footer.privacyPolicy')}
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              {t('footer.termsOfService')}
            </a>
            <a href="/cookies" className="hover:text-white transition-colors">
              {t('footer.cookiePolicy')}
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;