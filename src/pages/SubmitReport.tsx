import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  User,
  Smartphone,
  Car,
  Shield,
  UserCheck,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SubmitReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openExpectations, setOpenExpectations] = useState<
    Record<string, boolean>
  >({});

  // Auto scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleExpectation = (typeId: string) => {
    setOpenExpectations((prev) => ({
      ...prev,
      [typeId]: !prev[typeId],
    }));
  };

  const reportTypes = [
    {
      id: "person",
      title: t("submitReport.missingPerson"),
      description: t("submitReport.missingPersonDesc"),
      icon: User,
      iconBg: "bg-[#DCE7FF]",
      iconColor: "text-[#2158D9]",
      cost: "Free - $5.00*",
      expectation:
        "After reporting a missing person, you'll receive a unique tracking code to follow the progress of your report. Others who see or recognize the missing person may provide critical information to help you in your search. We also work closely with the authorities who can provide additional support. ⚠️ Please note: We do not replace law enforcement. We only collaborate with them to help combat crime.",
    },
    {
      id: "device",
      title: t("submitReport.stolenDevice"),
      description: t("submitReport.stolenDeviceDesc"),
      icon: Smartphone,
      iconBg: "bg-[#FFE9E2]",
      iconColor: "text-[#FF5A36]",
      cost: "$1.50 - $5.00*",
      expectation:
        "Once you report a stolen device, you'll get a tracking code to monitor your case. We have a network of insiders in secondhand markets who may drop anonymous tips about your device. These tips can help lead you closer to recovering your stolen property.",
    },
    {
      id: "pet",
      title: "Missing Pet",
      description:
        "Report a missing pet to help reunite with your beloved companion",
      icon: Heart,
      iconBg: "bg-[#FFE5EC]",
      iconColor: "text-[#E11D48]",
      cost: "Free - $3.00*",
      expectation:
        "After reporting a missing pet, you'll receive a tracking code to follow updates. If someone finds your pet, they can take a photo and search our database to locate you. This makes it much easier for you to be reunited with your beloved pet.",
    },
    {
      id: "vehicle",
      title: t("submitReport.stolenVehicle"),
      description: t("submitReport.stolenVehicleDesc"),
      icon: Car,
      iconBg: "bg-[#E5E0FF]",
      iconColor: "text-[#4F46E5]",
      cost: "$3.00 - $6.40*",
      expectation:
        "After reporting a stolen vehicle, you'll receive a tracking code to monitor your case. Our network helps identify and track stolen vehicles through various channels, increasing your chances of recovery.",
    },
    {
      id: "account",
      title: "Scam Email / Accounts",
      description:
        "Flag any email account or social media account that sent suspected scam messages to you. Note that this will be vetted by our team.",
      icon: Shield,
      iconBg: "bg-[#D6F5E7]",
      iconColor: "text-[#1BA672]",
      cost: "$4.00",
      expectation:
        "After flagging a suspected scam email/social media account, you'd receive a tracking code. We'll endeavor to vet the info you provide and hear from the other party before this can go live. Note that fake reports will attract legal action.",
    },
    {
      id: "reputation",
      title: t("submitReport.businessReputation"),
      description:
        "Rate your business experience with someone or a company. (This will be thoroughly vetted by our team before it can go live).",
      icon: UserCheck,
      iconBg: "bg-[#FFE7A8]",
      iconColor: "text-[#E5A910]",
      cost: "$4.00",
      expectation:
        "After you rate someone based on your experience, you'll be given a tracking code to check the progress. Anyone who searches the reported individual's name in our database will see that the person has been flagged or rated in the past. This ensures that bad behavior doesn't go unnoticed. 👉 The only way for someone to clear their name is to reach out and resolve the matter directly with you or take the matter to the authorities.",
    },
  ];

  const handleReportTypeSelect = (typeId: string) => {
    navigate(`/submit-report/${typeId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F1F0EC] text-[#0B1220] font-sans pb-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden noise pt-16 pb-12">
          {/* Subtle background diamonds for visual interest */}
          <div className="absolute inset-0 -z-0 opacity-40">
            <div
              className="diamond w-64 h-64 -top-10 left-[10%]"
              style={
                { "--d1": "#FFD9CC", "--d2": "#FFB199" } as React.CSSProperties
              }
            />
            <div
              className="diamond w-56 h-56 top-10 right-[15%]"
              style={
                { "--d1": "#CFE0FF", "--d2": "#9FC1FF" } as React.CSSProperties
              }
            />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#FFE9E2] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#0B1220]/5">
              <AlertTriangle className="h-8 w-8 text-[#FF5A36]" />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              {t("submitReport.title")}
            </h1>

            <p className="text-[#0B1220]/70 text-lg max-w-2xl mx-auto leading-relaxed">
              {t("submitReport.subtitle")}
            </p>
          </div>
        </section>

        {/* REPORT CATEGORIES GRID */}
        <section className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className="bg-white p-7 rounded-3xl border border-[#0B1220]/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${type.iconBg} flex items-center justify-center`}
                    >
                      <IconComponent className={`h-6 w-6 ${type.iconColor}`} />
                    </div>

                    {/* Pricing Pills - Using Mono */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-[#0B1220]/5 text-[#0B1220]/40 line-through px-2.5 py-1 rounded-full">
                        {type.cost}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-[#D6F5E7] text-[#1BA672] font-semibold px-2.5 py-1 rounded-full">
                        FREE
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-xl mb-2 text-[#0B1220]">
                    {type.title}
                  </h3>

                  <p className="text-sm text-[#0B1220]/65 leading-relaxed mb-6 flex-grow">
                    {type.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    <Collapsible
                      open={openExpectations[type.id] || false}
                      onOpenChange={() => toggleExpectation(type.id)}
                    >
                      <CollapsibleTrigger className="w-full p-3 bg-[#0B1220]/[0.03] hover:bg-[#0B1220]/[0.06] border border-[#0B1220]/5 rounded-xl transition-colors flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase tracking-widest text-[#0B1220]/60 font-medium">
                          What to expect
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-[#0B1220]/40 transition-transform duration-200 ${
                            openExpectations[type.id] ? "rotate-180" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 mt-2 bg-[#F8F8F7] border border-[#0B1220]/5 rounded-xl">
                          <p className="text-sm text-[#0B1220]/70 leading-relaxed">
                            {type.expectation}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportTypeSelect(type.id);
                      }}
                      className="w-full bg-[#0B1220] hover:bg-[#FF5A36] text-white rounded-xl py-6 font-semibold transition-colors duration-300"
                    >
                      {t("submitReport.report")} {type.title}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* IMPORTANT INFO SECTION */}
        <section className="max-w-5xl mx-auto px-6 mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-[#0B1220] text-white p-8 md:p-12 noise">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Shield className="w-48 h-48" />
            </div>

            <div className="relative z-10">
              <span className="font-mono text-xs uppercase tracking-widest text-white/40 mb-4 block">
                Before you submit
              </span>
              <h3 className="font-display text-3xl md:text-4xl font-semibold mb-8">
                {t("submitReport.importantInfo")}
              </h3>

              <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-6 text-white/75 text-sm md:text-base leading-relaxed">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF5A36] shrink-0" />
                  <span>{t("submitReport.pricingNote")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF5A36] shrink-0" />
                  <span>{t("submitReport.freeReports")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF5A36] shrink-0" />
                  <span>{t("submitReport.verifiedReports")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF5A36] shrink-0" />
                  <span>{t("submitReport.reviewProcess")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF5A36] shrink-0" />
                  <span>{t("submitReport.trackStatus")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF5A36] shrink-0" />
                  <span>{t("submitReport.trackingCode")}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitReport;
