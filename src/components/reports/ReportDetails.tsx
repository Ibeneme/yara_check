
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Phone, Mail, MapPin, User, MessageSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import AnonymousMessages from "./AnonymousMessages";

interface ReportDetailsProps {
  reportId: string;
  reportType: 'person' | 'device' | 'vehicle';
}

const ReportDetails = ({ reportId, reportType }: ReportDetailsProps) => {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["report-details", reportId, reportType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(reportType === 'person' ? 'persons' : reportType === 'device' ? 'devices' : 'vehicles')
        .select(`
          *,
          country:countries(name),
          province:provinces(name)
        `)
        .eq("id", reportId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <div className="bg-red-50 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p>Report not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      missing: "bg-red-100 text-red-800 border-red-200",
      found: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      <Card className="border-padiman-lightBlue shadow-lg">
        <CardHeader className="bg-gradient-to-r from-padiman-lightBlue to-blue-50">
          <CardTitle className="flex items-center justify-between text-padiman-darkBlue">
            <span className="flex items-center gap-2">
              <div className="bg-padiman-blue p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              Report Details
            </span>
            <Badge className={`${getStatusBadge(reportData.status)} border`}>
              {reportData.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Display image if available */}
          {reportData.image_url && (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src={reportData.image_url} 
                  alt="Report image" 
                  className="max-w-md w-full h-auto object-cover rounded-lg border-2 border-padiman-lightBlue shadow-lg"
                />
                <div className="absolute -top-2 -right-2 bg-padiman-blue p-2 rounded-full shadow-md">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-padiman-lightBlue p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-3 text-padiman-darkBlue flex items-center gap-2">
                <div className="bg-padiman-blue p-1.5 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                Basic Information
              </h3>
              <div className="space-y-2 text-sm">
                {reportType === 'person' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Name:</span> 
                      <span className="text-gray-700">{(reportData as any).name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Age:</span> 
                      <span className="text-gray-700">{(reportData as any).age}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Gender:</span> 
                      <span className="text-gray-700">{(reportData as any).gender}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Date Missing:</span> 
                      <span className="text-gray-700">{format(new Date((reportData as any).date_missing), "MMM dd, yyyy")}</span>
                    </div>
                  </>
                )}
                {(reportType === 'device' || reportType === 'vehicle') && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Type:</span> 
                      <span className="text-gray-700">{(reportData as any).type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Brand:</span> 
                      <span className="text-gray-700">{(reportData as any).brand}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Model:</span> 
                      <span className="text-gray-700">{(reportData as any).model}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-padiman-darkBlue">Color:</span> 
                      <span className="text-gray-700">{(reportData as any).color}</span>
                    </div>
                    {reportType === 'device' && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-padiman-darkBlue">IMEI:</span> 
                        <span className="text-gray-700 font-mono">{(reportData as any).imei}</span>
                      </div>
                    )}
                    {reportType === 'vehicle' && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-padiman-darkBlue">Year:</span> 
                          <span className="text-gray-700">{(reportData as any).year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-padiman-darkBlue">Chassis:</span> 
                          <span className="text-gray-700 font-mono">{(reportData as any).chassis}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold mb-3 text-padiman-darkBlue flex items-center gap-2">
                <div className="bg-green-500 p-1.5 rounded-full">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Location & Date
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">{reportData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Reported: {format(new Date(reportData.report_date), "MMM dd, yyyy")}</span>
                </div>
                {reportData.country && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-padiman-darkBlue">Country:</span> 
                    <span className="text-gray-700">{(reportData.country as any)?.name}</span>
                  </div>
                )}
                {reportData.province && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-padiman-darkBlue">Province:</span> 
                    <span className="text-gray-700">{(reportData.province as any)?.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-padiman-lightBlue" />

          {/* Reporter Contact Information */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-padiman-darkBlue">
              <div className="bg-purple-500 p-1.5 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              Reporter Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-padiman-darkBlue">Name:</span> 
                <span className="text-gray-700">{reportData.reporter_name || 'Not provided'}</span>
              </div>
              {reportData.reporter_email && (
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 p-1 rounded-full">
                    <Mail className="h-3 w-3 text-white" />
                  </div>
                  <a href={`mailto:${reportData.reporter_email}`} className="text-padiman-blue hover:text-padiman-darkBlue hover:underline transition-colors">
                    {reportData.reporter_email}
                  </a>
                </div>
              )}
              {reportData.reporter_phone && (
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 p-1 rounded-full">
                    <Phone className="h-3 w-3 text-white" />
                  </div>
                  <a href={`tel:${reportData.reporter_phone}`} className="text-padiman-blue hover:text-padiman-darkBlue hover:underline transition-colors">
                    {reportData.reporter_phone}
                  </a>
                </div>
              )}
              {reportData.reporter_address && (
                <div className="flex items-center gap-2 col-span-full">
                  <div className="bg-orange-500 p-1 rounded-full">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">{reportData.reporter_address}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-padiman-lightBlue" />

          {/* Description */}
          {reportData.description && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-padiman-darkBlue">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{reportData.description}</p>
            </div>
          )}

          {/* Physical Attributes for persons */}
          {reportType === 'person' && (reportData as any).physical_attributes && (
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200">
              <h3 className="font-semibold mb-2 text-padiman-darkBlue">Physical Attributes</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{(reportData as any).physical_attributes}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <h3 className="font-semibold mb-2 text-padiman-darkBlue">Contact for Information</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{reportData.contact}</p>
          </div>

          {/* Tracking Code */}
          <div className="bg-gradient-to-br from-padiman-lightBlue to-blue-100 p-4 rounded-lg border border-padiman-blue">
            <h3 className="font-semibold mb-2 text-padiman-darkBlue">Tracking Code</h3>
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded-md text-sm font-mono text-padiman-darkBlue border border-padiman-blue shadow-sm">
                {reportData.id}
              </code>
              <div className="bg-padiman-blue p-1 rounded-full">
                <AlertCircle className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anonymous Messages - Show for everyone viewing tracking code search results */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-amber-800">Anonymous Messages Warning</span>
        </div>
        <p className="text-sm text-amber-700">
          Please be cautious with anonymous messages. YaraCheck cannot guarantee their authenticity. 
          Recipients should proceed carefully and verify any information independently before taking action.
        </p>
      </div>
      <AnonymousMessages reportId={reportId} reportType={reportType} showForReporter={true} />
    </div>
  );
};

export default ReportDetails;
