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
} from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0B1220] text-slate-300 pt-20 pb-12 overflow-hidden border-t border-white/10">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#FF5A36]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="flex items-center gap-3 mb-6 group inline-flex"
            >
              <div className="w-12 h-12 bg-[#FF5A36] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-3xl tracking-tighter">
                  YC
                </span>
              </div>
              <div>
                <span className="text-3xl font-display font-semibold tracking-tight text-white">
                  YaraCheck
                </span>
              </div>
            </Link>

            <p className="text-slate-400 leading-relaxed max-w-md mb-8">
              A global community platform helping people report, verify, and
              recover stolen items, missing persons, pets, and scam accounts.
            </p>

            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#FF5A36] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Stoke Park Mews, St Michaels Road,
                  <br />
                  Coventry CV2 4NU
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#FF5A36] flex-shrink-0" />
                <span>+44 7405 672016 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#FF5A36] flex-shrink-0" />
                <a
                  href="mailto:info@yaracheck.com"
                  className="hover:text-white transition-colors"
                >
                  info@yaracheck.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-display text-lg font-semibold mb-6 text-white tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
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
                    className="inline-flex items-center group hover:text-white transition-all duration-200"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-lg font-semibold mb-6 text-white tracking-wide">
              Services
            </h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              {[
                "Stolen Device Recovery",
                "Missing Persons & Pets",
                "Scam Account Reporting",
                "Pre-Purchase Verification",
                "Anonymous Community Tips",
              ].map((service, index) => (
                <li
                  key={index}
                  className="hover:text-slate-200 transition-colors"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Trust */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-lg font-semibold mb-6 text-white tracking-wide">
              Connect With Us
            </h4>

            <div className="flex gap-3 mb-8">
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
                  className="w-11 h-11 bg-white/5 hover:bg-[#FF5A36] border border-white/10 hover:border-[#FF5A36] text-slate-300 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Trust Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
                <p className="text-sm font-medium text-white">
                  Trusted Globally
                </p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating in 160+ countries • Helping recover lost items and
                protect communities.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <p>© {currentYear} YaraCheck. All Rights Reserved.</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link
              to="/privacy"
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="hover:text-slate-300 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            Made with <Heart className="h-3.5 w-3.5 text-red-500" /> in Coventry
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
