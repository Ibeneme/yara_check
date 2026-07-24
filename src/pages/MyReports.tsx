import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrackingCodeSearch from "@/components/reports/TrackingCodeSearch";
import { Search } from "lucide-react";

const MyReports = () => {
  const { t } = useTranslation();

  // Auto scroll to tracking section when page loads
  useEffect(() => {
    const trackingSection = document.querySelector("main");
    if (trackingSection) {
      trackingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F1F0EC] text-[#0B1220] font-sans pb-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden noise pt-16 pb-12">
          {/* Subtle background diamonds for visual interest */}
          <div className="absolute inset-0 -z-0 opacity-40">
            <div
              className="diamond w-64 h-64 -top-10 left-[15%]"
              style={
                { "--d1": "#CFE0FF", "--d2": "#9FC1FF" } as React.CSSProperties
              }
            />
            <div
              className="diamond w-48 h-48 top-20 right-[20%]"
              style={
                { "--d1": "#D6F5E7", "--d2": "#9FE3C4" } as React.CSSProperties
              }
            />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="flex justify-center mb-6">
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] bg-white/70 border border-[#0B1220]/10 rounded-full px-4 py-1.5">
                <Search className="w-3 h-3 text-[#2158D9]" />
                Case Tracking
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Track Your Submitted Reports
            </h1>

            <p className="text-[#0B1220]/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Enter your tracking code to view and manage your submitted reports
              securely in our database.
            </p>
          </div>
        </section>

        {/* TRACKING SEARCH SECTION */}
        <section className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#0B1220]/5 shadow-sm">
            <TrackingCodeSearch />
          </div>

          <div className="text-center mt-8">
            <p className="font-mono text-[11px] text-[#0B1220]/40 tracking-wide">
              updates synced in real-time · verified by yaracheck
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyReports;
