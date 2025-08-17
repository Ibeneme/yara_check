import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Eye, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ReportDetails from "./ReportDetails";
import AnonymousMessages from "./AnonymousMessages";

const TrackingCodeSearch = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSearch = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Please enter a tracking code",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log("Searching for tracking code:", trackingCode.trim());
      
      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('search_by_tracking_code', {
        search_tracking_code: trackingCode.trim()
      });

      if (rpcError) {
        console.error("RPC Search error:", rpcError);
        // If RPC fails, try direct table searches
        await directTableSearch();
        return;
      }

      console.log("RPC Search results:", rpcData);
      setSearchResults(rpcData || []);

      if (!rpcData || rpcData.length === 0) {
        // Try direct search as fallback
        await directTableSearch();
      } else {
        toast({
          title: "Search completed",
          description: `Found ${rpcData.length} result(s)`,
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred while searching",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const directTableSearch = async () => {
    try {
      console.log("Performing direct table search for:", trackingCode.trim());
      
      // Initialize arrays
      let persons: any[] = [];
      let devices: any[] = [];
      let vehicles: any[] = [];
      let household: any[] = [];
      let personal: any[] = [];
      let accounts: any[] = [];
      let reputation: any[] = [];

      // Search in persons table by tracking_code OR by ID (for legacy reports)
      const { data: personsData } = await supabase
        .from('persons')
        .select('*')
        .or(`tracking_code.eq.${trackingCode.trim()},id.eq.${trackingCode.trim()}`);
      if (personsData) persons = [...personsData];

      // Search in devices table by tracking_code OR by ID (for legacy reports)
      const { data: devicesData } = await supabase
        .from('devices')
        .select('*')
        .or(`tracking_code.eq.${trackingCode.trim()},id.eq.${trackingCode.trim()}`);
      if (devicesData) devices = [...devicesData];

      // Search in vehicles table by tracking_code OR by ID (for legacy reports)
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .or(`tracking_code.eq.${trackingCode.trim()},id.eq.${trackingCode.trim()}`);
      if (vehiclesData) vehicles = [...vehiclesData];

      // Search in household_items table by tracking_code OR by ID (for legacy reports)
      const { data: householdData } = await supabase
        .from('household_items')
        .select('*')
        .or(`tracking_code.eq.${trackingCode.trim()},id.eq.${trackingCode.trim()}`);
      if (householdData) household = [...householdData];

      // Search in personal_belongings table by tracking_code OR by ID (for legacy reports)
      const { data: personalData } = await supabase
        .from('personal_belongings')
        .select('*')
        .or(`tracking_code.eq.${trackingCode.trim()},id.eq.${trackingCode.trim()}`);
      if (personalData) personal = [...personalData];

      // Search in hacked_accounts table by tracking_code OR by ID (for legacy reports)
      const { data: accountsData } = await supabase
        .from('hacked_accounts')
        .select('*')
        .or(`tracking_code.eq.${trackingCode.trim()},id.eq.${trackingCode.trim()}`);
      if (accountsData) accounts = [...accountsData];

      // Search in business_reputation_reports table by tracking_code OR by ID (for legacy reports)
      const { data: reputationData } = await supabase
        .from('business_reputation_reports')
        .select('*')
        .or(`tracking_code.eq.${trackingCode.trim()},id.eq.${trackingCode.trim()}`);
      if (reputationData) reputation = [...reputationData];

      // Also search by IMEI in devices
      if (trackingCode.trim().length >= 10) {
        const { data: devicesByIMEI } = await supabase
          .from('devices')
          .select('*')
          .eq('imei', trackingCode.trim());
        
        if (devicesByIMEI && devicesByIMEI.length > 0) {
          devices.push(...devicesByIMEI);
        }
      }

      // Also search by chassis in vehicles  
      if (trackingCode.trim().length >= 10) {
        const { data: vehiclesByChassis } = await supabase
          .from('vehicles')
          .select('*')
          .eq('chassis', trackingCode.trim());
        
        if (vehiclesByChassis && vehiclesByChassis.length > 0) {
          vehicles.push(...vehiclesByChassis);
        }
      }

      // Search by name in persons
      const { data: personsByName } = await supabase
        .from('persons')
        .select('*')
        .ilike('name', `%${trackingCode.trim()}%`);
      
      if (personsByName && personsByName.length > 0) {
        persons.push(...personsByName);
      }

      // Search by account identifier (username) in hacked accounts
      const { data: accountsByIdentifier } = await supabase
        .from('hacked_accounts')
        .select('*')
        .ilike('account_identifier', `%${trackingCode.trim()}%`);
      
      if (accountsByIdentifier && accountsByIdentifier.length > 0) {
        accounts.push(...accountsByIdentifier);
      }

      // Search by brand name in vehicles (e.g., "Toyota")
      const { data: vehiclesByBrand } = await supabase
        .from('vehicles')
        .select('*')
        .ilike('brand', `%${trackingCode.trim()}%`);
      
      if (vehiclesByBrand && vehiclesByBrand.length > 0) {
        vehicles.push(...vehiclesByBrand);
      }

      // Search by model name in vehicles
      const { data: vehiclesByModel } = await supabase
        .from('vehicles')
        .select('*')
        .ilike('model', `%${trackingCode.trim()}%`);
      
      if (vehiclesByModel && vehiclesByModel.length > 0) {
        vehicles.push(...vehiclesByModel);
      }

      // Search by brand name in devices
      const { data: devicesByBrand } = await supabase
        .from('devices')
        .select('*')
        .ilike('brand', `%${trackingCode.trim()}%`);
      
      if (devicesByBrand && devicesByBrand.length > 0) {
        devices.push(...devicesByBrand);
      }

      // Search by model name in devices
      const { data: devicesByModel } = await supabase
        .from('devices')
        .select('*')
        .ilike('model', `%${trackingCode.trim()}%`);
      
      if (devicesByModel && devicesByModel.length > 0) {
        devices.push(...devicesByModel);
      }

      // Search by IMEI in household items
      if (trackingCode.trim().length >= 10) {
        const { data: householdByIMEI } = await supabase
          .from('household_items')
          .select('*')
          .eq('imei', trackingCode.trim());
        
        if (householdByIMEI && householdByIMEI.length > 0) {
          household.push(...householdByIMEI);
        }
      }

      // Search by brand name in household items
      const { data: householdByBrand } = await supabase
        .from('household_items')
        .select('*')
        .ilike('brand', `%${trackingCode.trim()}%`);
      
      if (householdByBrand && householdByBrand.length > 0) {
        household.push(...householdByBrand);
      }

      // Search by model name in household items
      const { data: householdByModel } = await supabase
        .from('household_items')
        .select('*')
        .ilike('model', `%${trackingCode.trim()}%`);
      
      if (householdByModel && householdByModel.length > 0) {
        household.push(...householdByModel);
      }

      // Search by IMEI in personal belongings
      if (trackingCode.trim().length >= 10) {
        const { data: personalByIMEI } = await supabase
          .from('personal_belongings')
          .select('*')
          .eq('imei', trackingCode.trim());
        
        if (personalByIMEI && personalByIMEI.length > 0) {
          personal.push(...personalByIMEI);
        }
      }

      // Search by brand name in personal belongings
      const { data: personalByBrand } = await supabase
        .from('personal_belongings')
        .select('*')
        .ilike('brand', `%${trackingCode.trim()}%`);
      
      if (personalByBrand && personalByBrand.length > 0) {
        personal.push(...personalByBrand);
      }

      // Search by model name in personal belongings
      const { data: personalByModel } = await supabase
        .from('personal_belongings')
        .select('*')
        .ilike('model', `%${trackingCode.trim()}%`);
      
      if (personalByModel && personalByModel.length > 0) {
        personal.push(...personalByModel);
      }

      console.log("Direct search results:", { persons, devices, vehicles, household, personal, accounts, reputation });

      const results = [];

      if (persons && persons.length > 0) {
        results.push(...persons.map(p => ({
          report_id: p.id,
          report_type: 'person',
          report_data: {
            id: p.id,
            name: p.name,
            age: p.age,
            gender: p.gender,
            location: p.location,
            date_missing: p.date_missing,
            status: p.status,
            report_date: p.report_date,
            image_url: p.image_url,
            tracking_code: p.tracking_code
          }
        })));
      }

      if (devices && devices.length > 0) {
        results.push(...devices.map(d => ({
          report_id: d.id,
          report_type: 'device',
          report_data: {
            id: d.id,
            type: d.type,
            brand: d.brand,
            model: d.model,
            imei: d.imei,
            location: d.location,
            status: d.status,
            report_date: d.report_date,
            image_url: d.image_url,
            tracking_code: d.tracking_code
          }
        })));
      }

      if (vehicles && vehicles.length > 0) {
        results.push(...vehicles.map(v => ({
          report_id: v.id,
          report_type: 'vehicle',
          report_data: {
            id: v.id,
            type: v.type,
            brand: v.brand,
            model: v.model,
            chassis: v.chassis,
            location: v.location,
            status: v.status,
            report_date: v.report_date,
            image_url: v.image_url,
            tracking_code: v.tracking_code
          }
        })));
      }

      if (household && household.length > 0) {
        results.push(...household.map(h => ({
          report_id: h.id,
          report_type: 'household',
          report_data: {
            id: h.id,
            type: h.type,
            brand: h.brand,
            model: h.model,
            imei: h.imei,
            location: h.location,
            status: h.status,
            report_date: h.report_date,
            image_url: h.image_url,
            tracking_code: h.tracking_code
          }
        })));
      }

      if (personal && personal.length > 0) {
        results.push(...personal.map(p => ({
          report_id: p.id,
          report_type: 'personal',
          report_data: {
            id: p.id,
            type: p.type,
            brand: p.brand,
            model: p.model,
            imei: p.imei,
            location: p.location,
            status: p.status,
            report_date: p.report_date,
            image_url: p.image_url,
            tracking_code: p.tracking_code
          }
        })));
      }

      if (accounts && accounts.length > 0) {
        results.push(...accounts.map(a => ({
          report_id: a.id,
          report_type: 'account',
          report_data: {
            id: a.id,
            account_type: a.account_type,
            account_identifier: a.account_identifier,
            date_compromised: a.date_compromised,
            status: a.status,
            report_date: a.report_date,
            description: a.description,
            tracking_code: a.tracking_code
          }
        })));
      }

      if (reputation && reputation.length > 0) {
        results.push(...reputation.map(r => ({
          report_id: r.id,
          report_type: 'reputation',
          report_data: {
            id: r.id,
            reported_person_name: r.reported_person_name,
            reported_person_contact: r.reported_person_contact,
            business_type: r.business_type,
            reputation_status: r.reputation_status,
            status: r.status,
            report_date: r.report_date,
            description: r.description,
            tracking_code: r.tracking_code
          }
        })));
      }

      setSearchResults(results);

      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "No reports found with this tracking code.",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${results.length} result(s)`,
        });
      }
    } catch (error: any) {
      console.error("Direct search error:", error);
      toast({
        title: "Search failed",
        description: "Unable to search reports. Please try again.",
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

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'person': return 'Missing Person';
      case 'device': return 'Stolen Device';
      case 'vehicle': return 'Stolen Vehicle';
      case 'household': return 'Household Item';
      case 'personal': return 'Personal Belonging';
      case 'account': return 'Hacked Account';
      case 'reputation': return 'Business Reputation';
      default: return 'Report';
    }
  };

  const getItemName = (result: any) => {
    const data = result.report_data;
    switch (result.report_type) {
      case 'person':
        return data.name;
      case 'device':
        return `${data.brand} ${data.model}`;
      case 'vehicle':
        return `${data.brand} ${data.model}`;
      case 'household':
        return `${data.brand} ${data.model} (${data.type})`;
      case 'personal':
        return `${data.brand} ${data.model} (${data.type})`;
      case 'account':
        return `${data.account_type}: ${data.account_identifier}`;
      case 'reputation':
        return `${data.reported_person_name} (${data.business_type})`;
      default:
        return 'Unknown';
    }
  };

  const handleStatusUpdate = async (reportId: string, reportType: string) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.rpc('update_report_status', {
        report_id_param: reportId,
        report_type_param: reportType,
        new_status: 'resolved'
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Success",
          description: "Report marked as resolved successfully!",
        });
        // Refresh search results
        await handleSearch();
      } else {
        toast({
          title: "Error",
          description: "Failed to update report status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Status update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update report status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Track Your Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter tracking code, serial number, brand name (e.g., Toyota), or product name..."
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result) => (
                  <div key={result.report_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      {result.report_data.image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={result.report_data.image_url} 
                            alt={getItemName(result)}
                            className="w-24 h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getItemName(result)}
                          </h3>
                          <Badge variant="outline">
                            {getReportTypeLabel(result.report_type)}
                          </Badge>
                          <Badge className={getStatusBadge(result.report_data.status)}>
                            {result.report_data.status}
                          </Badge>
                        </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {result.report_data.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(result.report_data.report_date), "MMM dd, yyyy")}
                        </div>
                      </div>

                       <div className="text-sm">
                         <strong>Tracking Code:</strong> 
                         <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                           {result.report_data.tracking_code || trackingCode}
                         </code>
                       </div>

                      <div className="mt-2">
                        <Button 
                          size="sm"
                          onClick={() => handleStatusUpdate(result.report_id, result.report_type)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark as Resolved
                        </Button>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                         <DialogHeader>
                           <DialogTitle>Report Details</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-6">
                           <ReportDetails 
                             reportId={result.report_id} 
                             reportType={result.report_type} 
                           />
                           <AnonymousMessages 
                             reportId={result.report_id} 
                             reportType={result.report_type}
                             showForReporter={true}
                           />
                         </div>
                       </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackingCodeSearch;
