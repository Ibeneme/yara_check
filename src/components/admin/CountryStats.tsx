
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading country statistics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!countryStats || countryStats.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No country data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Reports by Country
          {adminProfile && adminProfile.admin_role !== 'super_admin' && adminProfile.admin_role !== 'director' && (
            <Badge variant="outline">
              {adminProfile.admin_role.replace('_', ' ').toUpperCase()} VIEW
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {countryStats.map((country) => (
            <div
              key={country.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold">{country.name}</h3>
                </div>
                <Badge variant="outline">
                  {country.total} total reports
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{country.persons} persons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-green-500" />
                  <span>{country.devices} devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-purple-500" />
                  <span>{country.vehicles} vehicles</span>
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
