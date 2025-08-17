
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Calendar as CalendarIcon, FileText, Eye, Copy } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import ReportDetails from "../reports/ReportDetails";
import { toast } from "@/hooks/use-toast";

interface StolenItemsDashboardProps {
  isSuper: boolean;
}

const StolenItemsDashboard = ({ isSuper }: StolenItemsDashboardProps) => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: stolenItems, isLoading, refetch } = useQuery({
    queryKey: ["stolen-items", searchQuery, itemTypeFilter, dateRange, user?.id],
    queryFn: async () => {
      if (!user?.id) return { persons: [], devices: [], vehicles: [] };

      // Build base queries with geographic restrictions for non-super admins
      let personsQuery = supabase.from("persons").select(`
        id, name, age, gender, physical_attributes, description, location, 
        date_missing, status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code,
        country:countries(name)
      `).order('report_date', { ascending: false });

      let devicesQuery = supabase.from("devices").select(`
        id, type, brand, model, color, imei, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code,
        country:countries(name)
      `).order('report_date', { ascending: false });

      let vehiclesQuery = supabase.from("vehicles").select(`
        id, type, brand, model, year, color, chassis, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code,
        country:countries(name)
      `).order('report_date', { ascending: false });

      let householdQuery = supabase.from("household_items").select(`
        id, type, brand, model, year, color, imei, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code,
        country:countries(name)
      `).order('report_date', { ascending: false });

      let personalQuery = supabase.from("personal_belongings").select(`
        id, type, brand, model, year, color, imei, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code,
        country:countries(name)
      `).order('report_date', { ascending: false });

      let accountsQuery = supabase.from("hacked_accounts").select(`
        id, account_type, account_identifier, description, date_compromised,
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code,
        country:countries(name)
      `).order('report_date', { ascending: false });

      let reputationQuery = supabase.from("business_reputation_reports").select(`
        id, reported_person_name, reported_person_contact, business_type, 
        transaction_date, transaction_amount, reputation_status, description, evidence,
        status, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, tracking_code,
        country:countries(name)
      `).order('report_date', { ascending: false });

      // Apply search filters
      if (searchQuery) {
        personsQuery = personsQuery.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`);
        devicesQuery = devicesQuery.or(`imei.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`);
        vehiclesQuery = vehiclesQuery.or(`chassis.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`);
        householdQuery = householdQuery.or(`imei.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`);
        personalQuery = personalQuery.or(`imei.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`);
        accountsQuery = accountsQuery.or(`account_identifier.ilike.%${searchQuery}%,account_type.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`);
        reputationQuery = reputationQuery.or(`reported_person_name.ilike.%${searchQuery}%,business_type.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`);
      }

      // Apply date range filter
      if (dateRange?.from) {
        personsQuery = personsQuery.gte('report_date', dateRange.from.toISOString());
        devicesQuery = devicesQuery.gte('report_date', dateRange.from.toISOString());
        vehiclesQuery = vehiclesQuery.gte('report_date', dateRange.from.toISOString());
        householdQuery = householdQuery.gte('report_date', dateRange.from.toISOString());
        personalQuery = personalQuery.gte('report_date', dateRange.from.toISOString());
        accountsQuery = accountsQuery.gte('report_date', dateRange.from.toISOString());
        reputationQuery = reputationQuery.gte('report_date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        personsQuery = personsQuery.lte('report_date', dateRange.to.toISOString());
        devicesQuery = devicesQuery.lte('report_date', dateRange.to.toISOString());
        vehiclesQuery = vehiclesQuery.lte('report_date', dateRange.to.toISOString());
        householdQuery = householdQuery.lte('report_date', dateRange.to.toISOString());
        personalQuery = personalQuery.lte('report_date', dateRange.to.toISOString());
        accountsQuery = accountsQuery.lte('report_date', dateRange.to.toISOString());
        reputationQuery = reputationQuery.lte('report_date', dateRange.to.toISOString());
      }

      const [personsResult, devicesResult, vehiclesResult, householdResult, personalResult, accountsResult, reputationResult] = await Promise.all([
        itemTypeFilter === "all" || itemTypeFilter === "persons" ? personsQuery : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "devices" ? devicesQuery : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "vehicles" ? vehiclesQuery : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "household" ? householdQuery : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "personal" ? personalQuery : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "accounts" ? accountsQuery : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "reputation" ? reputationQuery : Promise.resolve({ data: [] }),
      ]);

      return {
        persons: personsResult.data || [],
        devices: devicesResult.data || [],
        vehicles: vehiclesResult.data || [],
        household: householdResult.data || [],
        personal: personalResult.data || [],
        accounts: accountsResult.data || [],
        reputation: reputationResult.data || [],
      };
    },
    enabled: !!user?.id,
  });

  const allItems = stolenItems ? [
    ...stolenItems.persons.map(item => ({ 
      ...item, 
      category: 'Person/Pet', 
      serialNumber: item.id,
      trackingCode: item.tracking_code || item.id,
      itemName: item.name 
    })),
    ...stolenItems.devices.map(item => ({ 
      ...item, 
      category: 'Device', 
      serialNumber: item.imei,
      trackingCode: item.tracking_code || item.id,
      itemName: `${item.brand} ${item.model}` 
    })),
    ...stolenItems.vehicles.map(item => ({ 
      ...item, 
      category: 'Vehicle', 
      serialNumber: item.chassis,
      trackingCode: item.tracking_code || item.id,
      itemName: `${item.brand} ${item.model}` 
    })),
    ...stolenItems.household.map(item => ({ 
      ...item, 
      category: 'Household Item', 
      serialNumber: item.imei,
      trackingCode: item.tracking_code || item.id,
      itemName: `${item.brand} ${item.model}` 
    })),
    ...stolenItems.personal.map(item => ({ 
      ...item, 
      category: 'Personal Belonging', 
      serialNumber: item.imei,
      trackingCode: item.tracking_code || item.id,
      itemName: `${item.brand} ${item.model}` 
    })),
    ...stolenItems.accounts.map(item => ({ 
      ...item, 
      category: 'Hacked Account', 
      serialNumber: item.account_identifier,
      trackingCode: item.tracking_code || item.id,
      itemName: `${item.account_type}: ${item.account_identifier}` 
    })),
    ...stolenItems.reputation.map(item => ({ 
      ...item, 
      category: 'Business Reputation', 
      serialNumber: item.reported_person_contact,
      trackingCode: item.tracking_code || item.id,
      itemName: `${item.reported_person_name} (${item.business_type})` 
    })),
  ].sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime()) : [];
  
  const toggleVisibility = async (reportId: string, category: string) => {
    try {
      const getTableName = (cat: string) => {
        switch(cat) {
          case 'Person/Pet': return 'persons';
          case 'Device': return 'devices';
          case 'Vehicle': return 'vehicles';
          case 'Household Item': return 'household_items';
          case 'Personal Belonging': return 'personal_belongings';
          case 'Hacked Account': return 'hacked_accounts';
          case 'Business Reputation': return 'business_reputation_reports';
          default: return 'persons';
        }
      };
      const tableName = getTableName(category);
      
      // First get current visibility status
      const { data: current } = await supabase
        .from(tableName)
        .select('visible')
        .eq('id', reportId)
        .single();
      
      // Toggle visibility
      const { error } = await supabase
        .from(tableName)
        .update({ visible: !current?.visible })
        .eq('id', reportId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Report ${!current?.visible ? 'made visible' : 'hidden from public view'}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update report visibility",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string, category: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    
    try {
      const tableName = category === 'Person/Pet' ? 'persons' : category === 'Device' ? 'devices' : 'vehicles';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', reportId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete report",
        variant: "destructive",
      });
    }
  };
  const getStatusBadge = (status: string) => {
    const statusColors = {
      missing: "bg-red-100 text-red-800",
      found: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-blue-100 text-blue-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const copyTrackingCode = (trackingCode: string) => {
    navigator.clipboard.writeText(trackingCode);
    toast({
      title: "Copied!",
      description: "Tracking code copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Stolen Items Dashboard
            {!isSuper && profile?.admin_role && (
              <Badge variant="outline">
                {profile.admin_role.replace('_', ' ').toUpperCase()} VIEW
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, serial, tracking code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="persons">Persons/Pets</SelectItem>
                <SelectItem value="devices">Devices</SelectItem>
                <SelectItem value="vehicles">Vehicles</SelectItem>
                <SelectItem value="household">Household Items</SelectItem>
                <SelectItem value="personal">Personal Belongings</SelectItem>
                <SelectItem value="accounts">Hacked Accounts</SelectItem>
                <SelectItem value="reputation">Business Reputation</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Pick date range"
                )}
              </Button>
              {showDatePicker && (
                <div className="absolute top-full left-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => setShowDatePicker(false)}>Apply</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setDateRange(undefined);
                      setShowDatePicker(false);
                    }}>Clear</Button>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => refetch()} variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-padiman-blue mx-auto mb-4"></div>
              <p>Loading stolen items...</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Tracking Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date Reported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        No stolen items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    allItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.itemName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs max-w-[100px] truncate">
                              {item.trackingCode}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyTrackingCode(item.trackingCode)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {item.location}
                            {item.country && <div className="text-xs text-gray-500">{item.country.name}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.reporter_name || 'Not provided'}</div>
                            {item.reporter_email && (
                              <div className="text-xs text-blue-600">{item.reporter_email}</div>
                            )}
                            {item.reporter_phone && (
                              <div className="text-xs text-gray-600">{item.reporter_phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.contact}</TableCell>
                        <TableCell>{format(new Date(item.report_date), "MMM dd, yyyy HH:mm")}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Report Details</DialogTitle>
                              </DialogHeader>
                              <ReportDetails 
                                reportId={item.id} 
                                reportType={item.category === 'Person/Pet' ? 'person' : item.category === 'Device' ? 'device' : 'vehicle'} 
                              />
                              {isSuper && (
                                 <div className="mt-6 pt-4 border-t flex gap-2">
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => toggleVisibility(item.id, item.category)}
                                     className="flex-1"
                                   >
                                     {item.visible !== false ? 'Hide Report' : 'Show Report'}
                                   </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteReport(item.id, item.category)}
                                    className="flex-1"
                                  >
                                    Delete Report
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StolenItemsDashboard;
