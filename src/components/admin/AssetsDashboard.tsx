import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Asset {
  id: string;
  name: string;
  description: string;
  category: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  depreciation_rate: number;
  location: string;
  condition: string;
  serial_number: string;
  warranty_expiry: string;
  assigned_to: string;
  is_active: boolean;
  created_at: string;
}

interface AssetFormData {
  name: string;
  description: string;
  category: string;
  purchase_date: string;
  purchase_price: string;
  current_value: string;
  depreciation_rate: string;
  location: string;
  condition: string;
  serial_number: string;
}

const ASSET_CATEGORIES = [
  "Electronics",
  "Furniture",
  "Vehicles",
  "Equipment",
  "Software",
  "Real Estate",
  "Other",
];

const ASSET_CONDITIONS = ["excellent", "good", "fair", "poor", "needs_repair"];

export function AssetsDashboard() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<AssetFormData>({
    name: "",
    description: "",
    category: "",
    purchase_date: "",
    purchase_price: "",
    current_value: "",
    depreciation_rate: "0",
    location: "",
    condition: "excellent",
    serial_number: "",
  });

  const permissions = profile?.permissions as any;
  const canViewAssets =
    profile?.role === "super_admin" ||
    profile?.admin_role === "shareholder" ||
    permissions?.can_view_assets;
  const canManageAssets =
    profile?.role === "super_admin" || permissions?.can_manage_assets;
  const canDeleteAssets =
    profile?.role === "super_admin" || permissions?.can_delete_assets;

  const {
    data: assets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_assets")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Asset[];
    },
    enabled: canViewAssets,
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const { error } = await supabase.from("company_assets").insert({
        ...data,
        purchase_price: parseFloat(data.purchase_price) || null,
        current_value: parseFloat(data.current_value),
        depreciation_rate: parseFloat(data.depreciation_rate) || 0,
        created_by: profile?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["company-assets"] });
    },
    onError: (error) => {
      toast.error("Failed to create asset: " + error.message);
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssetFormData }) => {
      const { error } = await supabase
        .from("company_assets")
        .update({
          ...data,
          purchase_price: parseFloat(data.purchase_price) || null,
          current_value: parseFloat(data.current_value),
          depreciation_rate: parseFloat(data.depreciation_rate) || 0,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset updated successfully");
      setEditingAsset(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["company-assets"] });
    },
    onError: (error) => {
      toast.error("Failed to update asset: " + error.message);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("company_assets")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["company-assets"] });
    },
    onError: (error) => {
      toast.error("Failed to delete asset: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      purchase_date: "",
      purchase_price: "",
      current_value: "",
      depreciation_rate: "0",
      location: "",
      condition: "excellent",
      serial_number: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: formData });
    } else {
      createAssetMutation.mutate(formData);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description || "",
      category: asset.category,
      purchase_date: asset.purchase_date || "",
      purchase_price: asset.purchase_price?.toString() || "",
      current_value: asset.current_value.toString(),
      depreciation_rate: asset.depreciation_rate?.toString() || "0",
      location: asset.location || "",
      condition: asset.condition,
      serial_number: asset.serial_number || "",
    });
  };

  const totalValue =
    assets?.reduce((sum, asset) => sum + asset.current_value, 0) || 0;
  const totalAssets = assets?.length || 0;
  const categorizedAssets =
    assets?.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  if (!canViewAssets) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-slate-500">
            You don't have permission to view company assets.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Assets
            </CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalAssets}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Categories
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Object.keys(categorizedAssets).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Company Assets
          </CardTitle>
          {canManageAssets && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-yaracheck-blue hover:bg-yaracheck-darkBlue text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-slate-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yaracheck-blue mx-auto mb-4"></div>
              <p>Loading assets...</p>
            </div>
          ) : error ? (
            <div className="text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg text-sm">
              Error loading assets: {error.message}
            </div>
          ) : !assets || assets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Package className="h-12 w-12 mx-auto mb-3 text-slate-400 opacity-50" />
              <p className="font-medium text-slate-700">No assets found.</p>
              <p className="text-sm mt-1 text-slate-500">
                {canManageAssets
                  ? 'Click "Add Asset" to create the first one.'
                  : "Contact your administrator to add assets."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-slate-700 font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Category
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Current Value
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Condition
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Location
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets?.map((asset) => (
                    <TableRow key={asset.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {asset.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-slate-200 text-slate-700 bg-slate-50"
                        >
                          {asset.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700 font-mono">
                        ${asset.current_value.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asset.condition === "excellent"
                              ? "default"
                              : asset.condition === "good"
                              ? "secondary"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {asset.condition.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {asset.location || "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {canManageAssets && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                            className="border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteAssets && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this asset?"
                                )
                              ) {
                                deleteAssetMutation.mutate(asset.id);
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Asset Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingAsset}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingAsset(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {editingAsset ? "Edit Asset" : "Create New Asset"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Asset Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Category *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Purchase Price (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_price: e.target.value })
                  }
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Current Value (USD) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) =>
                    setFormData({ ...formData, current_value: e.target.value })
                  }
                  required
                  className="bg-white border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Purchase Date
                </label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_date: e.target.value })
                  }
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Depreciation Rate (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.depreciation_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depreciation_rate: e.target.value,
                    })
                  }
                  className="bg-white border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Condition *
                </label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData({ ...formData, condition: value })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Serial Number
              </label>
              <Input
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
                className="bg-white border-slate-200"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingAsset(null);
                  resetForm();
                }}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createAssetMutation.isPending || updateAssetMutation.isPending
                }
                className="bg-yaracheck-blue hover:bg-yaracheck-darkBlue text-white"
              >
                {editingAsset ? "Update Asset" : "Create Asset"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
