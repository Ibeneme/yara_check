import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

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
  'Electronics',
  'Furniture',
  'Vehicles',
  'Equipment',
  'Software',
  'Real Estate',
  'Other'
];

const ASSET_CONDITIONS = [
  'excellent',
  'good',
  'fair',
  'poor',
  'needs_repair'
];

export function AssetsDashboard() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    description: '',
    category: '',
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    depreciation_rate: '0',
    location: '',
    condition: 'excellent',
    serial_number: ''
  });

  // Check permissions - same logic as ROI for shareholders
  const permissions = profile?.permissions as any;
  const canViewAssets = profile?.role === 'super_admin' || 
                        profile?.admin_role === 'shareholder' || 
                        permissions?.can_view_assets;
  const canManageAssets = profile?.role === 'super_admin' || permissions?.can_manage_assets;
  const canDeleteAssets = profile?.role === 'super_admin' || permissions?.can_delete_assets;

  const { data: assets, isLoading, error } = useQuery({
    queryKey: ['company-assets'],
    queryFn: async () => {
      console.log('AssetsDashboard: Fetching assets with profile:', profile);
      console.log('AssetsDashboard: canViewAssets:', canViewAssets);
      
      const { data, error } = await supabase
        .from('company_assets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      console.log('AssetsDashboard: Query result:', { data, error });
      if (error) {
        console.error('AssetsDashboard: Error fetching assets:', error);
        throw error;
      }
      return data as Asset[];
    },
    enabled: canViewAssets
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const { error } = await supabase
        .from('company_assets')
        .insert({
          ...data,
          purchase_price: parseFloat(data.purchase_price) || null,
          current_value: parseFloat(data.current_value),
          depreciation_rate: parseFloat(data.depreciation_rate) || 0,
          created_by: profile?.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Asset created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['company-assets'] });
    },
    onError: (error) => {
      toast.error('Failed to create asset: ' + error.message);
    }
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssetFormData }) => {
      const { error } = await supabase
        .from('company_assets')
        .update({
          ...data,
          purchase_price: parseFloat(data.purchase_price) || null,
          current_value: parseFloat(data.current_value),
          depreciation_rate: parseFloat(data.depreciation_rate) || 0
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Asset updated successfully');
      setEditingAsset(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['company-assets'] });
    },
    onError: (error) => {
      toast.error('Failed to update asset: ' + error.message);
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_assets')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Asset deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['company-assets'] });
    },
    onError: (error) => {
      toast.error('Failed to delete asset: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      purchase_date: '',
      purchase_price: '',
      current_value: '',
      depreciation_rate: '0',
      location: '',
      condition: 'excellent',
      serial_number: ''
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
      description: asset.description || '',
      category: asset.category,
      purchase_date: asset.purchase_date || '',
      purchase_price: asset.purchase_price?.toString() || '',
      current_value: asset.current_value.toString(),
      depreciation_rate: asset.depreciation_rate?.toString() || '0',
      location: asset.location || '',
      condition: asset.condition,
      serial_number: asset.serial_number || ''
    });
  };

  const totalValue = assets?.reduce((sum, asset) => sum + asset.current_value, 0) || 0;
  const totalAssets = assets?.length || 0;
  const categorizedAssets = assets?.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (!canViewAssets) {
    console.log('AssetsDashboard: No permission to view assets. Profile:', profile);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to view company assets.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categorizedAssets).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Company Assets</CardTitle>
          {canManageAssets && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading assets...</div>
          ) : error ? (
            <div className="text-red-500">Error loading assets: {error.message}</div>
          ) : !assets || assets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No assets found. {canManageAssets ? 'Click "Add Asset" to create the first one.' : 'Contact your administrator to add assets.'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets?.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.category}</Badge>
                    </TableCell>
                    <TableCell>${asset.current_value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={asset.condition === 'excellent' ? 'default' : 
                                asset.condition === 'good' ? 'secondary' : 'destructive'}
                      >
                        {asset.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell className="space-x-2">
                      {canManageAssets && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(asset)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteAssets && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAssetMutation.mutate(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
               ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Asset Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingAsset} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingAsset(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? 'Edit Asset' : 'Create New Asset'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Asset Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Purchase Price (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current Value (USD) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Purchase Date</label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Depreciation Rate (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.depreciation_rate}
                  onChange={(e) => setFormData({ ...formData, depreciation_rate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Condition *</label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Serial Number</label>
              <Input
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingAsset(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createAssetMutation.isPending || updateAssetMutation.isPending}>
                {editingAsset ? 'Update Asset' : 'Create Asset'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}