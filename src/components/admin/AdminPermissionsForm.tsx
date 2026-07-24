import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Shield, Users, Save } from "lucide-react";

const AdminPermissionsForm = () => {
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [permissions, setPermissions] = useState({
    can_respond_to_live_chat: false,
    can_view_analytics: false,
    can_view_reports: false,
    can_manage_reports: false,
    can_view_stolen_items: false,
    can_view_support_tickets: false,
    can_view_anonymous_messages: false,
    can_view_assets: false,
    can_manage_assets: false,
    can_delete_assets: false,
    can_view_financials: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all sub-admins
  const { data: admins, isLoading } = useQuery({
    queryKey: ["sub-admins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin")
        .neq("admin_role", "super_admin");

      if (error) throw error;
      return data || [];
    },
  });

  // Load permissions when admin is selected
  const handleAdminSelect = (adminId: string) => {
    setSelectedAdmin(adminId);
    const admin = admins?.find((a) => a.id === adminId);
    if (admin?.permissions && typeof admin.permissions === "object") {
      const perms = admin.permissions as any;
      setPermissions({
        can_respond_to_live_chat: perms.can_respond_to_live_chat || false,
        can_view_analytics: perms.can_view_analytics || false,
        can_view_reports: perms.can_view_reports || false,
        can_manage_reports: perms.can_manage_reports || false,
        can_view_stolen_items: perms.can_view_stolen_items || false,
        can_view_support_tickets: perms.can_view_support_tickets || false,
        can_view_anonymous_messages: perms.can_view_anonymous_messages || false,
        can_view_assets: perms.can_view_assets || false,
        can_manage_assets: perms.can_manage_assets || false,
        can_delete_assets: perms.can_delete_assets || false,
        can_view_financials: perms.can_view_financials || false,
      });
    } else {
      setPermissions({
        can_respond_to_live_chat: false,
        can_view_analytics: false,
        can_view_reports: false,
        can_manage_reports: false,
        can_view_stolen_items: false,
        can_view_support_tickets: false,
        can_view_anonymous_messages: false,
        can_view_assets: false,
        can_manage_assets: false,
        can_delete_assets: false,
        can_view_financials: false,
      });
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: checked,
    }));
  };

  const handleUpdatePermissions = async () => {
    if (!selectedAdmin) {
      toast({
        title: "No admin selected",
        description: "Please select an admin to update permissions for",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ permissions })
        .eq("id", selectedAdmin);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
      toast({
        title: "Permissions updated",
        description: "Admin permissions have been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update permissions",
        description:
          error.message || "An error occurred while updating permissions",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center text-slate-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yaracheck-blue mx-auto mb-4"></div>
            <p>Loading admins...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <Shield className="h-5 w-5 text-yaracheck-blue" />
          <span>Manage Admin Permissions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="admin-select" className="text-slate-700 font-medium">
            Select Admin
          </Label>
          <Select value={selectedAdmin} onValueChange={handleAdminSelect}>
            <SelectTrigger className="w-full bg-white border-slate-200">
              <SelectValue placeholder="Choose an admin to manage" />
            </SelectTrigger>
            <SelectContent>
              {admins?.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.first_name} {admin.last_name} ({admin.email}) -{" "}
                  {admin.admin_role?.replace("_", " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAdmin && (
          <div className="space-y-6 pt-2 border-t border-slate-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span>Permissions Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="live-chat"
                  checked={permissions.can_respond_to_live_chat}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_respond_to_live_chat",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="live-chat"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can respond to live chat
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="analytics"
                  checked={permissions.can_view_analytics}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_view_analytics",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="analytics"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can view analytics dashboard
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="view-reports"
                  checked={permissions.can_view_reports}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_view_reports",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="view-reports"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can view reports
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="manage-reports"
                  checked={permissions.can_manage_reports}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_manage_reports",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="manage-reports"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can manage reports
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="stolen-items"
                  checked={permissions.can_view_stolen_items}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_view_stolen_items",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="stolen-items"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can view stolen items dashboard
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="support-tickets"
                  checked={permissions.can_view_support_tickets}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_view_support_tickets",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="support-tickets"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can view and manage support tickets
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="anonymous-messages"
                  checked={permissions.can_view_anonymous_messages}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_view_anonymous_messages",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="anonymous-messages"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can view anonymous messages
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="view-assets"
                  checked={permissions.can_view_assets}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_view_assets",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="view-assets"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can view company assets
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="manage-assets"
                  checked={permissions.can_manage_assets}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_manage_assets",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="manage-assets"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can manage company assets
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="delete-assets"
                  checked={permissions.can_delete_assets}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_delete_assets",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="delete-assets"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can delete company assets
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Checkbox
                  id="view-financials"
                  checked={permissions.can_view_financials}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "can_view_financials",
                      checked as boolean
                    )
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="view-financials"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Can view financial dashboard
                </Label>
              </div>
            </div>

            <Button
              onClick={handleUpdatePermissions}
              disabled={isUpdating}
              className="w-full sm:w-auto bg-yaracheck-blue hover:bg-yaracheck-darkBlue text-white flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Permissions</span>
                </>
              )}
            </Button>
          </div>
        )}

        {admins?.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No sub-admins found. Create admin accounts first.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPermissionsForm;
