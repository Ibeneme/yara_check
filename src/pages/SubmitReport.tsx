
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, Smartphone, Car, Shield, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SubmitReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const reportTypes = [
    {
      id: "person",
      title: t('submitReport.missingPerson'),
      description: t('submitReport.missingPersonDesc'),
      icon: User,
      color: "bg-blue-100 text-blue-600",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-50",
      cost: "Free - $5.00*"
    },
    {
      id: "device",
      title: t('submitReport.stolenDevice'),
      description: t('submitReport.stolenDeviceDesc'),
      icon: Smartphone,
      color: "bg-green-100 text-green-600",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-50",
      cost: "$1.50 - $5.00*"
    },
    {
      id: "household",
      title: t('submitReport.householdItems'),
      description: t('submitReport.householdItemsDesc'),
      icon: Smartphone,
      color: "bg-teal-100 text-teal-600",
      borderColor: "border-teal-200",
      hoverColor: "hover:bg-teal-50",
      cost: "$1.50 - $5.00*"
    },
    {
      id: "personal",
      title: t('submitReport.personalBelongings'),
      description: t('submitReport.personalBelongingsDesc'),
      icon: Smartphone,
      color: "bg-indigo-100 text-indigo-600",
      borderColor: "border-indigo-200",
      hoverColor: "hover:bg-indigo-50",
      cost: "$1.50 - $5.00*"
    },
    {
      id: "vehicle",
      title: t('submitReport.stolenVehicle'),
      description: t('submitReport.stolenVehicleDesc'),
      icon: Car,
      color: "bg-purple-100 text-purple-600",
      borderColor: "border-purple-200",
      hoverColor: "hover:bg-purple-50",
      cost: "$3.00 - $6.40*"
    },
    {
      id: "account",
      title: t('submitReport.hackedAccount'),
      description: t('submitReport.hackedAccountDesc'),
      icon: Shield,
      color: "bg-red-100 text-red-600",
      borderColor: "border-red-200",
      hoverColor: "hover:bg-red-50",
      cost: "$4.00"
    },
    {
      id: "reputation",
      title: t('submitReport.businessReputation'),
      description: t('submitReport.businessReputationDesc'),
      icon: UserCheck,
      color: "bg-orange-100 text-orange-600",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-50",
      cost: "$4.00"
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
                  className={`cursor-pointer transition-all duration-200 ${type.borderColor} ${type.hoverColor} hover:shadow-lg`}
                  onClick={() => handleReportTypeSelect(type.id)}
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
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              {type.cost}
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
                    <Button className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue">
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
