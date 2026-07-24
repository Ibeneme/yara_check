import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  AlertTriangle,
  MessageSquare,
  Search,
  Smartphone,
  Users,
  ShieldAlert,
  BadgeAlert,
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F1F0EC] text-[#0B1220] font-sans">
        {/* HERO - Beautiful Design */}
        <section className="relative overflow-hidden noise pt-8">
          {/* Soft diamond field */}
          <div className="absolute inset-0 -z-0 opacity-70">
            <div
              className="diamond w-72 h-72 -top-10 left-[6%]"
              style={
                { "--d1": "#FFD9CC", "--d2": "#FFB199" } as React.CSSProperties
              }
            />
            <div
              className="diamond w-56 h-56 top-24 left-[28%]"
              style={
                { "--d1": "#CFE0FF", "--d2": "#9FC1FF" } as React.CSSProperties
              }
            />
            <div
              className="diamond w-64 h-64 -top-6 right-[10%]"
              style={
                { "--d1": "#D6F5E7", "--d2": "#9FE3C4" } as React.CSSProperties
              }
            />
            <div
              className="diamond w-40 h-40 top-40 right-[30%]"
              style={
                { "--d1": "#FFE7A8", "--d2": "#FFD166" } as React.CSSProperties
              }
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F1F0EC]/40 to-[#F1F0EC]" />

          <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-16">
            <div className="flex justify-center mb-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] bg-white/70 border border-[#0B1220]/10 rounded-full px-4 py-1.5">
                Case #YC-2026-XXXX &nbsp;·&nbsp; open in 160+ countries
              </span>
            </div>

            <h1 className="font-display text-center text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[0.98] max-w-4xl mx-auto">
              Report it. Track it.
              <br />
              <span className="relative inline-block">
                Get it back.
                <svg
                  className="absolute left-0 -bottom-2 w-full"
                  height="10"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,7 C50,0 150,12 200,4"
                    stroke="#FF5A36"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-center max-w-xl mx-auto mt-6 text-base sm:text-lg text-[#0B1220]/70">
              Every stolen phone, missing pet, and scam account gets a tracking
              code the moment you report it — so the whole community can help
              you close the case.
            </p>

            {/* TICKET SEARCH BAR */}
            <div id="verify" className="mt-10 max-w-2xl mx-auto">
              <div className="ticket bg-[#0B1220] text-[#F1F0EC] px-6 py-5 flex flex-col sm:flex-row gap-3 items-stretch shadow-2xl shadow-black/20">
                <div className="flex-1 flex items-center gap-3 border border-white/15 rounded-xl px-4 py-3">
                  <span className="font-mono text-xs text-white/40">
                    IMEI / S/N
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 356938035643809"
                    className="bg-transparent outline-none text-sm font-mono placeholder:text-white/30 w-full"
                  />
                </div>
                <Button
                  asChild
                  className="bg-[#FF5A36] hover:bg-[#FF5A36]/90 text-white text-sm font-semibold rounded-xl px-8 py-3 whitespace-nowrap"
                >
                  <Link to="/verify-item">YaraCheck it</Link>
                </Button>
              </div>
              <p className="text-center font-mono text-[11px] text-[#0B1220]/40 mt-2 tracking-wide">
                clean · flagged · stolen — results in under 2 seconds
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button
                asChild
                size="lg"
                className="bg-[#0B1220] hover:bg-black text-white rounded-full px-8"
              >
                <Link to="/submit-report">Submit a report urgently</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#0B1220]/30 hover:bg-white/70 rounded-full px-8"
              >
                <Link to="/verify-item">Verify Before Purchase</Link>
              </Button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="relative border-y border-[#0B1220]/10 bg-white/50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[#0B1220]/50 text-sm">
              <span className="font-mono text-[11px] uppercase tracking-widest">
                Trusted for
              </span>
              <span className="font-display font-semibold">Stolen devices</span>
              <span className="font-display font-semibold">
                Missing persons &amp; pets
              </span>
              <span className="font-display font-semibold">Scam accounts</span>
              <span className="font-display font-semibold">Fraud alerts</span>
            </div>
          </div>
        </section>

        {/* TRUSTED FOR CATEGORIES SECTION */}
        <section className="py-24 bg-[#F1F0EC] border-b border-[#0B1220]/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                More than just missing phones
              </h2>
              <p className="text-[#0B1220]/65 mt-4 max-w-2xl mx-auto">
                Our global registry secures and connects information across four
                major categories to stop theft and fraud before it spreads.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stolen Devices */}
              <div className="bg-white p-6 rounded-3xl border border-[#0B1220]/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE9E2] flex items-center justify-center mb-6">
                  <Smartphone className="h-6 w-6 text-[#FF5A36]" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  Stolen Devices
                </h3>
                <p className="text-sm text-[#0B1220]/65 leading-relaxed">
                  Phones, laptops, cars, and electronics. Register the IMEI or
                  VIN so buyers can check before purchasing.
                </p>
              </div>

              {/* Missing Persons & Pets */}
              <div className="bg-white p-6 rounded-3xl border border-[#0B1220]/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE7FF] flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-[#2158D9]" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  Missing Persons & Pets
                </h3>
                <p className="text-sm text-[#0B1220]/65 leading-relaxed">
                  Mobilize the community instantly. Create actionable reports to
                  rapidly broaden your search radius.
                </p>
              </div>

              {/* Scam Accounts */}
              <div className="bg-white p-6 rounded-3xl border border-[#0B1220]/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#D6F5E7] flex items-center justify-center mb-6">
                  <ShieldAlert className="h-6 w-6 text-[#1BA672]" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  Scam Accounts
                </h3>
                <p className="text-sm text-[#0B1220]/65 leading-relaxed">
                  Flag fraudulent social media profiles, fake vendor accounts,
                  and impersonators to protect others.
                </p>
              </div>

              {/* Fraud Alerts */}
              <div className="bg-white p-6 rounded-3xl border border-[#0B1220]/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE7A8] flex items-center justify-center mb-6">
                  <BadgeAlert className="h-6 w-6 text-[#E5A910]" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  Fraud Alerts
                </h3>
                <p className="text-sm text-[#0B1220]/65 leading-relaxed">
                  Permanently log suspicious bank details, crypto wallets, and
                  phishing links to warn the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                How a case moves
              </h2>
              <span className="font-mono text-xs uppercase tracking-widest text-[#0B1220]/40">
                Report → Verify → Recover
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 steps">
              <div className="case-card marker rounded-2xl p-7 relative border border-[#0B1220]/10">
                <div className="w-11 h-11 rounded-full bg-[#FFE9E2] flex items-center justify-center mt-4 mb-5">
                  <AlertTriangle className="h-6 w-6 text-[#FF5A36]" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  Report
                </h3>
                <p className="text-sm text-[#0B1220]/65 leading-relaxed">
                  Submit details of your stolen item, missing person, pet, or
                  hacked account. Get a unique tracking code.
                </p>
              </div>

              <div className="case-card marker rounded-2xl p-7 relative border border-[#0B1220]/10">
                <div className="w-11 h-11 rounded-full bg-[#DCE7FF] flex items-center justify-center mt-4 mb-5">
                  <Search className="h-6 w-6 text-[#2158D9]" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  Verify
                </h3>
                <p className="text-sm text-[#0B1220]/65 leading-relaxed">
                  Before buying used items, check IMEI, serial number or chassis
                  to avoid stolen goods.
                </p>
              </div>

              <div className="case-card marker rounded-2xl p-7 relative border border-[#0B1220]/10">
                <div className="w-11 h-11 rounded-full bg-[#D6F5E7] flex items-center justify-center mt-4 mb-5">
                  <MessageSquare className="h-6 w-6 text-[#1BA672]" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  Tip &amp; Recover
                </h3>
                <p className="text-sm text-[#0B1220]/65 leading-relaxed">
                  Send anonymous tips and track your case until it’s resolved.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Final Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-3xl bg-[#0B1220] text-white px-8 py-16 text-center noise">
              <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-4">
                Before you buy it or deal, YaraCheck
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold max-w-2xl mx-auto leading-tight">
                Don&apos;t hand over cash for someone else&apos;s stolen phone.
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mt-4 mb-8">
                Lost something? Flag it in two minutes. Got a scam message?
                Report the account so others don&apos;t fall victim.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#FF5A36] hover:bg-amber-600 text-white rounded-full px-10"
                >
                  <Link to="/verify-item">Verify an Item Now</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-white/10 rounded-full px-10"
                >
                  <Link to="/submit-report">Submit a Report</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
