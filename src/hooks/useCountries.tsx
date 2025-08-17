
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useProvinces = (countryId?: string) => {
  return useQuery({
    queryKey: ["provinces", countryId],
    queryFn: async () => {
      if (!countryId) return [];
      
      const { data, error } = await supabase
        .from("provinces")
        .select("*")
        .eq("country_id", countryId)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!countryId,
  });
};
