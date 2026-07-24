import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import yaraimage from "../../public/yara.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Add subtle shadow/border only when scrolled
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleAuth = () => {
    if (user) {
      logout();
    } else {
      navigate("/user-auth");
    }
    setIsOpen(false);
  };

  const handleAdminLogin = () => {
    navigate("/verify");
    setIsOpen(false);
  };

  // Reusable NavLink style for desktop — active state reads like a stamped case tab
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium font-sans ${
      isActive
        ? "bg-[#0B1220] text-[#F1F0EC] shadow-sm"
        : "text-[#0B1220]/55 hover:bg-[#0B1220]/[0.05] hover:text-[#0B1220]"
    }`;

  // Reusable NavLink style for mobile
  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-[#0B1220] text-[#F1F0EC] font-medium"
        : "text-[#0B1220]/70 hover:bg-[#0B1220]/[0.05] hover:text-[#0B1220]"
    }`;

  return (
    <header
      className={`font-sans sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F1F0EC]/90 backdrop-blur-xl border-b border-[#0B1220]/10 shadow-sm"
          : "bg-[#F1F0EC] border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={yaraimage}
                alt="YaraCheck"
                className="h-11 w-auto transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <span className="font-sans font-semibold text-xl tracking-tight text-[#0B1220] leading-none">
                YaraCheck
              </span>
              <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-[#0B1220]/40 mt-1">
                VERIFY • REPORT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-x-2">
            <NavLink to="/submit-report" className={navLinkClass}>
              <FileText className="h-4 w-4" />
              {t("header.submitReport")}
            </NavLink>

            <NavLink to="/verify-item" className={navLinkClass}>
              <ShieldCheck className="h-4 w-4" />
              {t("header.verifyItem")}
            </NavLink>

            <NavLink to="/my-reports" className={navLinkClass}>
              <CheckCircle className="h-4 w-4" />
              {t("header.trackReports")}
            </NavLink>

            <NavLink to="/support" className={navLinkClass}>
              <HelpCircle className="h-4 w-4" />
              {t("header.support")}
            </NavLink>

            <div className="ml-2 pl-4 border-l border-[#0B1220]/10">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user && isAdmin ? (
              <>
                <Button
                  onClick={() => navigate("/admin")}
                  className="bg-[#0B1220] hover:brightness-125 text-[#F1F0EC] rounded-full px-5 shadow-sm transition-all hover:shadow-md font-sans"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {t("header.adminPanel")}
                </Button>

                <Button
                  onClick={handleAuth}
                  variant="outline"
                  className="rounded-full border-[#0B1220]/15 hover:bg-[#0B1220]/[0.05] text-[#0B1220]/70"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("header.signOut")}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAdminLogin}
                variant="outline"
                className="rounded-full border-[#0B1220]/20 text-[#0B1220]/70 hover:bg-[#0B1220]/[0.05] hover:text-[#0B1220] transition-colors font-sans"
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("header.adminLogin")}
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#0B1220] hover:bg-[#0B1220]/[0.06] rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-[#F1F0EC] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex justify-between items-center px-6 h-20 border-b border-[#0B1220]/10">
            <span className="font-sans font-semibold text-xl text-[#0B1220]">
              Menu
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-[#0B1220]/60 hover:bg-[#0B1220]/[0.06] rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <NavLink
              to="/submit-report"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <FileText className="h-5 w-5 opacity-60" />
              <span className="text-base">{t("header.submitReport")}</span>
            </NavLink>

            <NavLink
              to="/verify-item"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <ShieldCheck className="h-5 w-5 opacity-60" />
              <span className="text-base">{t("header.verifyItem")}</span>
            </NavLink>

            <NavLink
              to="/my-reports"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <CheckCircle className="h-5 w-5 opacity-60" />
              <div className="flex flex-col">
                <span className="text-base">{t("header.trackReports")}</span>
                <span className="font-mono text-[11px] text-[#0B1220]/40 mt-0.5">
                  tracking code required
                </span>
              </div>
            </NavLink>

            <NavLink
              to="/support"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="h-5 w-5 opacity-60" />
              <span className="text-base">{t("header.support")}</span>
            </NavLink>
          </div>

          {/* Mobile Auth Actions (Sticky at bottom) */}
          <div className="p-6 border-t border-[#0B1220]/10 bg-[#0B1220]/[0.02] space-y-3 pb-safe">
            {user && isAdmin ? (
              <>
                <Button
                  onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}
                  className="w-full bg-[#0B1220] hover:brightness-125 py-6 text-base rounded-xl shadow-sm text-[#F1F0EC]"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  {t("header.adminPanel")}
                </Button>

                <Button
                  onClick={handleAuth}
                  variant="outline"
                  className="w-full py-6 text-base rounded-xl bg-white border-[#0B1220]/15"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {t("header.signOut")}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAdminLogin}
                variant="outline"
                className="w-full py-6 text-base rounded-xl border-[#0B1220]/20 text-[#0B1220]/70 bg-[#0B1220]/[0.03]"
              >
                <Shield className="mr-2 h-5 w-5" />
                {t("header.adminLogin")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
