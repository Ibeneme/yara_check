
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Mail, Phone, Shield } from "lucide-react";
import { useAdminProfile } from "@/hooks/useAdminReports";

interface AdminProfileProps {
  adminId: string;
}

const AdminProfile = ({ adminId }: AdminProfileProps) => {
  const { data: profile, isLoading } = useAdminProfile(adminId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Profile not found</div>
        </CardContent>
      </Card>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'director': return 'Director';
      case 'country_rep': return 'Country Representative';
      case 'province_manager': return 'Province Manager';
      case 'shareholder': return 'Shareholder';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'director': return 'secondary';
      case 'country_rep': return 'outline';
      case 'province_manager': return 'outline';
      case 'shareholder': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Admin Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {profile.first_name} {profile.last_name}
          </h3>
          <Badge variant={getRoleBadgeVariant(profile.admin_role)}>
            <Shield className="h-3 w-3 mr-1" />
            {getRoleDisplayName(profile.admin_role)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{profile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{profile.country?.name || 'No country assigned'}</span>
          </div>

          {profile.province && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{profile.province.name} (Province)</span>
            </div>
          )}
        </div>

        {profile.permissions && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.permissions).map(([key, value]) => {
                if (value) {
                  return (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Badge>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {profile.must_change_password && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You must change your password on next login.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminProfile;
