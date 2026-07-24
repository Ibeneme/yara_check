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
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-slate-600">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-slate-500">Profile not found</div>
        </CardContent>
      </Card>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrator";
      case "director":
        return "Director";
      case "country_rep":
        return "Country Representative";
      case "province_manager":
        return "Province Manager";
      case "shareholder":
        return "Shareholder";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "default";
      case "director":
        return "secondary";
      case "country_rep":
        return "outline";
      case "province_manager":
        return "outline";
      case "shareholder":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <User className="h-5 w-5 text-yaracheck-blue" />
          <span>Admin Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {profile.first_name} {profile.last_name}
          </h3>
          <Badge
            variant={getRoleBadgeVariant(profile.admin_role)}
            className="w-fit flex items-center gap-1.5 py-1 px-2.5"
          >
            <Shield className="h-3 w-3" />
            <span>{getRoleDisplayName(profile.admin_role)}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5 text-sm text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-2.5 text-sm text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{profile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">
              {profile.country?.name || "No country assigned"}
            </span>
          </div>

          {profile.province && (
            <div className="flex items-center gap-2.5 text-sm text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {profile.province.name} (Province)
              </span>
            </div>
          )}
        </div>

        {profile.permissions && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-900 text-sm">
              Permissions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(profile.permissions).map(([key, value]) => {
                if (value) {
                  return (
                    <Badge
                      key={key}
                      variant="outline"
                      className="text-xs bg-slate-50 text-slate-700 border-slate-200 py-1 px-2.5"
                    >
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </Badge>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {profile.must_change_password && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-medium text-amber-800">
              You must change your password on next login.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminProfile;
