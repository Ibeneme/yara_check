
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2 } from "lucide-react";

const CreateAdminForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    adminRole: "",
    countryId: "",
    provinceId: "",
  });
  const [geographicAccess, setGeographicAccess] = useState({
    viewAllCountries: false,
    allowedCountries: [] as string[],
    allowedProvinces: [] as string[],
  });
  const queryClient = useQueryClient();

  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("countries").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: provinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const { data, error } = await supabase.from("provinces").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (adminData: typeof formData & { geographicAccess: typeof geographicAccess }) => {
      console.log("Starting admin creation process...");
      
      try {
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("You must be logged in to create admin users");
        }

        // Call edge function to create admin user
        const response = await fetch(`https://iuaysbxfqcuyzbtwttvu.supabase.co/functions/v1/create-admin-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: adminData.email,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            phone: adminData.phone,
            adminRole: adminData.adminRole,
            countryId: adminData.countryId,
            provinceId: adminData.provinceId,
            geographicAccess: adminData.geographicAccess,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to create admin user');
        }

        return { tempPassword: result.tempPassword, email: result.email };
      } catch (error: any) {
        console.error("Admin creation failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Admin created successfully",
        description: (
          <div className="space-y-2">
            <p>Admin account created successfully!</p>
            <div className="bg-muted p-2 rounded">
              <p><strong>Email:</strong> {data.email}</p>
              <p><strong>Temporary Password:</strong> 
                <span className="ml-2 font-mono bg-background px-2 py-1 rounded text-sm">
                  {data.tempPassword}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(data.tempPassword)}
                  className="ml-2 text-xs text-primary hover:underline"
                  title="Copy password"
                >
                  Copy
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please save these credentials securely. The admin must change the password on first login.
              </p>
            </div>
          </div>
        ),
        duration: 10000, // Show for 10 seconds
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        adminRole: "",
        countryId: "",
        provinceId: "",
      });
      setGeographicAccess({
        viewAllCountries: false,
        allowedCountries: [],
        allowedProvinces: [],
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (error: any) => {
      console.error("Create admin mutation error:", error);
      toast({
        title: "Failed to create admin",
        description: error.message || "An unexpected error occurred while creating the admin account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.adminRole) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Role-specific validation
    if (formData.adminRole === "country_rep" && !formData.countryId) {
      toast({
        title: "Country Required",
        description: "Please select a country for the Country Representative",
        variant: "destructive",
      });
      return;
    }

    if (formData.adminRole === "province_manager" && !formData.provinceId) {
      toast({
        title: "Province Required",
        description: "Please select a province for the Province Manager",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting admin creation form:", formData);
    createAdminMutation.mutate({ ...formData, geographicAccess });
  };

  const toggleCountryAccess = (countryId: string) => {
    setGeographicAccess(prev => ({
      ...prev,
      allowedCountries: prev.allowedCountries.includes(countryId)
        ? prev.allowedCountries.filter(id => id !== countryId)
        : [...prev.allowedCountries, countryId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value.toLowerCase().trim() }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="adminRole">Admin Role *</Label>
            <Select value={formData.adminRole} onValueChange={(value) => setFormData(prev => ({ ...prev, adminRole: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select admin role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="country_rep">Country Representative</SelectItem>
                <SelectItem value="province_manager">Province Manager</SelectItem>
                <SelectItem value="shareholder">Shareholder</SelectItem>
                <SelectItem value="customer_support_executive">Customer Support Executive</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.adminRole === "country_rep" && (
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.countryId} onValueChange={(value) => setFormData(prev => ({ ...prev, countryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.adminRole === "province_manager" && (
            <div>
              <Label htmlFor="province">Province *</Label>
              <Select value={formData.provinceId} onValueChange={(value) => setFormData(prev => ({ ...prev, provinceId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces?.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Geographic Access Section - Hide for shareholders and investors */}
          {formData.adminRole !== "shareholder" && formData.adminRole !== "investor" && (
            <div className="space-y-4">
              <Label>Geographic Access Permissions</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="viewAllCountries"
                  checked={geographicAccess.viewAllCountries}
                  onCheckedChange={(checked) => 
                    setGeographicAccess(prev => ({ ...prev, viewAllCountries: !!checked }))
                  }
                />
                <Label htmlFor="viewAllCountries">Allow access to all countries</Label>
              </div>

              {!geographicAccess.viewAllCountries && (
                <div>
                  <Label>Select Countries to Grant Access To:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {countries?.map((country) => (
                      <div key={country.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`country-${country.id}`}
                          checked={geographicAccess.allowedCountries.includes(country.id)}
                          onCheckedChange={() => toggleCountryAccess(country.id)}
                        />
                        <Label htmlFor={`country-${country.id}`} className="text-sm">
                          {country.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={createAdminMutation.isPending}
            className="w-full"
          >
            {createAdminMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin...
              </>
            ) : (
              "Create Admin"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAdminForm;
