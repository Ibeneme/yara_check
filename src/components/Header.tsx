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
    `flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#0B1220] text-white shadow-sm"
        : "text-[#0B1220]/75 hover:text-[#0B1220] hover:bg-white/80"
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#0B1220] text-white shadow-md font-semibold"
        : "text-[#0B1220]/80 hover:bg-white/80"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#0B1220]/10 bg-[#F1F0EC]/80 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none rounded-xl transition-transform active:scale-95"
          >
            <div className="relative flex items-center justify-center p-2 rounded-2xl bg-[#0B1220] shadow-sm border border-white/10 group-hover:shadow-md transition-all">
              <img
                src={yaraimage}
                alt="YaraCheck"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-[#0B1220] tracking-tight">
                YaraCheck
              </span>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#FF5A36] uppercase">
                VERIFY • REPORT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/50 p-1.5 rounded-full border border-[#0B1220]/10 shadow-xs">
            <NavLink to="/submit-report" className={navLinkClasses}>
              <FileText className="w-4 h-4 text-[#FF5A36]" />
              <span>{t("header.submitReport", "Submit Report")}</span>
            </NavLink>

            <NavLink to="/verify-item" className={navLinkClasses}>
              <ShieldCheck className="w-4 h-4 text-[#2158D9]" />
              <span>{t("header.verifyItem", "Verify Item")}</span>
            </NavLink>

            <NavLink to="/my-reports" className={navLinkClasses}>
              <CheckCircle className="w-4 h-4 text-[#1BA672]" />
              <span>{t("header.trackReports", "Track Reports")}</span>
            </NavLink>

            <NavLink to="/support" className={navLinkClasses}>
              <HelpCircle className="w-4 h-4 text-[#E5A910]" />
              <span>{t("header.support", "Support")}</span>
            </NavLink>

            <div className="h-4 w-[1px] bg-[#0B1220]/15 mx-1" />

            <div className="px-1">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user && isAdmin ? (
              <>
                <Button
                  onClick={handleAdminClick}
                  className="bg-[#0B1220] hover:bg-black text-white text-xs font-semibold rounded-full px-5 py-2 transition-all shadow-xs"
                >
                  <Shield className="w-4 h-4 mr-1.5 text-[#FF5A36]" />
                  <span>{t("header.adminPanel", "Admin Panel")}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-[#0B1220]/20 text-[#0B1220] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-full text-xs font-semibold px-4 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  <span>{t("header.signOut", "Sign Out")}</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLoginClick}
                className="bg-[#FF5A36] hover:bg-[#FF5A36]/90 text-white text-xs font-semibold rounded-full px-6 py-2 transition-all shadow-md shadow-[#FF5A36]/20"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                <span>{t("header.adminLogin", "Admin Login")}</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu & Language Switcher */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl text-[#0B1220] hover:bg-white/70"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-[#FF5A36]" />
              ) : (
                <Menu className="w-6 h-6 text-[#0B1220]" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden border-t border-[#0B1220]/10 bg-[#F1F0EC] backdrop-blur-xl transition-all animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/submit-report"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClasses}
              >
                <FileText className="w-5 h-5 text-[#FF5A36]" />
                <span>{t("header.submitReport", "Submit Report")}</span>
              </NavLink>

              <NavLink
                to="/verify-item"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClasses}
              >
                <ShieldCheck className="w-5 h-5 text-[#2158D9]" />
                <span>{t("header.verifyItem", "Verify Item")}</span>
              </NavLink>

              <NavLink
                to="/my-reports"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClasses}
              >
                <CheckCircle className="w-5 h-5 text-[#1BA672]" />
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
                <HelpCircle className="w-5 h-5 text-[#E5A910]" />
                <span>{t("header.support", "Support")}</span>
              </NavLink>
            </div>

            <div className="h-[1px] bg-[#0B1220]/10 w-full" />

            <div className="pt-2 flex flex-col gap-3">
              {user && isAdmin ? (
                <>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      handleAdminClick();
                    }}
                    className="w-full h-12 bg-[#0B1220] text-white font-semibold rounded-full shadow-md"
                  >
                    <Shield className="w-5 h-5 mr-2 text-[#FF5A36]" />
                    <span>{t("header.adminPanel", "Admin Panel")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="w-full h-12 border-[#0B1220]/20 text-[#0B1220] hover:bg-rose-50 hover:text-rose-600 rounded-full font-semibold"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span>{t("header.signOut", "Sign Out")}</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    handleLoginClick();
                  }}
                  className="w-full h-12 bg-[#FF5A36] text-white font-semibold rounded-full shadow-md shadow-[#FF5A36]/20"
                >
                  <Shield className="w-5 h-5 mr-2" />
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
