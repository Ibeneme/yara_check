import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const { t } = useTranslation();

  // Auto scroll to main content when page loads
  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
      console.log("Searching for item:", searchQuery.trim());

      // First check if any reports exist (including hidden ones)
      const { data: allDeviceResults, error: allDeviceError } = await supabase
        .from("devices")
        .select("*")
        .eq("imei", searchQuery.trim());

      if (allDeviceError) throw allDeviceError;

      if (allDeviceResults && allDeviceResults.length > 0) {
        // Check if any visible reports exist
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
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allDeviceResults[0],
            type: "device",
          });
        }
      } else {
        setSearchResult({
          found: false,
        });
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
      console.log("Searching for vehicle:", searchQuery.trim());

      // First check if any reports exist (including hidden ones)
      const { data: allVehicleResults, error: allVehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("chassis", searchQuery.trim());

      if (allVehicleError) throw allVehicleError;

      if (allVehicleResults && allVehicleResults.length > 0) {
        // Check if any visible reports exist
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
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allVehicleResults[0],
            type: "vehicle",
          });
        }
      } else {
        setSearchResult({
          found: false,
        });
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
      console.log("Searching for person:", searchQuery.trim());

      // First check if any reports exist (including hidden ones)
      const { data: allPersonResults, error: allPersonError } = await supabase
        .from("persons")
        .select("*")
        .or(
          `name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,physical_attributes.ilike.%${searchQuery.trim()}%`
        );

      if (allPersonError) throw allPersonError;

      if (allPersonResults && allPersonResults.length > 0) {
        // Check if any visible reports exist
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
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allPersonResults[0],
            type: "person",
          });
        }
      } else {
        setSearchResult({
          found: false,
        });
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
      console.log("Searching for account:", searchQuery.trim());

      // First check if any reports exist (including hidden ones)
      const { data: allAccountResults, error: allAccountError } = await supabase
        .from("hacked_accounts")
        .select("*")
        .ilike("account_identifier", `%${searchQuery.trim()}%`);

      if (allAccountError) throw allAccountError;

      if (allAccountResults && allAccountResults.length > 0) {
        // Check if any visible reports exist
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
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allAccountResults[0],
            type: "account",
          });
        }
      } else {
        setSearchResult({
          found: false,
        });
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
      console.log("Searching for business reputation:", searchQuery.trim());

      // Search business reputation reports
      const { data: allReputationResults, error: allReputationError } =
        await supabase
          .from("business_reputation_reports")
          .select("*")
          .or(
            `reported_person_name.ilike.%${searchQuery.trim()}%,reported_person_contact.ilike.%${searchQuery.trim()}%,business_type.ilike.%${searchQuery.trim()}%`
          );

      if (allReputationError) throw allReputationError;

      if (allReputationResults && allReputationResults.length > 0) {
        // Check if any visible reports exist
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
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allReputationResults[0],
            type: "reputation",
          });
        }
      } else {
        setSearchResult({
          found: false,
        });
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
      console.log("Searching for household item:", searchQuery.trim());

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
        setSearchResult({
          found: false,
        });
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
      console.log("Searching for personal belonging:", searchQuery.trim());

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
        setSearchResult({
          found: false,
        });
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
    "bg-transparent border border-[#0B1220]/15 hover:bg-[#0B1220]/[0.04] data-[state=active]:bg-[#0B1220] data-[state=active]:text-[#F1F0EC] data-[state=active]:border-[#0B1220] text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg transition-all font-sans";
  const tabTriggerClassMd =
    "bg-transparent border border-[#0B1220]/15 hover:bg-[#0B1220]/[0.04] data-[state=active]:bg-[#0B1220] data-[state=active]:text-[#F1F0EC] data-[state=active]:border-[#0B1220] text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg transition-all font-sans";
  const tabTriggerClassSm =
    "bg-transparent border border-[#0B1220]/15 hover:bg-[#0B1220]/[0.04] data-[state=active]:bg-[#0B1220] data-[state=active]:text-[#F1F0EC] data-[state=active]:border-[#0B1220] text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg transition-all font-sans";

  const primaryButtonClass =
    "w-full bg-[#FF5A36] hover:brightness-95 text-white transition-all font-sans font-semibold";

  const inputClass = "border-[#0B1220]/15 focus:border-[#0B1220] font-sans";

  const labelClass = "block text-sm font-medium mb-2 text-[#0B1220] font-sans";

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F0EC] font-sans">
      <Header />

      <main className="flex-grow py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#0B1220]/40">
              Case lookup
            </span>
            <h1 className="font-sans text-3xl font-semibold text-[#0B1220] mt-2 mb-4">
              Verify
            </h1>
            <p className="text-lg text-[#0B1220]/60">
              {t("verification.subtitle")}
            </p>
          </div>

          <Card className="mb-8 border-[#0B1220]/10 ">
            <CardHeader className="bg-[#0B1220]/[0.03] border-b border-[#0B1220]/10">
              <CardTitle className="flex items-center gap-2 text-[#0B1220] font-sans font-semibold">
                <div className="bg-[#0B1220] p-2 rounded-full">
                  <Search className="h-5 w-5 text-white" />
                </div>
                {t("verification.searchTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="w-full bg-transparent p-0 mb-8">
                  <div className="hidden lg:block w-full">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <TabsTrigger value="items" className={tabTriggerClass}>
                        Stolen Devices
                      </TabsTrigger>
                      <TabsTrigger
                        value="household"
                        className={tabTriggerClass}
                      >
                        Household Items
                      </TabsTrigger>
                      <TabsTrigger value="personal" className={tabTriggerClass}>
                        Personal Items
                      </TabsTrigger>
                      <TabsTrigger value="vehicles" className={tabTriggerClass}>
                        {t("verification.vehicles")}
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <TabsTrigger value="persons" className={tabTriggerClass}>
                        {t("verification.missingPersons")}
                      </TabsTrigger>
                      <TabsTrigger value="accounts" className={tabTriggerClass}>
                        Hacked Accounts
                      </TabsTrigger>
                      <TabsTrigger
                        value="reputation"
                        className={tabTriggerClass}
                      >
                        Business Reputation
                      </TabsTrigger>
                      <TabsTrigger value="photo" className={tabTriggerClass}>
                        Photo Search
                      </TabsTrigger>
                    </div>
                  </div>

                  <div className="hidden md:block lg:hidden w-full space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger value="items" className={tabTriggerClassMd}>
                        Stolen Devices
                      </TabsTrigger>
                      <TabsTrigger
                        value="household"
                        className={tabTriggerClassMd}
                      >
                        Household Items
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger
                        value="personal"
                        className={tabTriggerClassMd}
                      >
                        Personal Items
                      </TabsTrigger>
                      <TabsTrigger
                        value="vehicles"
                        className={tabTriggerClassMd}
                      >
                        {t("verification.vehicles")}
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger
                        value="persons"
                        className={tabTriggerClassMd}
                      >
                        {t("verification.missingPersons")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="accounts"
                        className={tabTriggerClassMd}
                      >
                        Hacked Accounts
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger
                        value="reputation"
                        className={tabTriggerClassMd}
                      >
                        Business Reputation
                      </TabsTrigger>
                      <TabsTrigger value="photo" className={tabTriggerClassMd}>
                        Photo Search
                      </TabsTrigger>
                    </div>
                  </div>

                  <div className="block md:hidden w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger value="items" className={tabTriggerClassSm}>
                        Stolen Devices
                      </TabsTrigger>
                      <TabsTrigger
                        value="household"
                        className={tabTriggerClassSm}
                      >
                        Household Items
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger
                        value="personal"
                        className={tabTriggerClassSm}
                      >
                        Personal Items
                      </TabsTrigger>
                      <TabsTrigger
                        value="vehicles"
                        className={tabTriggerClassSm}
                      >
                        {t("verification.vehicles")}
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger
                        value="persons"
                        className={tabTriggerClassSm}
                      >
                        {t("verification.missingPersons")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="accounts"
                        className={tabTriggerClassSm}
                      >
                        Hacked Accounts
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger
                        value="reputation"
                        className={tabTriggerClassSm}
                      >
                        Business Reputation
                      </TabsTrigger>
                      <TabsTrigger value="photo" className={tabTriggerClassSm}>
                        Photo Search
                      </TabsTrigger>
                    </div>
                  </div>
                </TabsList>

                <TabsContent
                  value="items"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
                  <div>
                    <label htmlFor="item-search" className={labelClass}>
                      Enter IMEI or Serial Number
                    </label>
                    <Input
                      id="item-search"
                      type="text"
                      placeholder="e.g., 123456789012345"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleItemSearch();
                        }
                      }}
                      className={inputClass}
                    />
                  </div>

                  <Button
                    onClick={handleItemSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verify Device
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent
                  value="household"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
                  <div>
                    <label htmlFor="household-search" className={labelClass}>
                      Enter IMEI/Serial Number or Item Details
                    </label>
                    <Input
                      id="household-search"
                      type="text"
                      placeholder="e.g., 123456789012345 or TV, Samsung, refrigerator"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleHouseholdSearch();
                        }
                      }}
                      className={inputClass}
                    />
                  </div>

                  <Button
                    onClick={handleHouseholdSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verify Household Item
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent
                  value="personal"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
                  <div>
                    <label htmlFor="personal-search" className={labelClass}>
                      Enter IMEI/Serial Number or Item Details
                    </label>
                    <Input
                      id="personal-search"
                      type="text"
                      placeholder="e.g., 123456789012345 or watch, jewelry, laptop"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handlePersonalSearch();
                        }
                      }}
                      className={inputClass}
                    />
                  </div>

                  <Button
                    onClick={handlePersonalSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verify Personal Item
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent
                  value="vehicles"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
                  <div>
                    <label htmlFor="vehicle-search" className={labelClass}>
                      Enter Chassis/VIN Number
                    </label>
                    <Input
                      id="vehicle-search"
                      type="text"
                      placeholder="e.g., WVWZZZ1JZYW123456"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleVehicleSearch();
                        }
                      }}
                      className={inputClass}
                    />
                  </div>

                  <Button
                    onClick={handleVehicleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verify Vehicle
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent
                  value="persons"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
                  <div>
                    <label htmlFor="person-search" className={labelClass}>
                      Enter Person's Name or Physical Description
                    </label>
                    <Input
                      id="person-search"
                      type="text"
                      placeholder="e.g., John Doe or tall, brown hair, blue eyes, scar on left hand"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handlePersonSearch();
                        }
                      }}
                      className={inputClass}
                    />
                  </div>

                  <Button
                    onClick={handlePersonSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? (
                      <>
                        <User className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Search Missing Person
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent
                  value="accounts"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
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
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAccountSearch();
                        }
                      }}
                      className={inputClass}
                    />
                  </div>

                  <Button
                    onClick={handleAccountSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Check Account
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent
                  value="reputation"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
                  <div>
                    <label htmlFor="reputation-search" className={labelClass}>
                      Enter Person's Name or Business Details
                    </label>
                    <Input
                      id="reputation-search"
                      type="text"
                      placeholder="e.g., John Doe, ABC Company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleReputationSearch();
                        }
                      }}
                      className={inputClass}
                    />
                  </div>

                  <Button
                    onClick={handleReputationSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className={primaryButtonClass}
                  >
                    {isSearching ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Check Reputation
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent
                  value="photo"
                  className="space-y-4 pt-12 md:pt-10 lg:pt-8"
                >
                  <PhotoSearch />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResult && (
            <Card
              className={` ${
                searchResult.found && !searchResult.hidden
                  ? "border-[#B3261E] border-2"
                  : "border-[#0B1220]/10"
              }`}
            >
              <CardHeader
                className={`border-b ${
                  searchResult.found && !searchResult.hidden
                    ? "bg-[#FBE9E7] border-[#B3261E]/20"
                    : "bg-[#0B1220]/[0.03] border-[#0B1220]/10"
                }`}
              >
                <CardTitle
                  className={`font-sans font-semibold ${
                    searchResult.found && !searchResult.hidden
                      ? "text-[#B3261E]"
                      : "text-[#0B1220]"
                  }`}
                >
                  {searchResult.found && !searchResult.hidden
                    ? "ALERT — REPORT FOUND"
                    : "Search Results"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {searchResult.found ? (
                  searchResult.hidden ? (
                    <HiddenReportMessage searchTerm={searchQuery} />
                  ) : (
                    <div className="border border-[#B3261E]/30 bg-[#FBE9E7]/60 p-4 rounded-lg">
                      <div className="flex items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            {searchResult.type === "person" && (
                              <div className="bg-[#B3261E]/10 p-3 rounded-full border border-[#B3261E]/30">
                                <User className="h-8 w-8 text-[#B3261E]" />
                              </div>
                            )}
                            {(searchResult.type === "device" ||
                              searchResult.type === "vehicle" ||
                              searchResult.type === "account" ||
                              searchResult.type === "household" ||
                              searchResult.type === "personal") && (
                              <div className="bg-[#B3261E]/10 p-3 rounded-full border border-[#B3261E]/30">
                                <AlertTriangle className="h-8 w-8 text-[#B3261E]" />
                              </div>
                            )}
                            {searchResult.type === "reputation" && (
                              <div className="bg-[#FF5A36]/10 p-3 rounded-full border border-[#FF5A36]/30">
                                <AlertTriangle className="h-8 w-8 text-[#FF5A36]" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-semibold text-[#B3261E] font-sans">
                                {searchResult.type === "person"
                                  ? "MISSING PERSON REPORTED"
                                  : searchResult.type === "device"
                                  ? "DEVICE REPORTED AS STOLEN"
                                  : searchResult.type === "household"
                                  ? "HOUSEHOLD ITEM REPORTED AS STOLEN"
                                  : searchResult.type === "personal"
                                  ? "PERSONAL ITEM REPORTED AS STOLEN"
                                  : searchResult.type === "vehicle"
                                  ? "VEHICLE REPORTED AS STOLEN"
                                  : searchResult.type === "account"
                                  ? "ACCOUNT REPORTED AS COMPROMISED"
                                  : searchResult.type === "reputation"
                                  ? "BUSINESS REPUTATION ALERT"
                                  : "REPORT FOUND"}
                              </h3>
                              <p className="text-[#B3261E]/90 font-medium font-sans">
                                This {searchResult.type} has been reported to
                                our system.{" "}
                                {searchResult.type === "person"
                                  ? "Please contact authorities immediately if you have information."
                                  : searchResult.type === "reputation"
                                  ? "Be careful with this transaction and do your due diligence before proceeding."
                                  : "Do not proceed with this transaction."}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white border border-[#B3261E]/20 p-4 rounded-lg">
                            <h4 className="font-medium text-[#B3261E] mb-2 font-sans">
                              Report Details:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
                              {searchResult.type === "person" && (
                                <>
                                  <div>
                                    <strong>Name:</strong>{" "}
                                    {searchResult.item.name}
                                  </div>
                                  <div>
                                    <strong>Age:</strong>{" "}
                                    {searchResult.item.age}
                                  </div>
                                  <div>
                                    <strong>Gender:</strong>{" "}
                                    {searchResult.item.gender}
                                  </div>
                                  <div>
                                    <strong>Location:</strong>{" "}
                                    {searchResult.item.location}
                                  </div>
                                  <div>
                                    <strong>Date Missing:</strong>{" "}
                                    {new Date(
                                      searchResult.item.date_missing
                                    ).toLocaleDateString()}
                                  </div>
                                </>
                              )}

                              {searchResult.type === "device" && (
                                <>
                                  <div>
                                    <strong>Type:</strong>{" "}
                                    {searchResult.item.type}
                                  </div>
                                  <div>
                                    <strong>Brand:</strong>{" "}
                                    {searchResult.item.brand}
                                  </div>
                                  <div>
                                    <strong>Model:</strong>{" "}
                                    {searchResult.item.model}
                                  </div>
                                  <div>
                                    <strong>IMEI:</strong>{" "}
                                    <span className="font-sans">
                                      {searchResult.item.imei}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Color:</strong>{" "}
                                    {searchResult.item.color}
                                  </div>
                                  <div>
                                    <strong>Location:</strong>{" "}
                                    {searchResult.item.location}
                                  </div>
                                </>
                              )}

                              {searchResult.type === "household" && (
                                <>
                                  <div>
                                    <strong>Type:</strong>{" "}
                                    {searchResult.item.type}
                                  </div>
                                  <div>
                                    <strong>Brand:</strong>{" "}
                                    {searchResult.item.brand}
                                  </div>
                                  <div>
                                    <strong>Model:</strong>{" "}
                                    {searchResult.item.model}
                                  </div>
                                  <div>
                                    <strong>IMEI/Serial:</strong>{" "}
                                    <span className="font-sans">
                                      {searchResult.item.imei}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Color:</strong>{" "}
                                    {searchResult.item.color}
                                  </div>
                                  <div>
                                    <strong>Year:</strong>{" "}
                                    {searchResult.item.year}
                                  </div>
                                  <div>
                                    <strong>Location:</strong>{" "}
                                    {searchResult.item.location}
                                  </div>
                                </>
                              )}

                              {searchResult.type === "personal" && (
                                <>
                                  <div>
                                    <strong>Type:</strong>{" "}
                                    {searchResult.item.type}
                                  </div>
                                  <div>
                                    <strong>Brand:</strong>{" "}
                                    {searchResult.item.brand}
                                  </div>
                                  <div>
                                    <strong>Model:</strong>{" "}
                                    {searchResult.item.model}
                                  </div>
                                  <div>
                                    <strong>IMEI/Serial:</strong>{" "}
                                    <span className="font-sans">
                                      {searchResult.item.imei}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Color:</strong>{" "}
                                    {searchResult.item.color}
                                  </div>
                                  <div>
                                    <strong>Year:</strong>{" "}
                                    {searchResult.item.year}
                                  </div>
                                  <div>
                                    <strong>Location:</strong>{" "}
                                    {searchResult.item.location}
                                  </div>
                                </>
                              )}

                              {searchResult.type === "vehicle" && (
                                <>
                                  <div>
                                    <strong>Type:</strong>{" "}
                                    {searchResult.item.type}
                                  </div>
                                  <div>
                                    <strong>Brand:</strong>{" "}
                                    {searchResult.item.brand}
                                  </div>
                                  <div>
                                    <strong>Model:</strong>{" "}
                                    {searchResult.item.model}
                                  </div>
                                  <div>
                                    <strong>Year:</strong>{" "}
                                    {searchResult.item.year}
                                  </div>
                                  <div>
                                    <strong>Chassis:</strong>{" "}
                                    <span className="font-sans">
                                      {searchResult.item.chassis}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Color:</strong>{" "}
                                    {searchResult.item.color}
                                  </div>
                                  <div>
                                    <strong>Location:</strong>{" "}
                                    {searchResult.item.location}
                                  </div>
                                </>
                              )}

                              {searchResult.type === "account" && (
                                <>
                                  <div>
                                    <strong>Account Type:</strong>{" "}
                                    {searchResult.item.account_type}
                                  </div>
                                  <div>
                                    <strong>Account ID:</strong>{" "}
                                    <span className="font-sans">
                                      {searchResult.item.account_identifier}
                                    </span>
                                  </div>
                                  <div>
                                    <strong>Date Compromised:</strong>{" "}
                                    {new Date(
                                      searchResult.item.date_compromised
                                    ).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <strong>Description:</strong>{" "}
                                    {searchResult.item.description}
                                  </div>
                                </>
                              )}

                              {searchResult.type === "reputation" && (
                                <>
                                  <div>
                                    <strong>Person/Business:</strong>{" "}
                                    {searchResult.item.reported_person_name}
                                  </div>
                                  <div>
                                    <strong>Business Type:</strong>{" "}
                                    {searchResult.item.business_type}
                                  </div>
                                  <div>
                                    <strong>Contact:</strong>{" "}
                                    {searchResult.item.reported_person_contact}
                                  </div>
                                  <div>
                                    <strong>Reputation Status:</strong>{" "}
                                    {searchResult.item.reputation_status}
                                  </div>
                                  <div>
                                    <strong>Transaction Date:</strong>{" "}
                                    {new Date(
                                      searchResult.item.transaction_date
                                    ).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <strong>Amount:</strong>{" "}
                                    {searchResult.item.transaction_amount}
                                  </div>
                                  {searchResult.item.description && (
                                    <div className="col-span-2">
                                      <strong>Detailed Description:</strong>{" "}
                                      {searchResult.item.description}
                                    </div>
                                  )}
                                  {searchResult.item.evidence_urls && (
                                    <div className="col-span-2">
                                      <strong>Supporting Evidence:</strong>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {searchResult.item.evidence_urls.map(
                                          (url: string, index: number) => (
                                            <a
                                              key={index}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[#2158D9] hover:text-[#0B1220] underline text-sm"
                                            >
                                              Evidence {index + 1}
                                            </a>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}

                              <div>
                                <strong>Status:</strong>{" "}
                                {searchResult.item.status}
                              </div>
                              <div>
                                <strong>Report Date:</strong>{" "}
                                {new Date(
                                  searchResult.item.report_date
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {searchResult.item.image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={searchResult.item.image_url}
                              alt={`${searchResult.type} image`}
                              className="w-48 h-48 object-cover rounded-lg border-2 border-[#B3261E]/30 "
                              onError={(e) => {
                                console.error(
                                  "Failed to load image:",
                                  searchResult.item.image_url
                                );
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-[#1BA672]/10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-[#1BA672]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#0B1220] mb-2 font-sans">
                      No Reports Found
                    </h3>
                    <p className="text-[#0B1220]/60 mb-4 font-sans">
                      While no reports have been filed against this item/person
                      on our platform, we advise you to still exercise caution
                      and conduct your own due diligence.
                    </p>
                    <div className="bg-[#FFE7A8]/30 border border-[#B8860B]/30 p-3 rounded-lg text-sm text-[#0B1220]/80 font-sans">
                      <strong>Disclaimer:</strong> YaraCheck's database contains
                      only reports submitted to our platform. The absence of a
                      report does not guarantee safety. Always verify through
                      multiple sources and trust your instincts.
                    </div>
                  </div>
                )}

                {searchResult.found &&
                  !searchResult.hidden &&
                  searchResult.type &&
                  [
                    "person",
                    "device",
                    "vehicle",
                    "household",
                    "personal",
                    "reputation",
                  ].includes(searchResult.type) && (
                    <ContactActions
                      reportId={searchResult.item.id}
                      reportType={
                        searchResult.type as
                          | "person"
                          | "device"
                          | "vehicle"
                          | "household"
                          | "personal"
                          | "reputation"
                      }
                      reportData={searchResult.item}
                    />
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ItemVerification;
