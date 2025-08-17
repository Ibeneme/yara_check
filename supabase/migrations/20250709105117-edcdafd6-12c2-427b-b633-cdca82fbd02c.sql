
-- Add geographic access permissions to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS geographic_access jsonb DEFAULT '{"view_all_countries": false, "allowed_countries": [], "allowed_provinces": []}'::jsonb;

-- Update the admin reports RLS policies to use the new geographic access permissions
DROP POLICY IF EXISTS "Admins can view device reports from their countries" ON public.devices;
DROP POLICY IF EXISTS "Admins can view vehicle reports from their countries" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can view reports from their countries" ON public.persons;

-- Create new comprehensive RLS policies for devices
CREATE POLICY "Admins can view device reports based on geographic access" 
ON public.devices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
    AND (
      profiles.role = 'super_admin' 
      OR profiles.admin_role = 'director'
      OR (profiles.geographic_access->>'view_all_countries')::boolean = true
      OR devices.country_id = ANY(
        SELECT jsonb_array_elements_text(profiles.geographic_access->'allowed_countries')::uuid
      )
      OR (
        profiles.admin_role = 'country_rep' 
        AND profiles.country_id = devices.country_id
      )
      OR (
        profiles.admin_role = 'province_manager' 
        AND profiles.province_id IN (
          SELECT provinces.id FROM provinces 
          WHERE provinces.country_id = devices.country_id
        )
      )
    )
  )
);

-- Create new comprehensive RLS policies for vehicles
CREATE POLICY "Admins can view vehicle reports based on geographic access" 
ON public.vehicles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
    AND (
      profiles.role = 'super_admin' 
      OR profiles.admin_role = 'director'
      OR (profiles.geographic_access->>'view_all_countries')::boolean = true
      OR vehicles.country_id = ANY(
        SELECT jsonb_array_elements_text(profiles.geographic_access->'allowed_countries')::uuid
      )
      OR (
        profiles.admin_role = 'country_rep' 
        AND profiles.country_id = vehicles.country_id
      )
      OR (
        profiles.admin_role = 'province_manager' 
        AND profiles.province_id IN (
          SELECT provinces.id FROM provinces 
          WHERE provinces.country_id = vehicles.country_id
        )
      )
    )
  )
);

-- Create new comprehensive RLS policies for persons
CREATE POLICY "Admins can view person reports based on geographic access" 
ON public.persons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
    AND (
      profiles.role = 'super_admin' 
      OR profiles.admin_role = 'director'
      OR (profiles.geographic_access->>'view_all_countries')::boolean = true
      OR persons.country_id = ANY(
        SELECT jsonb_array_elements_text(profiles.geographic_access->'allowed_countries')::uuid
      )
      OR (
        profiles.admin_role = 'country_rep' 
        AND profiles.country_id = persons.country_id
      )
      OR (
        profiles.admin_role = 'province_manager' 
        AND profiles.province_id IN (
          SELECT provinces.id FROM provinces 
          WHERE provinces.country_id = persons.country_id
        )
      )
    )
  )
);

-- Create function to search reports by tracking code
CREATE OR REPLACE FUNCTION public.search_by_tracking_code(tracking_code text)
RETURNS TABLE(
  report_id uuid,
  report_type text,
  report_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Search in persons table
  RETURN QUERY
  SELECT 
    p.id,
    'person'::text,
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'age', p.age,
      'gender', p.gender,
      'location', p.location,
      'date_missing', p.date_missing,
      'status', p.status,
      'report_date', p.report_date,
      'image_url', p.image_url
    )
  FROM public.persons p
  WHERE p.id::text = tracking_code;

  -- Search in devices table
  RETURN QUERY
  SELECT 
    d.id,
    'device'::text,
    jsonb_build_object(
      'id', d.id,
      'type', d.type,
      'brand', d.brand,
      'model', d.model,
      'imei', d.imei,
      'location', d.location,
      'status', d.status,
      'report_date', d.report_date,
      'image_url', d.image_url
    )
  FROM public.devices d
  WHERE d.id::text = tracking_code;

  -- Search in vehicles table
  RETURN QUERY
  SELECT 
    v.id,
    'vehicle'::text,
    jsonb_build_object(
      'id', v.id,
      'type', v.type,
      'brand', v.brand,
      'model', v.model,
      'chassis', v.chassis,
      'location', v.location,
      'status', v.status,
      'report_date', v.report_date,
      'image_url', v.image_url
    )
  FROM public.vehicles v
  WHERE v.id::text = tracking_code;
END;
$$;

-- Remove dummy financial records
DELETE FROM public.financial_records WHERE revenue = 0 OR record_date < CURRENT_DATE - INTERVAL '1 year';
