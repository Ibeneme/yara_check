import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Youtube,
  Heart,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import yaraimage from "../../public/yara.png";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0B1220] text-[#F1F0EC] border-t border-[#0B1220]/20 pt-12 sm:pt-16 pb-8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 pb-12 sm:pb-16 border-b border-white/10">
          {/* Brand & Contact Info Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              to="/"
              className="inline-flex items-center gap-3 group focus:outline-none"
            >
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-white tracking-tight">
                  YaraCheck
                </span>
                <span className="font-mono text-[9px] font-bold tracking-widest text-[#FF5A36] uppercase">
                  VERIFY • REPORT
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#F1F0EC]/70 leading-relaxed max-w-sm">
              A global community platform helping people report, verify, and
              recover stolen items, missing persons, pets, and scam accounts.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#F1F0EC]/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FF5A36] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Stoke Park Mews, St Michaels Road,
                  <br />
                  Coventry CV2 4NU, UK
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FF5A36] shrink-0" />
                <a
                  href="https://wa.me/447405672016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +44 7405 672016 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#FF5A36] shrink-0" />
                <a
                  href="mailto:info@yaracheck.com"
                  className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
                >
                  info@yaracheck.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display text-base font-semibold text-white tracking-wide uppercase text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Home", path: "/" },
                {
                  name: t("footer.verifyItem") || "Verify Item",
                  path: "/verify-item",
                },
                {
                  name: t("footer.submitReport") || "Submit Report",
                  path: "/submit-report",
                },
                {
                  name: t("footer.myReports") || "My Reports",
                  path: "/my-reports",
                },
                { name: t("footer.support") || "Support", path: "/support" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center gap-2 text-xs sm:text-sm text-[#F1F0EC]/70 hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF5A36] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span className="-ml-5 group-hover:ml-0 transition-all duration-200">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-base font-semibold text-white tracking-wide uppercase text-xs">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#F1F0EC]/70">
              {[
                "Stolen Device Recovery",
                "Missing Persons & Pets",
                "Scam Account Reporting",
                "Pre-Purchase Verification",
                "Anonymous Community Tips",
              ].map((service, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-[#F1F0EC]/70"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36]/60 shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Trust Badge Column */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="font-display text-base font-semibold text-white tracking-wide uppercase text-xs">
              Connect With Us
            </h4>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              {[
                {
                  icon: Facebook,
                  href: "https://facebook.com/yaracheck",
                  label: "Facebook",
                },
                {
                  icon: Twitter,
                  href: "https://x.com/YaraCheck",
                  label: "X (Twitter)",
                },
                {
                  icon: Youtube,
                  href: "https://www.youtube.com/@YaraCheck",
                  label: "YouTube",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#F1F0EC]/80 hover:bg-[#FF5A36] hover:text-white hover:border-[#FF5A36] transition-all duration-200 shadow-xs"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Trust Badge Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="font-semibold text-xs sm:text-sm text-white">
                  Trusted Globally
                </p>
              </div>
              <p className="text-xs text-[#F1F0EC]/60 leading-relaxed">
                Operating in 160+ countries • Helping recover lost items and
                protect communities worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#F1F0EC]/60">
          <p className="text-center md:text-left">
            © {currentYear} YaraCheck. All Rights Reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
