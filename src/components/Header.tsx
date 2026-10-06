import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Shield,
  LogOut,
  FileText,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import yaraimage from "../../public/yara.png";

const Header = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Placeholder state/handlers — replace with your AuthContext or state management hook
  const user = null;
  const isAdmin = false;

  const handleAdminClick = () => {};
  const handleLoginClick = () => {};
  const handleSignOut = () => {};

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 lg:gap-2 px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-full text-xs xl:text-sm font-medium transition-all duration-200 shrink-0 ${
      isActive
        ? "bg-[#0B1220] text-white shadow-xs"
        : "text-[#0B1220]/75 hover:text-[#0B1220] hover:bg-white/80"
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#0B1220] text-white shadow-md font-semibold"
        : "text-[#0B1220]/80 hover:bg-white/80 active:bg-white/60"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#0B1220]/10 bg-[#F1F0EC]/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none rounded-xl transition-transform active:scale-95 shrink-0"
          >
            <div className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-xs border border-white/10 group-hover:shadow-md transition-all">
              <img
                src={yaraimage}
                alt="YaraCheck"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl font-bold text-[#0B1220] tracking-tight leading-none sm:leading-normal">
                YaraCheck
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] font-bold tracking-widest text-[#FF5A36] uppercase mt-0.5 sm:mt-0">
                VERIFY • REPORT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-white/50 p-1 xl:p-1.5 rounded-full border border-[#0B1220]/10 shadow-xs shrink-0">
            <NavLink to="/submit-report" className={navLinkClasses}>
              <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#FF5A36] shrink-0" />
              <span className="whitespace-nowrap">
                {t("header.submitReport", "Submit Report")}
              </span>
            </NavLink>

            <NavLink to="/verify-item" className={navLinkClasses}>
              <ShieldCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#2158D9] shrink-0" />
              <span className="whitespace-nowrap">
                {t("header.verifyItem", "Verify Item")}
              </span>
            </NavLink>

            <NavLink to="/my-reports" className={navLinkClasses}>
              <CheckCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#1BA672] shrink-0" />
              <span className="whitespace-nowrap">
                {t("header.trackReports", "Track Reports")}
              </span>
            </NavLink>

            <NavLink to="/support" className={navLinkClasses}>
              <HelpCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#E5A910] shrink-0" />
              <span className="whitespace-nowrap">
                {t("header.support", "Support")}
              </span>
            </NavLink>

            <div className="h-4 w-[1px] bg-[#0B1220]/15 mx-0.5 xl:mx-1 shrink-0" />

            <div className="px-0.5 xl:px-1 shrink-0">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {user && isAdmin ? (
              <>
                <Button
                  onClick={handleAdminClick}
                  className="bg-[#0B1220] hover:bg-black text-white text-xs font-semibold rounded-full px-4 xl:px-5 py-2 transition-all shadow-xs whitespace-nowrap"
                >
                  <Shield className="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5 text-[#FF5A36]" />
                  <span>{t("header.adminPanel", "Admin Panel")}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-[#0B1220]/20 text-[#0B1220] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-full text-xs font-semibold px-3.5 xl:px-4 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  <span>{t("header.signOut", "Sign Out")}</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLoginClick}
                className="bg-[#FF5A36] hover:bg-[#FF5A36]/90 text-white text-xs font-semibold rounded-full px-4 xl:px-6 py-2 transition-all shadow-md shadow-[#FF5A36]/20 whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5" />
                <span>{t("header.adminLogin", "Admin Login")}</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle & Language Switcher */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl text-[#0B1220] hover:bg-white/70 h-9 w-9 sm:h-10 sm:w-10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF5A36]" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Scrollable overlay with safe max height) */}
      {isOpen && (
        <div className="lg:hidden border-t border-[#0B1220]/10 bg-[#F1F0EC] backdrop-blur-xl transition-all animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
            <div className="flex flex-col space-y-1.5 sm:space-y-2">
              <NavLink
                to="/submit-report"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClasses}
              >
                <FileText className="w-5 h-5 text-[#FF5A36] shrink-0" />
                <span>{t("header.submitReport", "Submit Report")}</span>
              </NavLink>

              <NavLink
                to="/verify-item"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClasses}
              >
                <ShieldCheck className="w-5 h-5 text-[#2158D9] shrink-0" />
                <span>{t("header.verifyItem", "Verify Item")}</span>
              </NavLink>

              <NavLink
                to="/my-reports"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClasses}
              >
                <CheckCircle className="w-5 h-5 text-[#1BA672] shrink-0" />
                <div className="flex flex-col">
                  <span>{t("header.trackReports", "Track Reports")}</span>
                  <span className="font-mono text-[11px] text-[#0B1220]/50 font-normal">
                    tracking code required
                  </span>
                </div>
              </NavLink>

              <NavLink
                to="/support"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClasses}
              >
                <HelpCircle className="w-5 h-5 text-[#E5A910] shrink-0" />
                <span>{t("header.support", "Support")}</span>
              </NavLink>
            </div>

            <div className="h-[1px] bg-[#0B1220]/10 w-full" />

            <div className="pt-1 flex flex-col gap-2.5 sm:gap-3">
              {user && isAdmin ? (
                <>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      handleAdminClick();
                    }}
                    className="w-full h-11 sm:h-12 bg-[#0B1220] text-white font-semibold rounded-full shadow-md text-sm sm:text-base"
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#FF5A36]" />
                    <span>{t("header.adminPanel", "Admin Panel")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="w-full h-11 sm:h-12 border-[#0B1220]/20 text-[#0B1220] hover:bg-rose-50 hover:text-rose-600 rounded-full font-semibold text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span>{t("header.signOut", "Sign Out")}</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    handleLoginClick();
                  }}
                  className="w-full h-11 sm:h-12 bg-[#FF5A36] text-white font-semibold rounded-full shadow-md shadow-[#FF5A36]/20 text-sm sm:text-base"
                >
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>{t("header.adminLogin", "Admin Login")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
