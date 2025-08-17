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
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .or('admin_role.eq.shareholder,admin_role.eq.director,admin_role.eq.country_rep,admin_role.eq.province_manager')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteAdmin = async (adminId: string, adminName: string) => {
    setIsDeleting(adminId);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Admin Deleted",
        description: `${adminName} has been removed from the system`,
      });

      queryClient.invalidateQueries({ queryKey: ['admins'] });
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
    return <div className="p-6">Loading admin management...</div>;
  }

  const shareholders = admins?.filter(admin => admin.admin_role === 'shareholder') || [];
  const subAdmins = admins?.filter(admin => 
    admin.role === 'admin' || 
    (admin.admin_role && admin.admin_role !== 'shareholder')
  ) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shareholders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shareholders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subAdmins.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Shareholders Management */}
      <Card>
        <CardHeader>
          <CardTitle>Shareholders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shareholders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No shareholders found</p>
            ) : (
              shareholders.map((shareholder) => (
                <div key={shareholder.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {shareholder.first_name} {shareholder.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{shareholder.email}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(shareholder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting === shareholder.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Shareholder</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {shareholder.first_name} {shareholder.last_name}? 
                            This action cannot be undone and will remove all their data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAdmin(
                              shareholder.id, 
                              `${shareholder.first_name} ${shareholder.last_name}`
                            )}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      <Card>
        <CardHeader>
          <CardTitle>Sub Admins Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subAdmins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sub admins found</p>
            ) : (
              subAdmins.map((admin) => (
                <div key={admin.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {admin.first_name} {admin.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <p className="text-sm font-medium text-blue-600">
                        Role: {admin.role} {admin.admin_role ? `(${admin.admin_role})` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting === admin.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {admin.first_name} {admin.last_name}? 
                            This action cannot be undone and will remove all their access and data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAdmin(
                              admin.id, 
                              `${admin.first_name} ${admin.last_name}`
                            )}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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