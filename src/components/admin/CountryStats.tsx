import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Smartphone, Car, BarChart3 } from "lucide-react";
import { useCountryStats } from "@/hooks/useAdminReports";

interface CountryStatsProps {
  adminProfile?: any;
}

const CountryStats = ({ adminProfile }: CountryStatsProps) => {
  const { data: countryStats, isLoading } = useCountryStats(adminProfile);

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-12 text-slate-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yaracheck-blue mx-auto mb-4"></div>
            <p>Loading country statistics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!countryStats || countryStats.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-12 text-slate-500">
            No country data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-xl font-semibold text-slate-900">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-yaracheck-blue" />
            <span>Reports by Country</span>
          </div>
          {adminProfile &&
            adminProfile.admin_role !== "super_admin" &&
            adminProfile.admin_role !== "director" && (
              <Badge
                variant="outline"
                className="border-slate-200 text-slate-700 bg-slate-50"
              >
                {adminProfile.admin_role.replace("_", " ").toUpperCase()} VIEW
              </Badge>
            )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {countryStats.map((country) => (
            <div
              key={country.id}
              className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <h3 className="font-semibold text-slate-900">
                    {country.name}
                  </h3>
                </div>
                <Badge
                  variant="outline"
                  className="border-slate-200 text-slate-700 bg-slate-50"
                >
                  {country.total} total reports
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                  <Users className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="truncate">{country.persons} persons</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                  <Smartphone className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{country.devices} devices</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                  <Car className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="truncate">{country.vehicles} vehicles</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryStats;
