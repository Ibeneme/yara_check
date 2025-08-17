
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ShareholderROI from '../roi/ShareholderROI';
import ShareholderReportsSection from '../dashboard/ShareholderReportsSection';

const ShareholderDashboard = () => {
  // Reports analytics are now moved to a separate section


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shareholder Dashboard</h1>
      </div>

      {/* ROI Management Section - Separate and Prominent */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">ROI Management</h2>
        <ShareholderROI />
      </div>

      {/* Reports Section - Separate */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200">
        <ShareholderReportsSection />
      </div>
    </div>
  );
};

export default ShareholderDashboard;
