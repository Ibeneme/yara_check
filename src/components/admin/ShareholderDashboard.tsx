import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ShareholderROI from "../roi/ShareholderROI";
import ShareholderReportsSection from "../dashboard/ShareholderReportsSection";

const ShareholderDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Shareholder Dashboard
        </h1>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/60 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          ROI Management
        </h2>
        <ShareholderROI />
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <ShareholderReportsSection />
      </div>
    </div>
  );
};

export default ShareholderDashboard;
