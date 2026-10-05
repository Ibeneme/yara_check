import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2 } from "lucide-react";

type Country = {
  id: string;
  name: string;
  code?: string | null;
};

type Province = {
  id: string;
  name: string;
  country_id: string | null;
};

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

  // ── Fetch countries ──────────────────────────────────────────────
  const {
    data: countries = [],
    isLoading: loadingCountries,
    error: countriesError,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("id, name, code")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Country[];
    },
  });

  // ── Fetch provinces ──────────────────────────────────────────────
  const {
    data: provinces = [],
    isLoading: loadingProvinces,
    error: provincesError,
  } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provinces")
        .select("id, name, country_id")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Province[];
    },
  });

  // Provinces filtered by selected country
  const filteredProvinces = useMemo(() => {
    if (!formData.countryId) return [];
    return provinces.filter((p) => p.country_id === formData.countryId);
  }, [provinces, formData.countryId]);

  // ── Create admin mutation ────────────────────────────────────────
  const createAdminMutation = useMutation({
    mutationFn: async (
      adminData: typeof formData & { geographicAccess: typeof geographicAccess }
    ) => {
      console.log("Starting admin creation process...", adminData);

      const { data: result, error } = await supabase.functions.invoke(
        "create-admin-user",
        {
          body: {
            email: adminData.email,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            phone: adminData.phone || null,
            adminRole: adminData.adminRole,
            countryId: adminData.countryId || null,
            provinceId: adminData.provinceId || null,
            geographicAccess: adminData.geographicAccess,
          },
        }
      );

      // Debug: see exactly what came back
      console.log("Edge function result:", result);
      console.log("Edge function error:", error);

      // Prefer the error message returned by the function body
      if (result && result.success === false && result.error) {
        throw new Error(result.error);
      }

      if (error) {
        const msg = error.message || "";

        // Try to pull server message from FunctionsHttpError context
        let serverMsg = "";
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            serverMsg = body?.error || body?.message || "";
          } else if (ctx && typeof ctx === "object") {
            serverMsg = ctx?.error || ctx?.message || "";
          }
        } catch {
          // ignore parse errors
        }

        if (serverMsg) {
          throw new Error(serverMsg);
        }

        if (
          msg.includes("Failed to send") ||
          msg.includes("not found") ||
          msg.includes("CORS")
        ) {
          throw new Error(
            "Edge Function 'create-admin-user' is not deployed. Deploy it or create the admin via SQL."
          );
        }

        throw new Error(msg || "Edge Function returned a non-2xx status code");
      }

      if (!result?.success) {
        throw new Error(result?.error || "Failed to create admin user");
      }

      return { tempPassword: result.tempPassword, email: result.email };
    },
    onSuccess: (data) => {
      toast({
        title: "Admin created successfully",
        description: (
          <div className="space-y-2">
            <p>Admin account created successfully!</p>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p>
                <strong className="text-slate-700">Email:</strong>{" "}
                <span className="text-slate-900">{data.email}</span>
              </p>
              <p className="mt-1">
                <strong className="text-slate-700">Temporary Password:</strong>
                <span className="ml-2 font-mono bg-white px-2 py-0.5 rounded text-sm border border-slate-200 text-slate-900">
                  {data.tempPassword}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(data.tempPassword)
                  }
                  className="ml-2 text-xs text-yaracheck-blue hover:underline font-medium"
                  title="Copy password"
                >
                  Copy
                </button>
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                Please save these credentials securely. The admin must change
                the password on first login.
              </p>
            </div>
          </div>
        ),
        duration: 12000,
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
        description:
          error.message ||
          "An unexpected error occurred while creating the admin account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.adminRole
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (
      (formData.adminRole === "country_rep" ||
        formData.adminRole === "province_manager") &&
      !formData.countryId
    ) {
      toast({
        title: "Country Required",
        description: "Please select a country",
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

    createAdminMutation.mutate({ ...formData, geographicAccess });
  };

  const toggleCountryAccess = (countryId: string) => {
    setGeographicAccess((prev) => ({
      ...prev,
      allowedCountries: prev.allowedCountries.includes(countryId)
        ? prev.allowedCountries.filter((id) => id !== countryId)
        : [...prev.allowedCountries, countryId],
    }));
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <UserPlus className="h-5 w-5 text-yaracheck-blue" />
          <span>Create New Admin</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(countriesError || provincesError) && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Could not load countries/provinces. Check RLS policies or run the
            seed SQL.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-slate-700"
              >
                First Name *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                required
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-slate-700"
              >
                Last Name *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
                className="bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value.toLowerCase().trim(),
                }))
              }
              required
              className="bg-white border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-slate-700"
            >
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="bg-white border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="adminRole"
              className="text-sm font-medium text-slate-700"
            >
              Admin Role *
            </Label>
            <Select
              value={formData.adminRole}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  adminRole: value,
                  countryId: "",
                  provinceId: "",
                }))
              }
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Select admin role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="country_rep">
                  Country Representative
                </SelectItem>
                <SelectItem value="province_manager">
                  Province Manager
                </SelectItem>
                <SelectItem value="shareholder">Shareholder</SelectItem>
                <SelectItem value="customer_support_executive">
                  Customer Support Executive
                </SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          {(formData.adminRole === "country_rep" ||
            formData.adminRole === "province_manager") && (
            <div className="space-y-1.5">
              <Label
                htmlFor="country"
                className="text-sm font-medium text-slate-700"
              >
                Country *
              </Label>
              <Select
                value={formData.countryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    countryId: value,
                    provinceId: "",
                  }))
                }
                disabled={loadingCountries}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue
                    placeholder={
                      loadingCountries
                        ? "Loading countries..."
                        : countries.length === 0
                          ? "No countries found – run seed SQL"
                          : "Select country"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                      {country.code ? ` (${country.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!loadingCountries && countries.length === 0 && (
                <p className="text-xs text-amber-600">
                  No countries in the database. Run the countries seed SQL in
                  Supabase.
                </p>
              )}
            </div>
          )}

          {/* Province */}
          {formData.adminRole === "province_manager" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="province"
                className="text-sm font-medium text-slate-700"
              >
                Province *
              </Label>
              <Select
                value={formData.provinceId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, provinceId: value }))
                }
                disabled={!formData.countryId || loadingProvinces}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue
                    placeholder={
                      !formData.countryId
                        ? "Select a country first"
                        : loadingProvinces
                          ? "Loading provinces..."
                          : filteredProvinces.length === 0
                            ? "No provinces for this country"
                            : "Select province"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredProvinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Geographic access */}
          {formData.adminRole !== "" &&
            formData.adminRole !== "shareholder" &&
            formData.adminRole !== "investor" && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <Label className="text-sm font-medium text-slate-700">
                  Geographic Access Permissions
                </Label>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="viewAllCountries"
                    checked={geographicAccess.viewAllCountries}
                    onCheckedChange={(checked) =>
                      setGeographicAccess((prev) => ({
                        ...prev,
                        viewAllCountries: !!checked,
                      }))
                    }
                  />
                  <Label
                    htmlFor="viewAllCountries"
                    className="text-sm text-slate-600 font-normal cursor-pointer"
                  >
                    Allow access to all countries
                  </Label>
                </div>

                {!geographicAccess.viewAllCountries && (
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Select Countries to Grant Access To:
                    </Label>
                    {loadingCountries ? (
                      <p className="text-sm text-slate-500">Loading...</p>
                    ) : countries.length === 0 ? (
                      <p className="text-sm text-amber-600">
                        No countries available
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        {countries.map((country) => (
                          <div
                            key={country.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`country-${country.id}`}
                              checked={geographicAccess.allowedCountries.includes(
                                country.id
                              )}
                              onCheckedChange={() =>
                                toggleCountryAccess(country.id)
                              }
                            />
                            <Label
                              htmlFor={`country-${country.id}`}
                              className="text-sm text-slate-700 font-normal cursor-pointer truncate"
                            >
                              {country.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          <Button
            type="submit"
            disabled={createAdminMutation.isPending}
            className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue text-white"
          >
            {createAdminMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating Admin...</span>
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