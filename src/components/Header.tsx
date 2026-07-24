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

  // Prevent scrolling on the page background when mobile menu is open
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

  // Reusable NavLink style for desktop
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-200 text-xs xl:text-sm font-medium font-sans shrink-0 ${
      isActive
        ? "bg-[#0B1220] text-[#F1F0EC] shadow-sm"
        : "text-[#0B1220]/65 hover:bg-[#0B1220]/[0.05] hover:text-[#0B1220]"
    }`;

  // Reusable NavLink style for mobile tray with item background cards
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 border ${
      isActive
        ? "bg-[#0B1220] text-[#F1F0EC] border-[#0B1220] font-medium shadow-md"
        : "bg-white/80 text-[#0B1220]/80 border-[#0B1220]/10 hover:bg-white hover:text-[#0B1220] shadow-sm"
    }`;

  return (
    <header
      className={`font-sans sticky top-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? "bg-[#F1F0EC]/90 backdrop-blur-xl border-b border-[#0B1220]/10 shadow-sm"
          : "bg-[#F1F0EC] border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div className="relative overflow-hidden rounded-xl shrink-0">
              <img
                src={yaraimage}
                alt="YaraCheck"
                className="h-10 w-auto sm:h-11 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-sans font-semibold text-lg sm:text-xl tracking-tight text-[#0B1220] leading-none truncate">
                YaraCheck
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] font-medium tracking-[0.2em] text-[#0B1220]/45 mt-1 truncate">
                VERIFY • REPORT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-x-1 xl:gap-x-2">
            <NavLink to="/submit-report" className={navLinkClass}>
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{t("header.submitReport")}</span>
            </NavLink>

            <NavLink to="/verify-item" className={navLinkClass}>
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="truncate">{t("header.verifyItem")}</span>
            </NavLink>

            <NavLink to="/my-reports" className={navLinkClass}>
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">{t("header.trackReports")}</span>
            </NavLink>

            <NavLink to="/support" className={navLinkClass}>
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">{t("header.support")}</span>
            </NavLink>

            <div className="ml-1 pl-3 border-l border-[#0B1220]/10 shrink-0">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {user && isAdmin ? (
              <>
                <Button
                  onClick={() => navigate("/admin")}
                  className="bg-[#0B1220] hover:brightness-125 text-[#F1F0EC] rounded-full px-4 xl:px-5 h-10 shadow-sm transition-all hover:shadow-md font-sans text-xs xl:text-sm"
                >
                  <Shield className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{t("header.adminPanel")}</span>
                </Button>

                <Button
                  onClick={handleAuth}
                  variant="outline"
                  className="rounded-full border-[#0B1220]/15 hover:bg-[#0B1220]/[0.05] text-[#0B1220]/75 h-10 px-4 text-xs xl:text-sm"
                >
                  <LogOut className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{t("header.signOut")}</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAdminLogin}
                variant="outline"
                className="rounded-full border-[#0B1220]/20 text-[#0B1220]/75 hover:bg-[#0B1220]/[0.05] hover:text-[#0B1220] transition-colors font-sans h-10 px-4 text-xs xl:text-sm"
              >
                <Shield className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{t("header.adminLogin")}</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#0B1220] hover:bg-[#0B1220]/[0.06] rounded-full h-10 w-10 relative z-[110]"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Tray Overlay with Solid Aesthetic Background */}
      <div
        className={`lg:hidden fixed inset-0 z-[105] bg-[#F1F0EC] transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto translate-x-0"
            : "opacity-0 pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#F1F0EC] shadow-2xl">
          {/* Mobile Tray Header */}
          <div className="flex justify-between items-center px-6 h-20 border-b border-[#0B1220]/10 bg-[#F1F0EC] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative overflow-hidden rounded-xl bg-white p-1 border border-[#0B1220]/10 shadow-sm">
                <img src={yaraimage} alt="YaraCheck" className="h-8 w-auto" />
              </div>
              <span className="font-sans font-semibold text-lg text-[#0B1220] tracking-tight">
                Navigation
              </span>
            </div>
          </div>

          {/* Scrollable Mobile Tray Links Container */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-3 bg-[#F1F0EC]">
            <NavLink
              to="/submit-report"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <FileText className="h-5 w-5 opacity-70 shrink-0" />
              <span className="text-base font-medium">
                {t("header.submitReport")}
              </span>
            </NavLink>

            <NavLink
              to="/verify-item"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <ShieldCheck className="h-5 w-5 opacity-70 shrink-0" />
              <span className="text-base font-medium">
                {t("header.verifyItem")}
              </span>
            </NavLink>

            <NavLink
              to="/my-reports"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <CheckCircle className="h-5 w-5 opacity-70 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-base font-medium truncate">
                  {t("header.trackReports")}
                </span>
                <span className="font-mono text-[11px] opacity-60 mt-0.5 truncate">
                  tracking code required
                </span>
              </div>
            </NavLink>

            <NavLink
              to="/support"
              className={mobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="h-5 w-5 opacity-70 shrink-0" />
              <span className="text-base font-medium">
                {t("header.support")}
              </span>
            </NavLink>
          </div>

          {/* Mobile Auth Actions Tray Bottom Footer */}
          <div className="p-6 border-t border-[#0B1220]/10 bg-white/60 space-y-3 shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {user && isAdmin ? (
              <>
                <Button
                  onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}
                  className="w-full bg-[#0B1220] hover:brightness-125 h-12 text-base rounded-xl shadow-md text-[#F1F0EC] font-medium"
                >
                  <Shield className="mr-2 h-5 w-5 shrink-0" />
                  <span className="truncate">{t("header.adminPanel")}</span>
                </Button>

                <Button
                  onClick={handleAuth}
                  variant="outline"
                  className="w-full h-12 text-base rounded-xl bg-white border-[#0B1220]/15 text-[#0B1220]/80 font-medium shadow-sm"
                >
                  <LogOut className="mr-2 h-5 w-5 shrink-0" />
                  <span className="truncate">{t("header.signOut")}</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAdminLogin}
                variant="outline"
                className="w-full h-12 text-base rounded-xl border-[#0B1220]/20 text-[#0B1220]/80 bg-white hover:bg-slate-50 font-medium shadow-sm"
              >
                <Shield className="mr-2 h-5 w-5 shrink-0" />
                <span className="truncate">{t("header.adminLogin")}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
