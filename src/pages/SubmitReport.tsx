
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, Smartphone, Car, Shield, UserCheck, Heart, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SubmitReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openExpectations, setOpenExpectations] = useState<Record<string, boolean>>({});

  // Auto scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleExpectation = (typeId: string) => {
    setOpenExpectations(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  };

  const reportTypes = [
    {
      id: "person",
      title: t('submitReport.missingPerson'),
      description: t('submitReport.missingPersonDesc'),
      icon: User,
      color: "bg-blue-100 text-blue-600",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-50",
      cost: "Free - $5.00*",
      expectation: "After reporting a missing person, you'll receive a unique tracking code to follow the progress of your report. Others who see or recognize the missing person may provide critical information to help you in your search. We also work closely with the authorities who can provide additional support. ⚠️ Please note: We do not replace law enforcement. We only collaborate with them to help combat crime."
    },
    {
      id: "device",
      title: t('submitReport.stolenDevice'),
      description: t('submitReport.stolenDeviceDesc'),
      icon: Smartphone,
      color: "bg-green-100 text-green-600",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-50",
      cost: "$1.50 - $5.00*",
      expectation: "Once you report a stolen device, you'll get a tracking code to monitor your case. We have a network of insiders in secondhand markets who may drop anonymous tips about your device. These tips can help lead you closer to recovering your stolen property."
    },
    {
      id: "pet",
      title: "Missing Pet",
      description: "Report a missing pet to help reunite with your beloved companion",
      icon: Heart,
      color: "bg-pink-100 text-pink-600",
      borderColor: "border-pink-200",
      hoverColor: "hover:bg-pink-50",
      cost: "Free - $3.00*",
      expectation: "After reporting a missing pet, you'll receive a tracking code to follow updates. If someone finds your pet, they can take a photo and search our database to locate you. This makes it much easier for you to be reunited with your beloved pet."
    },
    {
      id: "vehicle",
      title: t('submitReport.stolenVehicle'),
      description: t('submitReport.stolenVehicleDesc'),
      icon: Car,
      color: "bg-purple-100 text-purple-600",
      borderColor: "border-purple-200",
      hoverColor: "hover:bg-purple-50",
      cost: "$3.00 - $6.40*",
      expectation: "After reporting a stolen vehicle, you'll receive a tracking code to monitor your case. Our network helps identify and track stolen vehicles through various channels, increasing your chances of recovery."
    },
    {
      id: "account",
      title: "Scam Email/Social Media Accounts",
      description: "Flag any email account or social media account that sent suspected scam messages to you. Note that this will be vetted by our team before it can go live.",
      icon: Shield,
      color: "bg-red-100 text-red-600",
      borderColor: "border-red-200",
      hoverColor: "hover:bg-red-50",
      cost: "$4.00",
      expectation: "After flagging a suspected scam email/social media account, you'd receive a tracking code. We'll endeavor to vet the info you provide and hear from the other party before this can go live. Note that fake reports will attract legal action."
    },
    {
      id: "reputation",
      title: t('submitReport.businessReputation'),
      description: "Rate your business experience with someone or a company. (This will be thoroughly vetted by our team before it can go live. Note that fake/incorrect ratings will be reported to the authorities).",
      icon: UserCheck,
      color: "bg-orange-100 text-orange-600",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-50",
      cost: "$4.00",
      expectation: "After you rate someone based on your experience, you'll be given a tracking code to check the progress. Anyone who searches the reported individual's name in our database will see that the person has been flagged or rated in the past. This ensures that bad behavior doesn't go unnoticed. 👉 The only way for someone to clear their name is to reach out and resolve the matter directly with you or take the matter to the authorities."
    }
  ];

  const handleReportTypeSelect = (typeId: string) => {
    navigate(`/submit-report/${typeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="yaracheck-container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <AlertTriangle className="h-16 w-16 text-yaracheck-orange mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-yaracheck-blue mb-4">
              {t('submitReport.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('submitReport.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card 
                  key={type.id}
                  className={`transition-all duration-200 ${type.borderColor} hover:shadow-lg`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${type.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {type.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 line-through">
                              {type.cost}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              FREE
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {type.description}
                    </p>
                    
                    <Collapsible 
                      open={openExpectations[type.id] || false}
                      onOpenChange={() => toggleExpectation(type.id)}
                    >
                      <CollapsibleTrigger 
                        className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-amber-800">
                            What to Expect After Reporting
                          </h4>
                          <ChevronDown className={`h-4 w-4 text-amber-600 transition-transform ${openExpectations[type.id] ? 'rotate-180' : ''}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg border-t-0 rounded-t-none mb-4">
                          <p className="text-sm text-amber-700">
                            {type.expectation}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    <Button 
                      className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportTypeSelect(type.id);
                      }}
                    >
                      {t('submitReport.report')} {type.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('submitReport.importantInfo')}
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-yaracheck-orange">•</span>
                <span>{t('submitReport.pricingNote')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yaracheck-orange">•</span>
                <span>{t('submitReport.freeReports')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yaracheck-orange">•</span>
                <span>{t('submitReport.verifiedReports')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yaracheck-orange">•</span>
                <span>{t('submitReport.reviewProcess')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yaracheck-orange">•</span>
                <span>{t('submitReport.trackStatus')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yaracheck-orange">•</span>
                <span>{t('submitReport.trackingCode')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SubmitReport;
