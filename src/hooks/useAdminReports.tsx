
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminReports = (adminId?: string, adminProfile?: any) => {
  return useQuery({
    queryKey: ["admin-reports", adminId, adminProfile?.admin_role, adminProfile?.country_id, adminProfile?.province_id],
    queryFn: async () => {
      if (!adminId || !adminProfile) return { persons: [], devices: [], vehicles: [] };

      // Build base queries
      let personsQuery = supabase.from("persons").select(`
        *,
        country:countries(name),
        province:provinces(name)
      `);

      let devicesQuery = supabase.from("devices").select(`
        *,
        country:countries(name),
        province:provinces(name)
      `);

      let vehiclesQuery = supabase.from("vehicles").select(`
        *,
        country:countries(name),
        province:provinces(name)
      `);

      // Apply geographic restrictions based on admin role
      if (adminProfile.role !== 'super_admin') {
        if (adminProfile.admin_role === 'country_rep' && adminProfile.country_id) {
          // Country representatives see only their country's reports
          personsQuery = personsQuery.eq('country_id', adminProfile.country_id);
          devicesQuery = devicesQuery.eq('country_id', adminProfile.country_id);
          vehiclesQuery = vehiclesQuery.eq('country_id', adminProfile.country_id);
        } else if (adminProfile.admin_role === 'province_manager' && adminProfile.province_id) {
          // Province managers see reports from their province's country
          const { data: provinceData } = await supabase
            .from('provinces')
            .select('country_id')
            .eq('id', adminProfile.province_id)
            .maybeSingle();
          
          if (provinceData?.country_id) {
            personsQuery = personsQuery.eq('country_id', provinceData.country_id);
            devicesQuery = devicesQuery.eq('country_id', provinceData.country_id);
            vehiclesQuery = vehiclesQuery.eq('country_id', provinceData.country_id);
          }
        }
        // Directors and super_admins see all reports (no additional filtering)
      }

      const [personsResult, devicesResult, vehiclesResult] = await Promise.all([
        personsQuery,
        devicesQuery,
        vehiclesQuery,
      ]);

      return {
        persons: personsResult.data || [],
        devices: devicesResult.data || [],
        vehicles: vehiclesResult.data || [],
      };
    },
    enabled: !!adminId && !!adminProfile,
  });
};

export const useAdminProfile = (adminId?: string) => {
  return useQuery({
    queryKey: ["admin-profile", adminId],
    queryFn: async () => {
      if (!adminId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          country:countries(name),
          province:provinces(name)
        `)
        .eq("id", adminId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!adminId,
  });
};

export const useCountryStats = (adminProfile?: any) => {
  return useQuery({
    queryKey: ["country-stats", adminProfile?.admin_role, adminProfile?.country_id, adminProfile?.province_id],
    queryFn: async () => {
      // Build base queries with geographic restrictions
      let personsQuery = supabase
        .from("persons")
        .select("country_id, countries(name)")
        .not("country_id", "is", null);

      let devicesQuery = supabase
        .from("devices")
        .select("country_id, countries(name)")
        .not("country_id", "is", null);

      let vehiclesQuery = supabase
        .from("vehicles")
        .select("country_id, countries(name)")
        .not("country_id", "is", null);

      // Apply geographic restrictions for non-super admins
      if (adminProfile && adminProfile.role !== 'super_admin') {
        if (adminProfile.admin_role === 'country_rep' && adminProfile.country_id) {
          personsQuery = personsQuery.eq('country_id', adminProfile.country_id);
          devicesQuery = devicesQuery.eq('country_id', adminProfile.country_id);
          vehiclesQuery = vehiclesQuery.eq('country_id', adminProfile.country_id);
        } else if (adminProfile.admin_role === 'province_manager' && adminProfile.province_id) {
          const { data: provinceData } = await supabase
            .from('provinces')
            .select('country_id')
            .eq('id', adminProfile.province_id)
            .maybeSingle();
          
          if (provinceData?.country_id) {
            personsQuery = personsQuery.eq('country_id', provinceData.country_id);
            devicesQuery = devicesQuery.eq('country_id', provinceData.country_id);
            vehiclesQuery = vehiclesQuery.eq('country_id', provinceData.country_id);
          }
        }
      }

      const [personsStats, devicesStats, vehiclesStats] = await Promise.all([
        personsQuery,
        devicesQuery,
        vehiclesQuery,
      ]);

      // Aggregate stats by country
      const countryStats = new Map();

      [personsStats.data, devicesStats.data, vehiclesStats.data].forEach((data, typeIndex) => {
        const type = ['persons', 'devices', 'vehicles'][typeIndex];
        data?.forEach((item: any) => {
          const countryId = item.country_id;
          const countryName = item.countries?.name || 'Unknown';
          
          if (!countryStats.has(countryId)) {
            countryStats.set(countryId, {
              id: countryId,
              name: countryName,
              persons: 0,
              devices: 0,
              vehicles: 0,
              total: 0,
            });
          }
          
          const stats = countryStats.get(countryId);
          stats[type]++;
          stats.total++;
        });
      });

      return Array.from(countryStats.values());
    },
  });
};
