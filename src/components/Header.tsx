
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, AlertTriangle, Search, Shield, LogOut, FileText, CheckCircle, MessageSquare, HelpCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import yaraimage from '../../public/yara.png'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const {
    user,
    isAdmin,
    logout
  } = useAuth();
  const navigate = useNavigate();
  
  const handleAuth = () => {
    if (user) {
      logout();
    } else {
      navigate("/user-auth");
    }
  };
  
  const handleAdminLogin = () => {
    navigate("/verify");
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="yaracheck-container">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <img src={yaraimage} alt="YaraCheck" className="h-20 w-20" />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/submit-report" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors">
              <FileText className="h-5 w-5 text-yaracheck-orange" />
              <span>{t('header.submitReport')}</span>
            </Link>
            
            <Link to="/verify-item" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors">
              <ShieldCheck className="h-5 w-5 text-yaracheck-blue" />
              <span>{t('header.verifyItem')}</span>
            </Link>
            
            <Link to="/my-reports" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-center">
                <span>{t('header.trackReports')}</span>
                <div className="text-xs text-gray-500">Tracking code required</div>
              </div>
            </Link>
            
            <Link to="/support" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors">
              <HelpCircle className="h-5 w-5 text-purple-500" />
              <span>{t('header.support')}</span>
            </Link>
            
            <LanguageSwitcher />
            
            {user && isAdmin ? (
              <div className="flex space-x-2">
                <Button onClick={() => navigate("/admin")} className="bg-yaracheck-orange hover:bg-yaracheck-darkOrange">
                  {t('header.adminPanel')}
                  <Shield className="ml-2 h-4 w-4" />
                </Button>
                
                <Button onClick={handleAuth} variant="outline" className="border-yaracheck-blue text-yaracheck-blue hover:bg-yaracheck-lightBlue">
                  {t('header.signOut')}
                  <LogOut className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleAdminLogin} variant="outline" className="border-yaracheck-orange text-yaracheck-orange hover:bg-orange-50">
                  {t('header.adminLogin')}
                  <Shield className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button and language switcher */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} className="text-yaracheck-darkGray">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/submit-report" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors py-2" onClick={() => setIsOpen(false)}>
              <FileText className="h-5 w-5 text-yaracheck-orange" />
              <span>{t('header.submitReport')}</span>
            </Link>
            
            <Link to="/verify-item" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors py-2" onClick={() => setIsOpen(false)}>
              <ShieldCheck className="h-5 w-5 text-yaracheck-blue" />
              <span>{t('header.verifyItem')}</span>
            </Link>
            
            <Link to="/my-reports" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors py-2" onClick={() => setIsOpen(false)}>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-center">
                <span>{t('header.trackReports')}</span>
                <div className="text-xs text-gray-500">Tracking code required</div>
              </div>
            </Link>
            
            <Link to="/support" className="flex items-center space-x-2 text-yaracheck-darkGray hover:text-yaracheck-blue transition-colors py-2" onClick={() => setIsOpen(false)}>
              <HelpCircle className="h-5 w-5 text-purple-500" />
              <span>{t('header.support')}</span>
            </Link>
            
            {user && isAdmin ? (
              <>
                <Button onClick={() => {
                  navigate("/admin");
                  setIsOpen(false);
                }} className="w-full bg-yaracheck-orange hover:bg-yaracheck-darkOrange">
                  {t('header.adminPanel')}
                  <Shield className="ml-2 h-4 w-4" />
                </Button>
                
                <Button onClick={() => {
                  handleAuth();
                  setIsOpen(false);
                }} variant="outline" className="w-full border-yaracheck-blue text-yaracheck-blue hover:bg-yaracheck-lightBlue">
                  {t('header.signOut')}
                  <LogOut className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => {
                  handleAdminLogin();
                  setIsOpen(false);
                }} variant="outline" className="w-full border-yaracheck-orange text-yaracheck-orange hover:bg-orange-50">
                  {t('header.adminLogin')}
                  <Shield className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
