import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  Eye,
  Copy,
  Loader2,
  ShieldAlert,
} from "lucide-react";
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

  const {
    data: stolenItems,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "stolen-items",
      searchQuery,
      itemTypeFilter,
      dateRange,
      user?.id,
    ],
    queryFn: async () => {
      if (!user?.id)
        return {
          persons: [],
          devices: [],
          vehicles: [],
          household: [],
          personal: [],
          accounts: [],
          reputation: [],
        };

      let personsQuery = supabase
        .from("persons")
        .select(
          `
        id, name, age, gender, physical_attributes, description, location, 
        date_missing, status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code, visible,
        country:countries(name)
      `
        )
        .order("report_date", { ascending: false });

      let devicesQuery = supabase
        .from("devices")
        .select(
          `
        id, type, brand, model, color, imei, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code, visible,
        country:countries(name)
      `
        )
        .order("report_date", { ascending: false });

      let vehiclesQuery = supabase
        .from("vehicles")
        .select(
          `
        id, type, brand, model, year, color, chassis, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code, visible,
        country:countries(name)
      `
        )
        .order("report_date", { ascending: false });

      let householdQuery = supabase
        .from("household_items")
        .select(
          `
        id, type, brand, model, year, color, imei, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code, visible,
        country:countries(name)
      `
        )
        .order("report_date", { ascending: false });

      let personalQuery = supabase
        .from("personal_belongings")
        .select(
          `
        id, type, brand, model, year, color, imei, description, location, 
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code, visible,
        country:countries(name)
      `
        )
        .order("report_date", { ascending: false });

      let accountsQuery = supabase
        .from("hacked_accounts")
        .select(
          `
        id, account_type, account_identifier, description, date_compromised,
        status, contact, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, image_url, tracking_code, visible,
        country:countries(name)
      `
        )
        .order("report_date", { ascending: false });

      let reputationQuery = supabase
        .from("business_reputation_reports")
        .select(
          `
        id, reported_person_name, reported_person_contact, business_type, 
        transaction_date, transaction_amount, reputation_status, description, evidence,
        status, reporter_name, reporter_email, 
        reporter_phone, reporter_address, report_date, tracking_code, visible,
        country:countries(name)
      `
        )
        .order("report_date", { ascending: false });

      if (searchQuery) {
        personsQuery = personsQuery.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`
        );
        devicesQuery = devicesQuery.or(
          `imei.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`
        );
        vehiclesQuery = vehiclesQuery.or(
          `chassis.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`
        );
        householdQuery = householdQuery.or(
          `imei.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`
        );
        personalQuery = personalQuery.or(
          `imei.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`
        );
        accountsQuery = accountsQuery.or(
          `account_identifier.ilike.%${searchQuery}%,account_type.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`
        );
        reputationQuery = reputationQuery.or(
          `reported_person_name.ilike.%${searchQuery}%,business_type.ilike.%${searchQuery}%,tracking_code.ilike.%${searchQuery}%`
        );
      }

      if (dateRange?.from) {
        const fromIso = dateRange.from.toISOString();
        personsQuery = personsQuery.gte("report_date", fromIso);
        devicesQuery = devicesQuery.gte("report_date", fromIso);
        vehiclesQuery = vehiclesQuery.gte("report_date", fromIso);
        householdQuery = householdQuery.gte("report_date", fromIso);
        personalQuery = personalQuery.gte("report_date", fromIso);
        accountsQuery = accountsQuery.gte("report_date", fromIso);
        reputationQuery = reputationQuery.gte("report_date", fromIso);
      }
      if (dateRange?.to) {
        const toIso = dateRange.to.toISOString();
        personsQuery = personsQuery.lte("report_date", toIso);
        devicesQuery = devicesQuery.lte("report_date", toIso);
        vehiclesQuery = vehiclesQuery.lte("report_date", toIso);
        householdQuery = householdQuery.lte("report_date", toIso);
        personalQuery = personalQuery.lte("report_date", toIso);
        accountsQuery = accountsQuery.lte("report_date", toIso);
        reputationQuery = reputationQuery.lte("report_date", toIso);
      }

      const [
        personsResult,
        devicesResult,
        vehiclesResult,
        householdResult,
        personalResult,
        accountsResult,
        reputationResult,
      ] = await Promise.all([
        itemTypeFilter === "all" || itemTypeFilter === "persons"
          ? personsQuery
          : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "devices"
          ? devicesQuery
          : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "vehicles"
          ? vehiclesQuery
          : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "household"
          ? householdQuery
          : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "personal"
          ? personalQuery
          : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "accounts"
          ? accountsQuery
          : Promise.resolve({ data: [] }),
        itemTypeFilter === "all" || itemTypeFilter === "reputation"
          ? reputationQuery
          : Promise.resolve({ data: [] }),
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

  const allItems = stolenItems
    ? [
        ...stolenItems.persons.map((item) => ({
          ...item,
          category: "Person/Pet",
          serialNumber: item.id,
          trackingCode: item.tracking_code || item.id,
          itemName: item.name,
        })),
        ...stolenItems.devices.map((item) => ({
          ...item,
          category: "Device",
          serialNumber: item.imei,
          trackingCode: item.tracking_code || item.id,
          itemName:
            `${item.brand || ""} ${item.model || ""}`.trim() || "Device",
        })),
        ...stolenItems.vehicles.map((item) => ({
          ...item,
          category: "Vehicle",
          serialNumber: item.chassis,
          trackingCode: item.tracking_code || item.id,
          itemName:
            `${item.brand || ""} ${item.model || ""}`.trim() || "Vehicle",
        })),
        ...stolenItems.household.map((item) => ({
          ...item,
          category: "Household Item",
          serialNumber: item.imei,
          trackingCode: item.tracking_code || item.id,
          itemName:
            `${item.brand || ""} ${item.model || ""}`.trim() ||
            "Household Item",
        })),
        ...stolenItems.personal.map((item) => ({
          ...item,
          category: "Personal Belonging",
          serialNumber: item.imei,
          trackingCode: item.tracking_code || item.id,
          itemName:
            `${item.brand || ""} ${item.model || ""}`.trim() ||
            "Personal Belonging",
        })),
        ...stolenItems.accounts.map((item) => ({
          ...item,
          category: "Hacked Account",
          serialNumber: item.account_identifier,
          trackingCode: item.tracking_code || item.id,
          itemName: `${item.account_type}: ${item.account_identifier}`,
        })),
        ...stolenItems.reputation.map((item) => ({
          ...item,
          category: "Business Reputation",
          serialNumber: item.reported_person_contact,
          trackingCode: item.tracking_code || item.id,
          itemName: `${item.reported_person_name} (${item.business_type})`,
        })),
      ].sort(
        (a, b) =>
          new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
      )
    : [];

  const getTableName = (cat: string) => {
    switch (cat) {
      case "Person/Pet":
        return "persons";
      case "Device":
        return "devices";
      case "Vehicle":
        return "vehicles";
      case "Household Item":
        return "household_items";
      case "Personal Belonging":
        return "personal_belongings";
      case "Hacked Account":
        return "hacked_accounts";
      case "Business Reputation":
        return "business_reputation_reports";
      default:
        return "persons";
    }
  };

  const toggleVisibility = async (reportId: string, category: string) => {
    try {
      const tableName = getTableName(category);

      const { data: current, error: fetchError } = await supabase
        .from(tableName as any)
        .select("visible")
        .eq("id", reportId)
        .single();

      if (fetchError) throw fetchError;

      const nextVisible = !(current as any)?.visible;
      const { error } = await supabase
        .from(tableName as any)
        .update({ visible: nextVisible })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report ${
          nextVisible ? "made visible" : "hidden from public view"
        }`,
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
    if (
      !window.confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const tableName = getTableName(category);

      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq("id", reportId);

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
      missing: "bg-rose-100 text-rose-800 border-rose-200",
      found: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-rose-100 text-rose-800 border-rose-200",
      pending_verification: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-muted text-muted-foreground border-border"
    );
  };

  const copyTrackingCode = (trackingCode: string) => {
    navigator.clipboard.writeText(trackingCode);
    toast({
      title: "Copied!",
      description: "Tracking code copied to clipboard",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  Stolen Items Dashboard
                </h2>
                {!isSuper && profile?.admin_role && (
                  <Badge
                    variant="outline"
                    className="border-border text-muted-foreground text-xs uppercase"
                  >
                    {profile.admin_role.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Manage, search, and monitor global catalog records across
                multiple categories.
              </p>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="h-10 self-start md:self-auto shadow-sm"
          >
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Refresh List</span>
          </Button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, serial, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background shadow-sm"
            />
          </div>

          <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
            <SelectTrigger className="h-11 bg-background shadow-sm">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Item Categories</SelectItem>
              <SelectItem value="persons">Persons / Pets</SelectItem>
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
              className="w-full h-11 justify-start text-left font-normal bg-background shadow-sm border-input hover:bg-muted/50"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate text-foreground">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Filter by Date Range"
                )}
              </span>
            </Button>
            {showDatePicker && (
              <div className="absolute top-full left-0 z-30 mt-2 bg-popover border rounded-xl shadow-xl p-4">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Button
                    size="sm"
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1"
                  >
                    Apply Range
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDateRange(undefined);
                      setShowDatePicker(false);
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading items database...
          </p>
        </div>
      ) : (
        <Card className="border shadow-sm overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="font-semibold">Item Name</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Serial / Ref</TableHead>
                  <TableHead className="font-semibold">Tracking Code</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Reporter</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Date Reported</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShieldAlert className="h-8 w-8 text-muted-foreground/50 mb-1" />
                        <p className="font-medium text-foreground">
                          No records matched your criteria
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try altering your search filters or date range
                          parameters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  allItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        {item.itemName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-normal text-xs bg-muted/40"
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.serialNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono text-foreground max-w-[100px] truncate">
                            {item.trackingCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTrackingCode(item.trackingCode)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          <span className="truncate block max-w-[120px]">
                            {item.location || "N/A"}
                          </span>
                          {item.country && (
                            <span className="text-[11px] text-muted-foreground block">
                              {item.country.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium text-foreground truncate max-w-[140px]">
                            {item.reporter_name || "Anonymous"}
                          </div>
                          {item.reporter_email && (
                            <div className="text-muted-foreground truncate max-w-[140px]">
                              {item.reporter_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs text-muted-foreground">
                        {item.contact || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(
                          new Date(item.report_date),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs border font-medium ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 gap-1 shadow-sm"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>View</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">
                                Detailed Record View
                              </DialogTitle>
                            </DialogHeader>
                            <div className="pt-2">
                              <ReportDetails
                                reportId={item.id}
                                reportType={
                                  item.category === "Person/Pet"
                                    ? "person"
                                    : item.category === "Device"
                                    ? "device"
                                    : item.category === "Vehicle"
                                    ? "vehicle"
                                    : item.category === "Household Item"
                                    ? "household_item"
                                    : item.category === "Personal Belonging"
                                    ? "personal_belonging"
                                    : item.category === "Hacked Account"
                                    ? "hacked_account"
                                    : "business_reputation"
                                }
                              />
                            </div>
                            {isSuper && (
                              <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    toggleVisibility(item.id, item.category)
                                  }
                                  className="flex-1 shadow-sm"
                                >
                                  {item.visible !== false
                                    ? "Hide from Public View"
                                    : "Make Publicly Visible"}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    deleteReport(item.id, item.category)
                                  }
                                  className="flex-1 shadow-sm"
                                >
                                  Delete Report Permanently
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
        </Card>
      )}
    </div>
  );
};

export default StolenItemsDashboard;
