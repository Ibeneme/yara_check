import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Loader2,
  FileText,
  Calendar,
  MapPin,
  X,
  Phone,
  ShieldCheck,
} from "lucide-react";
import {
  getAllReportsFromSupabase,
  searchReportsInSupabase,
} from "@/utils/supabaseStorage";
import type { Report } from "@/utils/storage";

const MyReports = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Fetch all reports on initial load
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const data = await getAllReportsFromSupabase();
      setReports(data);
      setLoading(false);
    };

    fetchReports();
  }, []);

  // Handle live search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    setLoading(true);
    if (query.trim() === "") {
      const data = await getAllReportsFromSupabase();
      setReports(data);
    } else {
      const results = await searchReportsInSupabase(query);
      setReports(results);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradientAnimation 6s ease infinite;
        }
      `}</style>

      <main className="flex-grow bg-[#F1F0EC] text-[#0B1220] font-sans pb-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden noise pt-4 pb-12">
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
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_200%] animate-gradient text-white rounded-full px-4 py-1.5 shadow-sm">
                <Search className="w-3 h-3 text-white" />
                Case Tracking
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Track Your Submitted Reports
            </h1>

            <p className="text-[#0B1220]/70 text-lg max-w-2xl mx-auto leading-relaxed">
              View, search, and manage all your submitted reports across your
              database securely in real-time. Click any report to view details.
            </p>
          </div>
        </section>

        {/* SEARCH & REPORTS LIST SECTION */}
        <section className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          {/* Search Bar Input */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#0B1220]/5 shadow-sm flex items-center gap-3">
            <Search className="w-5 h-5 text-[#0B1220]/40 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by ID, name, brand, model, chassis, or IMEI..."
              className="w-full bg-transparent focus:outline-none text-[#0B1220] text-sm sm:text-base placeholder:text-[#0B1220]/40"
            />
          </div>

          {/* Reports Results Container */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#0B1220]/5 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-[#0B1220]/10 pb-4">
              <h2 className="font-semibold text-lg">Submitted Reports</h2>
              <span className="font-mono text-xs text-[#0B1220]/60 bg-[#F1F0EC] px-3 py-1 rounded-full">
                {reports.length} {reports.length === 1 ? "Report" : "Reports"}{" "}
                Found
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#2158D9]" />
                <p className="text-sm text-[#0B1220]/60 font-medium">
                  Loading reports...
                </p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <FileText className="w-10 h-10 text-[#0B1220]/20 mx-auto" />
                <p className="text-base font-medium text-[#0B1220]/80">
                  No reports found
                </p>
                <p className="text-xs text-[#0B1220]/50">
                  Try searching for something else or submit a new report.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="p-5 rounded-2xl border border-[#0B1220]/10 bg-[#FAFAFA] hover:bg-white hover:border-[#2158D9]/40 cursor-pointer transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-[#2158D9]/10 text-[#2158D9] px-2.5 py-0.5 rounded">
                          {report.id}
                        </span>
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                            report.status === "found"
                              ? "bg-green-100 text-green-700"
                              : report.status === "verified"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base">
                        {"name" in report
                          ? report.name
                          : `${report.brand} ${report.model}`}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs text-[#0B1220]/60 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#0B1220]/40" />
                          {report.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#0B1220]/40" />
                          {new Date(report.reportDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {report.photoUrl && (
                      <img
                        src={report.photoUrl}
                        alt="Report evidence"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalImage(report.photoUrl!);
                        }}
                        className="w-16 h-16 object-cover rounded-xl border border-[#0B1220]/10 hover:opacity-90 transition-opacity cursor-zoom-in"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <p className="font-mono text-[11px] text-[#0B1220]/40 tracking-wide">
              updates synced in real-time · verified by yaracheck
            </p>
          </div>
        </section>
      </main>

      {/* DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#0B1220]/10 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#F1F0EC] hover:bg-[#0B1220]/10 transition-colors text-[#0B1220]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-xs font-bold bg-[#2158D9]/10 text-[#2158D9] px-3 py-1 rounded-md">
                {selectedReport.id}
              </span>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                  selectedReport.status === "found"
                    ? "bg-green-100 text-green-700"
                    : selectedReport.status === "verified"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {selectedReport.status}
              </span>
            </div>

            <h2 className="text-2xl font-semibold mb-4">
              {"name" in selectedReport
                ? selectedReport.name
                : `${selectedReport.brand} ${selectedReport.model}`}
            </h2>

            {/* Photo Preview if available */}
            {selectedReport.photoUrl && (
              <div
                className="mb-6 rounded-2xl overflow-hidden border border-[#0B1220]/10 max-h-60 bg-black/5 flex justify-center cursor-zoom-in"
                onClick={() => setModalImage(selectedReport.photoUrl!)}
              >
                <img
                  src={selectedReport.photoUrl}
                  alt="Report Evidence"
                  className="w-full h-full object-contain max-h-60 hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Details Grid */}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-[#F1F0EC]/60 p-4 rounded-2xl">
                <div>
                  <span className="block text-xs text-[#0B1220]/50 font-medium">
                    Location
                  </span>
                  <span className="font-semibold text-[#0B1220]">
                    {selectedReport.location}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-[#0B1220]/50 font-medium">
                    Report Date
                  </span>
                  <span className="font-semibold text-[#0B1220]">
                    {new Date(selectedReport.reportDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Specific Properties based on Type */}
              {"age" in selectedReport && (
                <div className="grid grid-cols-2 gap-4 px-2">
                  <div>
                    <span className="text-xs text-[#0B1220]/50">Age:</span>{" "}
                    <span className="font-medium">{selectedReport.age}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0B1220]/50">Gender:</span>{" "}
                    <span className="font-medium">{selectedReport.gender}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0B1220]/50">
                      Date Missing:
                    </span>{" "}
                    <span className="font-medium">
                      {selectedReport.dateMissing}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0B1220]/50">
                      Outfit/Attributes:
                    </span>{" "}
                    <span className="font-medium">{selectedReport.outfit}</span>
                  </div>
                </div>
              )}

              {"chassis" in selectedReport && (
                <div className="grid grid-cols-2 gap-4 px-2">
                  <div>
                    <span className="text-xs text-[#0B1220]/50">Chassis:</span>{" "}
                    <span className="font-medium">
                      {selectedReport.chassis}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0B1220]/50">Color:</span>{" "}
                    <span className="font-medium">{selectedReport.color}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0B1220]/50">Year:</span>{" "}
                    <span className="font-medium">{selectedReport.year}</span>
                  </div>
                </div>
              )}

              {"imei" in selectedReport && (
                <div className="grid grid-cols-2 gap-4 px-2">
                  <div>
                    <span className="text-xs text-[#0B1220]/50">
                      IMEI/Serial:
                    </span>{" "}
                    <span className="font-medium">{selectedReport.imei}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0B1220]/50">Color:</span>{" "}
                    <span className="font-medium">{selectedReport.color}</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white border border-[#0B1220]/10 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-[#0B1220]/50 font-medium block">
                  Description
                </span>
                <p className="text-[#0B1220]/80 text-sm leading-relaxed">
                  {selectedReport.description || "No description provided."}
                </p>
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-[#2158D9]/10 p-4 rounded-2xl text-[#2158D9]">
                <Phone className="w-5 h-5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                    Contact Information
                  </span>
                  <span className="font-medium text-sm text-[#0B1220]">
                    {selectedReport.contact || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-[#0B1220]/10 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 rounded-xl bg-[#0B1220] text-white text-sm font-medium hover:bg-[#0B1220]/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE PREVIEW MODAL */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl p-3 border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-2 hover:bg-slate-800 transition-colors border-2 border-white shadow-md z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={modalImage}
              alt="Enlarged Evidence"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
