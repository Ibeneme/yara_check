import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, AlertTriangle, CheckCircle, XCircle, User } from "lucide-react";
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
        .from('devices')
        .select('*')
        .eq('imei', searchQuery.trim());

      if (allDeviceError) throw allDeviceError;

      if (allDeviceResults && allDeviceResults.length > 0) {
        // Check if any visible reports exist
        const visibleReports = allDeviceResults.filter(device => device.visible !== false);
        
        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: 'device'
          });
        } else {
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allDeviceResults[0],
            type: 'device'
          });
        }
      } else {
        setSearchResult({
          found: false
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
        .from('vehicles')
        .select('*')
        .eq('chassis', searchQuery.trim());

      if (allVehicleError) throw allVehicleError;

      if (allVehicleResults && allVehicleResults.length > 0) {
        // Check if any visible reports exist
        const visibleReports = allVehicleResults.filter(vehicle => vehicle.visible !== false);
        
        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: 'vehicle'
          });
        } else {
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allVehicleResults[0],
            type: 'vehicle'
          });
        }
      } else {
        setSearchResult({
          found: false
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
        .from('persons')
        .select('*')
        .or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,physical_attributes.ilike.%${searchQuery.trim()}%`);

      if (allPersonError) throw allPersonError;

      if (allPersonResults && allPersonResults.length > 0) {
        // Check if any visible reports exist
        const visibleReports = allPersonResults.filter(person => person.visible !== false);
        
        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: 'person'
          });
        } else {
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allPersonResults[0],
            type: 'person'
          });
        }
      } else {
        setSearchResult({
          found: false
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
        .from('hacked_accounts')
        .select('*')
        .ilike('account_identifier', `%${searchQuery.trim()}%`);

      if (allAccountError) throw allAccountError;

      if (allAccountResults && allAccountResults.length > 0) {
        // Check if any visible reports exist
        const visibleReports = allAccountResults.filter(account => account.visible !== false);
        
        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: 'account'
          });
        } else {
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allAccountResults[0],
            type: 'account'
          });
        }
      } else {
        setSearchResult({
          found: false
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
      const { data: allReputationResults, error: allReputationError } = await supabase
        .from('business_reputation_reports')
        .select('*')
        .or(`reported_person_name.ilike.%${searchQuery.trim()}%,reported_person_contact.ilike.%${searchQuery.trim()}%,business_type.ilike.%${searchQuery.trim()}%`);

      if (allReputationError) throw allReputationError;

      if (allReputationResults && allReputationResults.length > 0) {
        // Check if any visible reports exist
        const visibleReports = allReputationResults.filter(report => report.visible !== false);
        
        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: 'reputation'
          });
        } else {
          // All reports are hidden
          setSearchResult({
            found: true,
            hidden: true,
            item: allReputationResults[0],
            type: 'reputation'
          });
        }
      } else {
        setSearchResult({
          found: false
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

      // Search by IMEI/serial first, then by type, brand, model, description if no exact match
      let allHouseholdResults = [];
      
      // Try exact IMEI/serial match first
      const { data: imeiResults, error: imeiError } = await supabase
        .from('household_items')
        .select('*')
        .eq('imei', searchQuery.trim());

      if (imeiError) throw imeiError;
      
      if (imeiResults && imeiResults.length > 0) {
        allHouseholdResults = imeiResults;
      } else {
        // Try keyword search if no IMEI match
        const { data: keywordResults, error: keywordError } = await supabase
          .from('household_items')
          .select('*')
          .or(`type.ilike.%${searchQuery.trim()}%,brand.ilike.%${searchQuery.trim()}%,model.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);

        if (keywordError) throw keywordError;
        allHouseholdResults = keywordResults || [];
      }

      if (allHouseholdResults && allHouseholdResults.length > 0) {
        const visibleReports = allHouseholdResults.filter(item => item.visible !== false);
        
        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: 'household'
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allHouseholdResults[0],
            type: 'household'
          });
        }
      } else {
        setSearchResult({
          found: false
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

      // Search by IMEI/serial first, then by type, brand, model, description if no exact match
      let allPersonalResults = [];
      
      // Try exact IMEI/serial match first
      const { data: imeiResults, error: imeiError } = await supabase
        .from('personal_belongings')
        .select('*')
        .eq('imei', searchQuery.trim());

      if (imeiError) throw imeiError;
      
      if (imeiResults && imeiResults.length > 0) {
        allPersonalResults = imeiResults;
      } else {
        // Try keyword search if no IMEI match
        const { data: keywordResults, error: keywordError } = await supabase
          .from('personal_belongings')
          .select('*')
          .or(`type.ilike.%${searchQuery.trim()}%,brand.ilike.%${searchQuery.trim()}%,model.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);

        if (keywordError) throw keywordError;
        allPersonalResults = keywordResults || [];
      }

      if (allPersonalResults && allPersonalResults.length > 0) {
        const visibleReports = allPersonalResults.filter(item => item.visible !== false);
        
        if (visibleReports.length > 0) {
          setSearchResult({
            found: true,
            item: visibleReports[0],
            type: 'personal'
          });
        } else {
          setSearchResult({
            found: true,
            hidden: true,
            item: allPersonalResults[0],
            type: 'personal'
          });
        }
      } else {
        setSearchResult({
          found: false
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yaracheck-darkBlue mb-4">
              Verify
            </h1>
            <p className="text-lg text-yaracheck-darkGray">
              {t('verification.subtitle')}
            </p>
          </div>

          <Card className="mb-8 border-yaracheck-lightBlue shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yaracheck-lightBlue to-blue-50">
              <CardTitle className="flex items-center gap-2 text-yaracheck-darkBlue">
                <div className="bg-yaracheck-blue p-2 rounded-full">
                  <Search className="h-5 w-5 text-white" />
                </div>
                {t('verification.searchTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="w-full bg-transparent p-0 mb-8">
                  {/* Desktop: Two rows layout with proper spacing */}
                  <div className="hidden lg:block w-full">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <TabsTrigger 
                        value="items" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Stolen Devices
                      </TabsTrigger>
                      <TabsTrigger 
                        value="household" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Household Items
                      </TabsTrigger>
                      <TabsTrigger 
                        value="personal" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Personal Items
                      </TabsTrigger>
                      <TabsTrigger 
                        value="vehicles" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        {t('verification.vehicles')}
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <TabsTrigger 
                        value="persons" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        {t('verification.missingPersons')}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="accounts" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Hacked Accounts
                      </TabsTrigger>
                      <TabsTrigger 
                        value="reputation" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Business Reputation
                      </TabsTrigger>
                      <TabsTrigger 
                        value="photo" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-14 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Photo Search
                      </TabsTrigger>
                    </div>
                  </div>
                  
                  {/* Tablet: Four rows of two columns each */}
                  <div className="hidden md:block lg:hidden w-full space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger 
                        value="items" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        Stolen Devices
                      </TabsTrigger>
                      <TabsTrigger 
                        value="household" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        Household Items
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger 
                        value="personal" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        Personal Items
                      </TabsTrigger>
                      <TabsTrigger 
                        value="vehicles" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        {t('verification.vehicles')}
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger 
                        value="persons" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        {t('verification.missingPersons')}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="accounts" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        Hacked Accounts
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TabsTrigger 
                        value="reputation" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        Business Reputation
                      </TabsTrigger>
                      <TabsTrigger 
                        value="photo" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-sm px-4 py-4 h-12 flex items-center justify-center text-center rounded-lg shadow-sm transition-all"
                      >
                        Photo Search
                      </TabsTrigger>
                    </div>
                  </div>
                  
                  {/* Mobile: Four rows of two columns each with better spacing */}
                  <div className="block md:hidden w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger 
                        value="items" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Stolen Devices
                      </TabsTrigger>
                      <TabsTrigger 
                        value="household" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Household Items
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger 
                        value="personal" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Personal Items
                      </TabsTrigger>
                      <TabsTrigger 
                        value="vehicles" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        {t('verification.vehicles')}
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger 
                        value="persons" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        {t('verification.missingPersons')}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="accounts" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Hacked Accounts
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <TabsTrigger 
                        value="reputation" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Business Reputation
                      </TabsTrigger>
                      <TabsTrigger 
                        value="photo" 
                        className="bg-white border border-yaracheck-lightBlue hover:bg-yaracheck-lightBlue data-[state=active]:bg-yaracheck-blue data-[state=active]:text-white data-[state=active]:border-yaracheck-blue text-xs px-3 py-3 h-11 flex items-center justify-center text-center leading-tight rounded-lg shadow-sm transition-all"
                      >
                        Photo Search
                      </TabsTrigger>
                    </div>
                  </div>
                </TabsList>
                
                <TabsContent value="items" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <div>
                    <label htmlFor="item-search" className="block text-sm font-medium mb-2 text-yaracheck-darkBlue">
                      Enter IMEI or Serial Number
                    </label>
                    <Input
                      id="item-search"
                      type="text"
                      placeholder="e.g., 123456789012345"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleItemSearch();
                        }
                      }}
                      className="border-yaracheck-lightBlue focus:border-yaracheck-blue"
                    />
                  </div>
                  
                  <Button
                    onClick={handleItemSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue transition-colors"
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

                <TabsContent value="household" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <div>
                    <label htmlFor="household-search" className="block text-sm font-medium mb-2 text-yaracheck-darkBlue">
                      Enter IMEI/Serial Number or Item Details
                    </label>
                    <Input
                      id="household-search"
                      type="text"
                      placeholder="e.g., 123456789012345 or TV, Samsung, refrigerator"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleHouseholdSearch();
                        }
                      }}
                      className="border-yaracheck-lightBlue focus:border-yaracheck-blue"
                    />
                  </div>
                  
                  <Button
                    onClick={handleHouseholdSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue transition-colors"
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

                <TabsContent value="personal" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <div>
                    <label htmlFor="personal-search" className="block text-sm font-medium mb-2 text-yaracheck-darkBlue">
                      Enter IMEI/Serial Number or Item Details
                    </label>
                    <Input
                      id="personal-search"
                      type="text"
                      placeholder="e.g., 123456789012345 or watch, jewelry, laptop"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handlePersonalSearch();
                        }
                      }}
                      className="border-yaracheck-lightBlue focus:border-yaracheck-blue"
                    />
                  </div>
                  
                  <Button
                    onClick={handlePersonalSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue transition-colors"
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

                <TabsContent value="vehicles" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <div>
                    <label htmlFor="vehicle-search" className="block text-sm font-medium mb-2 text-yaracheck-darkBlue">
                      Enter Chassis/VIN Number
                    </label>
                    <Input
                      id="vehicle-search"
                      type="text"
                      placeholder="e.g., WVWZZZ1JZYW123456"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleVehicleSearch();
                        }
                      }}
                      className="border-yaracheck-lightBlue focus:border-yaracheck-blue"
                    />
                  </div>
                  
                  <Button
                    onClick={handleVehicleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue transition-colors"
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
                
                <TabsContent value="persons" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <div>
                    <label htmlFor="person-search" className="block text-sm font-medium mb-2 text-yaracheck-darkBlue">
                      Enter Person's Name or Physical Description
                    </label>
                    <Input
                      id="person-search"
                      type="text"
                      placeholder="e.g., John Doe or tall, brown hair, blue eyes, scar on left hand"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handlePersonSearch();
                        }
                      }}
                      className="border-yaracheck-lightBlue focus:border-yaracheck-blue"
                    />
                  </div>
                  
                  <Button
                    onClick={handlePersonSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue transition-colors"
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

                <TabsContent value="accounts" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <div>
                    <label htmlFor="account-search" className="block text-sm font-medium mb-2 text-yaracheck-darkBlue">
                      Enter Account Identifier
                    </label>
                    <Input
                      id="account-search"
                      type="text"
                      placeholder="e.g., username, email, phone"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAccountSearch();
                        }
                      }}
                      className="border-yaracheck-lightBlue focus:border-yaracheck-blue"
                    />
                  </div>
                  
                  <Button
                    onClick={handleAccountSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue transition-colors"
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

                <TabsContent value="reputation" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <div>
                    <label htmlFor="reputation-search" className="block text-sm font-medium mb-2 text-yaracheck-darkBlue">
                      Enter Person's Name or Business Details
                    </label>
                    <Input
                      id="reputation-search"
                      type="text"
                      placeholder="e.g., John Doe, ABC Company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleReputationSearch();
                        }
                      }}
                      className="border-yaracheck-lightBlue focus:border-yaracheck-blue"
                    />
                  </div>
                  
                  <Button
                    onClick={handleReputationSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue transition-colors"
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

                <TabsContent value="photo" className="space-y-4 pt-12 md:pt-10 lg:pt-8">
                  <PhotoSearch />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResult && (
            <Card className={`shadow-lg ${searchResult.found && !searchResult.hidden ? 'border-red-500 border-2' : 'border-yaracheck-lightBlue'}`}>
              <CardHeader className={`${searchResult.found && !searchResult.hidden ? 'bg-gradient-to-r from-red-50 to-red-100' : 'bg-gradient-to-r from-yaracheck-lightBlue to-blue-50'}`}>
                <CardTitle className={`${searchResult.found && !searchResult.hidden ? 'text-red-700' : 'text-yaracheck-darkBlue'}`}>
                  {searchResult.found && !searchResult.hidden ? '🚨 ALERT - REPORT FOUND' : 'Search Results'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {searchResult.found ? (
                  searchResult.hidden ? (
                    <HiddenReportMessage searchTerm={searchQuery} />
                  ) : (
                     <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
                       <div className="flex items-start gap-6">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-4">
                             {searchResult.type === 'person' && (
                               <div className="bg-red-100 p-3 rounded-full border border-red-300">
                                 <User className="h-8 w-8 text-red-600" />
                               </div>
                             )}
                             {(searchResult.type === 'device' || searchResult.type === 'vehicle' || searchResult.type === 'account' || searchResult.type === 'household' || searchResult.type === 'personal') && (
                               <div className="bg-red-100 p-3 rounded-full border border-red-300">
                                 <AlertTriangle className="h-8 w-8 text-red-600" />
                               </div>
                             )}
                             {searchResult.type === 'reputation' && (
                               <div className="bg-orange-100 p-3 rounded-full border border-orange-300">
                                 <AlertTriangle className="h-8 w-8 text-orange-600" />
                               </div>
                             )}
                             <div>
                               <h3 className="text-xl font-semibold text-red-700">
                                 {searchResult.type === 'person' ? '⚠️ MISSING PERSON REPORTED' :
                                  searchResult.type === 'device' ? '⚠️ DEVICE REPORTED AS STOLEN' :
                                  searchResult.type === 'household' ? '⚠️ HOUSEHOLD ITEM REPORTED AS STOLEN' :
                                  searchResult.type === 'personal' ? '⚠️ PERSONAL ITEM REPORTED AS STOLEN' :
                                  searchResult.type === 'vehicle' ? '⚠️ VEHICLE REPORTED AS STOLEN' :
                                  searchResult.type === 'account' ? '⚠️ ACCOUNT REPORTED AS COMPROMISED' :
                                  searchResult.type === 'reputation' ? '⚠️ BUSINESS REPUTATION ALERT' : '⚠️ REPORT FOUND'}
                               </h3>
                               <p className="text-red-600 font-medium">
                                 🚨 This {searchResult.type} has been reported to our system. {searchResult.type === 'person' ? 'Please contact authorities immediately if you have information.' : 'Do not proceed with this transaction.'}
                               </p>
                             </div>
                           </div>
                           
                           <div className="bg-white border border-red-200 p-4 rounded-lg">
                             <h4 className="font-medium text-red-700 mb-2">Report Details:</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                               {searchResult.type === 'person' && (
                                 <>
                                   <div><strong>Name:</strong> {searchResult.item.name}</div>
                                   <div><strong>Age:</strong> {searchResult.item.age}</div>
                                   <div><strong>Gender:</strong> {searchResult.item.gender}</div>
                                   <div><strong>Location:</strong> {searchResult.item.location}</div>
                                   <div><strong>Date Missing:</strong> {new Date(searchResult.item.date_missing).toLocaleDateString()}</div>
                                 </>
                               )}
                               
                               {searchResult.type === 'device' && (
                                 <>
                                   <div><strong>Type:</strong> {searchResult.item.type}</div>
                                   <div><strong>Brand:</strong> {searchResult.item.brand}</div>
                                   <div><strong>Model:</strong> {searchResult.item.model}</div>
                                   <div><strong>IMEI:</strong> {searchResult.item.imei}</div>
                                   <div><strong>Color:</strong> {searchResult.item.color}</div>
                                   <div><strong>Location:</strong> {searchResult.item.location}</div>
                                 </>
                               )}

                               {searchResult.type === 'household' && (
                                 <>
                                   <div><strong>Type:</strong> {searchResult.item.type}</div>
                                   <div><strong>Brand:</strong> {searchResult.item.brand}</div>
                                   <div><strong>Model:</strong> {searchResult.item.model}</div>
                                   <div><strong>IMEI/Serial:</strong> {searchResult.item.imei}</div>
                                   <div><strong>Color:</strong> {searchResult.item.color}</div>
                                   <div><strong>Year:</strong> {searchResult.item.year}</div>
                                   <div><strong>Location:</strong> {searchResult.item.location}</div>
                                 </>
                               )}

                               {searchResult.type === 'personal' && (
                                 <>
                                   <div><strong>Type:</strong> {searchResult.item.type}</div>
                                   <div><strong>Brand:</strong> {searchResult.item.brand}</div>
                                   <div><strong>Model:</strong> {searchResult.item.model}</div>
                                   <div><strong>IMEI/Serial:</strong> {searchResult.item.imei}</div>
                                   <div><strong>Color:</strong> {searchResult.item.color}</div>
                                   <div><strong>Year:</strong> {searchResult.item.year}</div>
                                   <div><strong>Location:</strong> {searchResult.item.location}</div>
                                 </>
                               )}
                               
                               {searchResult.type === 'vehicle' && (
                                 <>
                                   <div><strong>Type:</strong> {searchResult.item.type}</div>
                                   <div><strong>Brand:</strong> {searchResult.item.brand}</div>
                                   <div><strong>Model:</strong> {searchResult.item.model}</div>
                                   <div><strong>Year:</strong> {searchResult.item.year}</div>
                                   <div><strong>Chassis:</strong> {searchResult.item.chassis}</div>
                                   <div><strong>Color:</strong> {searchResult.item.color}</div>
                                   <div><strong>Location:</strong> {searchResult.item.location}</div>
                                 </>
                               )}
                               
                               {searchResult.type === 'account' && (
                                 <>
                                   <div><strong>Account Type:</strong> {searchResult.item.account_type}</div>
                                   <div><strong>Account ID:</strong> {searchResult.item.account_identifier}</div>
                                   <div><strong>Date Compromised:</strong> {new Date(searchResult.item.date_compromised).toLocaleDateString()}</div>
                                   <div><strong>Description:</strong> {searchResult.item.description}</div>
                                 </>
                               )}

                               {searchResult.type === 'reputation' && (
                                 <>
                                   <div><strong>Person/Business:</strong> {searchResult.item.reported_person_name}</div>
                                   <div><strong>Business Type:</strong> {searchResult.item.business_type}</div>
                                   <div><strong>Contact:</strong> {searchResult.item.reported_person_contact}</div>
                                   <div><strong>Reputation Status:</strong> {searchResult.item.reputation_status}</div>
                                   <div><strong>Transaction Date:</strong> {new Date(searchResult.item.transaction_date).toLocaleDateString()}</div>
                                   <div><strong>Amount:</strong> {searchResult.item.transaction_amount}</div>
                                 </>
                               )}
                               
                               <div><strong>Status:</strong> {searchResult.item.status}</div>
                               <div><strong>Report Date:</strong> {new Date(searchResult.item.report_date).toLocaleDateString()}</div>
                             </div>
                           </div>
                         </div>
                         
                         {searchResult.item.image_url && (
                           <div className="flex-shrink-0">
                             <img 
                               src={searchResult.item.image_url} 
                               alt={`${searchResult.type} image`}
                               className="w-48 h-48 object-cover rounded-lg border-2 border-red-300 shadow-sm"
                               onError={(e) => {
                                 console.error("Failed to load image:", searchResult.item.image_url);
                                 e.currentTarget.style.display = 'none';
                               }}
                             />
                           </div>
                         )}
                       </div>
                     </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-yaracheck-darkBlue mb-2">No Reports Found</h3>
                    <p className="text-yaracheck-darkGray mb-4">
                      While no reports have been filed against this item/person on our platform, we advise you to still exercise caution and conduct your own due diligence.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                      <strong>Disclaimer:</strong> YaraCheck's database contains only reports submitted to our platform. The absence of a report does not guarantee safety. Always verify through multiple sources and trust your instincts.
                    </div>
                  </div>
                )}
                
                {searchResult.found && !searchResult.hidden && searchResult.type && ['person', 'device', 'vehicle', 'household', 'personal'].includes(searchResult.type) && (
                  <ContactActions 
                    reportId={searchResult.item.id}
                    reportType={searchResult.type as 'person' | 'device' | 'vehicle' | 'household' | 'personal'}
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