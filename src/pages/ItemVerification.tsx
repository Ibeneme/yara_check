import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  User,
  ShieldAlert,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import PhotoSearch from "@/components/reports/PhotoSearch";
import ContactActions from "@/components/reports/ContactActions";
import HiddenReportMessage from "@/components/search/HiddenReportMessage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ItemVerification = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    hidden?: boolean;
    item?: any;
    type?: string;
  } | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleTabChange = () => {
    setSearchQuery("");
    setSearchResult(null);
  };

  const handleItemSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter an IMEI or serial number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const { data: allDeviceResults, error: allDeviceError } = await supabase
        .from("devices")
        .select("*")
        .eq("imei", searchQuery.trim());

      if (allDeviceError) throw allDeviceError;

      if (allDeviceResults && allDeviceResults.length > 0) {
        const visibleReports = allDeviceResults.filter(
          (device) => device.visible !== false
        );

        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: "device",
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allDeviceResults[0],
            type: "device",
          });
        }
      } else {
        setSearchResult({ found: false });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVehicleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a chassis/VIN number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const { data: allVehicleResults, error: allVehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("chassis", searchQuery.trim());

      if (allVehicleError) throw allVehicleError;

      if (allVehicleResults && allVehicleResults.length > 0) {
        const visibleReports = allVehicleResults.filter(
          (vehicle) => vehicle.visible !== false
        );

        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: "vehicle",
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allVehicleResults[0],
            type: "vehicle",
          });
        }
      } else {
        setSearchResult({ found: false });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePersonSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a person's name or description",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const { data: allPersonResults, error: allPersonError } = await supabase
        .from("persons")
        .select("*")
        .or(
          `name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,physical_attributes.ilike.%${searchQuery.trim()}%`
        );

      if (allPersonError) throw allPersonError;

      if (allPersonResults && allPersonResults.length > 0) {
        const visibleReports = allPersonResults.filter(
          (person) => person.visible !== false
        );

        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: "person",
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allPersonResults[0],
            type: "person",
          });
        }
      } else {
        setSearchResult({ found: false });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccountSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter an account identifier",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const { data: allAccountResults, error: allAccountError } = await supabase
        .from("hacked_accounts")
        .select("*")
        .ilike("account_identifier", `%${searchQuery.trim()}%`);

      if (allAccountError) throw allAccountError;

      if (allAccountResults && allAccountResults.length > 0) {
        const visibleReports = allAccountResults.filter(
          (account) => account.visible !== false
        );

        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: "account",
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allAccountResults[0],
            type: "account",
          });
        }
      } else {
        setSearchResult({ found: false });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReputationSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a person's name or business identifier",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const { data: allReputationResults, error: allReputationError } =
        await supabase
          .from("business_reputation_reports")
          .select("*")
          .or(
            `reported_person_name.ilike.%${searchQuery.trim()}%,reported_person_contact.ilike.%${searchQuery.trim()}%,business_type.ilike.%${searchQuery.trim()}%`
          );

      if (allReputationError) throw allReputationError;

      if (allReputationResults && allReputationResults.length > 0) {
        const visibleReports = allReputationResults.filter(
          (report) => report.visible !== false
        );

        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: "reputation",
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allReputationResults[0],
            type: "reputation",
          });
        }
      } else {
        setSearchResult({ found: false });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleHouseholdSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter an IMEI/serial number or item details",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      let allHouseholdResults = [];
      const { data: imeiResults, error: imeiError } = await supabase
        .from("household_items")
        .select("*")
        .eq("imei", searchQuery.trim());

      if (imeiError) throw imeiError;

      if (imeiResults && imeiResults.length > 0) {
        allHouseholdResults = imeiResults;
      } else {
        const { data: keywordResults, error: keywordError } = await supabase
          .from("household_items")
          .select("*")
          .or(
            `type.ilike.%${searchQuery.trim()}%,brand.ilike.%${searchQuery.trim()}%,model.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`
          );

        if (keywordError) throw keywordError;
        allHouseholdResults = keywordResults || [];
      }

      if (allHouseholdResults && allHouseholdResults.length > 0) {
        const visibleReports = allHouseholdResults.filter(
          (item) => item.visible !== false
        );

        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: "household",
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allHouseholdResults[0],
            type: "household",
          });
        }
      } else {
        setSearchResult({ found: false });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePersonalSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter an IMEI/serial number or item details",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      let allPersonalResults = [];
      const { data: imeiResults, error: imeiError } = await supabase
        .from("personal_belongings")
        .select("*")
        .eq("imei", searchQuery.trim());

      if (imeiError) throw imeiError;

      if (imeiResults && imeiResults.length > 0) {
        allPersonalResults = imeiResults;
      } else {
        const { data: keywordResults, error: keywordError } = await supabase
          .from("personal_belongings")
          .select("*")
          .or(
            `type.ilike.%${searchQuery.trim()}%,brand.ilike.%${searchQuery.trim()}%,model.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`
          );

        if (keywordError) throw keywordError;
        allPersonalResults = keywordResults || [];
      }

      if (allPersonalResults && allPersonalResults.length > 0) {
        const visibleReports = allPersonalResults.filter(
          (item) => item.visible !== false
        );

        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: "personal",
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allPersonalResults[0],
            type: "personal",
          });
        }
      } else {
        setSearchResult({ found: false });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const tabTriggerClass =
    "bg-white text-slate-700 border-2 border-slate-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-500 data-[state=active]:bg-[length:200%_200%] data-[state=active]:animate-gradient data-[state=active]:text-white data-[state=active]:border-transparent text-xs sm:text-sm px-3 py-3 sm:py-3.5 h-12 sm:h-14 flex items-center justify-center text-center leading-tight rounded-xl transition-all font-semibold font-sans whitespace-normal";

  const primaryButtonClass =
    "w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-[length:200%_200%] animate-gradient hover:opacity-95 text-white transition-all font-sans font-semibold h-12 rounded-xl text-sm border-0";

  const inputClass =
    "bg-white border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-indigo-600 font-sans h-12 rounded-xl text-slate-900 ";

  const labelClass =
    "block text-xs font-bold uppercase tracking-wider mb-2 text-indigo-600 font-sans";

  return (
    <div className="flex flex-col min-h-screen  relative">
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradientAnimation 6s ease infinite;
        }
      `}</style>

      <main className="flex-grow py-8 sm:py-4">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-8 border-b-2 border-indigo-100 pb-6">
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-[length:200%_200%] animate-gradient text-white font-bold px-3 py-1 rounded-full mb-3 ">
              Secure System Registry
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Verification Portal
            </h1>
          </div>

          <Card className="mb-8 border-2 border-slate-100 rounded-2xl bg-white ">
            <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2.5 text-slate-900 font-sans font-bold text-base sm:text-lg">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                  <Search className="h-4 w-4" />
                </div>
                {t("verification.searchTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-6">
              <Tabs
                defaultValue="items"
                className="w-full"
                onValueChange={handleTabChange}
              >
                <TabsList className="w-full bg-transparent p-0 h-auto mb-6 block">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <TabsTrigger value="items" className={tabTriggerClass}>
                      Stolen Devices
                    </TabsTrigger>
                    <TabsTrigger value="household" className={tabTriggerClass}>
                      Household Items
                    </TabsTrigger>
                    <TabsTrigger value="personal" className={tabTriggerClass}>
                      Personal Items
                    </TabsTrigger>
                    <TabsTrigger value="vehicles" className={tabTriggerClass}>
                      {t("verification.vehicles")}
                    </TabsTrigger>
                    <TabsTrigger value="persons" className={tabTriggerClass}>
                      {t("verification.missingPersons")}
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className={tabTriggerClass}>
                      Hacked Accounts
                    </TabsTrigger>
                    <TabsTrigger value="reputation" className={tabTriggerClass}>
                      Business Reputation
                    </TabsTrigger>
                    <TabsTrigger value="photo" className={tabTriggerClass}>
                      Photo Search
                    </TabsTrigger>
                  </div>
                </TabsList>

                <TabsContent value="items" className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="item-search" className={labelClass}>
                      Enter IMEI or Serial Number
                    </label>
                    <Input
                      id="item-search"
                      type="text"
                      placeholder="e.g., 356987102345678"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleItemSearch()}
                      className={inputClass}
                    />
                  </div>
                  <Button
                    onClick={handleItemSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? "Searching registry..." : "Verify Device"}
                  </Button>
                </TabsContent>

                <TabsContent value="household" className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="household-search" className={labelClass}>
                      Enter IMEI/Serial Number or Details
                    </label>
                    <Input
                      id="household-search"
                      type="text"
                      placeholder="e.g., Samsung TV, Refrigerator"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleHouseholdSearch()
                      }
                      className={inputClass}
                    />
                  </div>
                  <Button
                    onClick={handleHouseholdSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching
                      ? "Searching registry..."
                      : "Verify Household Item"}
                  </Button>
                </TabsContent>

                <TabsContent value="personal" className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="personal-search" className={labelClass}>
                      Enter IMEI/Serial Number or Details
                    </label>
                    <Input
                      id="personal-search"
                      type="text"
                      placeholder="e.g., Smartwatch, Laptop"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handlePersonalSearch()
                      }
                      className={inputClass}
                    />
                  </div>
                  <Button
                    onClick={handlePersonalSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching
                      ? "Searching registry..."
                      : "Verify Personal Item"}
                  </Button>
                </TabsContent>

                <TabsContent value="vehicles" className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="vehicle-search" className={labelClass}>
                      Enter Chassis / VIN Number
                    </label>
                    <Input
                      id="vehicle-search"
                      type="text"
                      placeholder="e.g., WVWZZZ1JZYW123456"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleVehicleSearch()
                      }
                      className={inputClass}
                    />
                  </div>
                  <Button
                    onClick={handleVehicleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? "Searching registry..." : "Verify Vehicle"}
                  </Button>
                </TabsContent>

                <TabsContent value="persons" className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="person-search" className={labelClass}>
                      Enter Name or Description
                    </label>
                    <Input
                      id="person-search"
                      type="text"
                      placeholder="e.g., John Doe"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handlePersonSearch()
                      }
                      className={inputClass}
                    />
                  </div>
                  <Button
                    onClick={handlePersonSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching
                      ? "Searching registry..."
                      : "Search Missing Person"}
                  </Button>
                </TabsContent>

                <TabsContent value="accounts" className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="account-search" className={labelClass}>
                      Enter Account Identifier
                    </label>
                    <Input
                      id="account-search"
                      type="text"
                      placeholder="e.g., username, email, phone"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAccountSearch()
                      }
                      className={inputClass}
                    />
                  </div>
                  <Button
                    onClick={handleAccountSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? "Searching registry..." : "Check Account"}
                  </Button>
                </TabsContent>

                <TabsContent value="reputation" className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="reputation-search" className={labelClass}>
                      Enter Name or Business Details
                    </label>
                    <Input
                      id="reputation-search"
                      type="text"
                      placeholder="e.g., John Doe, ABC Company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleReputationSearch()
                      }
                      className={inputClass}
                    />
                  </div>
                  <Button
                    onClick={handleReputationSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? "Searching registry..." : "Check Reputation"}
                  </Button>
                </TabsContent>

                <TabsContent value="photo" className="space-y-4 pt-1">
                  <PhotoSearch />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Search Results Card */}
          {searchResult && (
            <Card
              className={`rounded-2xl bg-white border-2  ${
                searchResult.found && !searchResult.hidden
                  ? "border-rose-500"
                  : "border-emerald-500"
              }`}
            >
              <CardHeader
                className={`py-4 px-6 border-b rounded-t-2xl ${
                  searchResult.found && !searchResult.hidden
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-emerald-50 border-emerald-100 text-emerald-800"
                }`}
              >
                <CardTitle className="font-sans font-bold text-sm sm:text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {searchResult.found && !searchResult.hidden ? (
                      <>
                        <ShieldAlert className="h-5 w-5 text-rose-600" />
                        FLAGGED RECORD MATCHED
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        Verification Result
                      </>
                    )}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      searchResult.found && !searchResult.hidden
                        ? "bg-rose-200 text-rose-800"
                        : "bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    {searchResult.found
                      ? searchResult.hidden
                        ? "Status: Confidential"
                        : "Status: Active Flag"
                      : "Status: Clear"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {searchResult.found ? (
                  searchResult.hidden ? (
                    <HiddenReportMessage searchTerm={searchQuery} />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-slate-100">
                        <div className="flex items-start gap-3.5">
                          {searchResult.type === "person" ? (
                            <div className="bg-rose-100 p-3 rounded-xl text-rose-600 mt-0.5">
                              <User className="h-6 w-6" />
                            </div>
                          ) : (
                            <div className="bg-rose-100 p-3 rounded-xl text-rose-600 mt-0.5">
                              <AlertTriangle className="h-6 w-6" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-base font-bold text-slate-900">
                              {searchResult.type === "person"
                                ? "Missing Person Report Active"
                                : "Item / Asset Reported Lost or Stolen"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Exercise high caution before proceeding with any
                              transaction or engagement.
                            </p>
                          </div>
                        </div>

                        {searchResult.item.image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={searchResult.item.image_url}
                              alt="Evidence"
                              onClick={() =>
                                setModalImage(searchResult.item.image_url)
                              }
                              className="w-24 h-24 object-cover rounded-xl border-2 border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">
                          Attributes Registry Data
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {Object.entries(searchResult.item).map(
                            ([key, val]) => {
                              if (
                                ["id", "image_url", "visible"].includes(key) ||
                                val === null ||
                                val === undefined ||
                                String(val).trim() === ""
                              )
                                return null;
                              return (
                                <div
                                  key={key}
                                  className="bg-slate-50 p-3.5 rounded-xl border-2 border-slate-100 flex flex-col"
                                >
                                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-slate-900 font-semibold break-words">
                                    {String(val)}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6">
                    <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      No Records Found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      No active listings or flags match this query string in the
                      registry.
                    </p>
                  </div>
                )}

                {searchResult.found &&
                  !searchResult.hidden &&
                  searchResult.type && (
                    <div className="mt-6 pt-5 border-t-2 border-slate-100">
                      <ContactActions
                        reportId={searchResult.item.id}
                        reportType={searchResult.type as any}
                        reportData={searchResult.item}
                      />
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl p-3 border-2 border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-2 hover:bg-slate-800 transition-colors border-2 border-white"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={modalImage}
              alt="Enlarged Evidence"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemVerification;
