import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Users, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminManagement = () => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all admins and shareholders
  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["admin", "super_admin"])
        .or(
          "admin_role.eq.shareholder,admin_role.eq.director,admin_role.eq.country_rep,admin_role.eq.province_manager"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteAdmin = async (adminId: string, adminName: string) => {
    setIsDeleting(adminId);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", adminId);

      if (error) throw error;

      toast({
        title: "Admin Deleted",
        description: `${adminName} has been removed from the system`,
      });

      queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete admin",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-600">
        Loading admin management...
      </div>
    );
  }

  const shareholders =
    admins?.filter((admin) => admin.admin_role === "shareholder") || [];
  const subAdmins =
    admins?.filter(
      (admin) =>
        admin.role === "admin" ||
        (admin.admin_role && admin.admin_role !== "shareholder")
    ) || [];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Total Shareholders
            </CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {shareholders.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Sub Admins
            </CardTitle>
            <Shield className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {subAdmins.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shareholders Management */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            Shareholders Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shareholders.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No shareholders found
              </p>
            ) : (
              shareholders.map((shareholder) => (
                <div
                  key={shareholder.id}
                  className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {shareholder.first_name} {shareholder.last_name}
                      </h4>
                      <p className="text-sm text-slate-600 truncate">
                        {shareholder.email}
                      </p>
                      <p className="text-xs text-slate-400">
                        Created:{" "}
                        {new Date(shareholder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting === shareholder.id}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md mx-4 sm:mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Shareholder
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            {shareholder.first_name} {shareholder.last_name}?
                            This action cannot be undone and will remove all
                            their data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteAdmin(
                                shareholder.id,
                                `${shareholder.first_name} ${shareholder.last_name}`
                              )
                            }
                            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sub Admins Management */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            Sub Admins Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subAdmins.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No sub admins found
              </p>
            ) : (
              subAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {admin.first_name} {admin.last_name}
                      </h4>
                      <p className="text-sm text-slate-600 truncate">
                        {admin.email}
                      </p>
                      <p className="text-sm font-medium text-yaracheck-blue">
                        Role: {admin.role}{" "}
                        {admin.admin_role ? `(${admin.admin_role})` : ""}
                      </p>
                      <p className="text-xs text-slate-400">
                        Created:{" "}
                        {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting === admin.id}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md mx-4 sm:mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {admin.first_name}{" "}
                            {admin.last_name}? This action cannot be undone and
                            will remove all their access and data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteAdmin(
                                admin.id,
                                `${admin.first_name} ${admin.last_name}`
                              )
                            }
                            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
