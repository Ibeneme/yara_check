
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrackingCodeSearch from "@/components/reports/TrackingCodeSearch";

const MyReports = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 yaracheck-container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yaracheck-darkBlue mb-4">
              Track Your Submitted Reports
            </h1>
            <p className="text-lg text-yaracheck-darkGray">
              Enter your tracking code to view and manage your submitted reports
            </p>
          </div>

          <TrackingCodeSearch />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyReports;
