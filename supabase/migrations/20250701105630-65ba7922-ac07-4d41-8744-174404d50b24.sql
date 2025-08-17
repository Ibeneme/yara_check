
-- Add country selection to all report types and ensure proper indexes
ALTER TABLE public.persons 
ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id);

ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id);

ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_country_id ON public.persons(country_id);
CREATE INDEX IF NOT EXISTS idx_devices_country_id ON public.devices(country_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_country_id ON public.vehicles(country_id);

-- Update RLS policies for better admin access control
-- Drop existing admin policies and recreate them with proper geographic restrictions

-- Persons table policies
DROP POLICY IF EXISTS "Admins can view reports from their countries" ON public.persons;
CREATE POLICY "Admins can view reports from their countries" ON public.persons
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND (
      role = 'super_admin' OR 
      admin_role = 'director' OR
      (admin_role = 'country_rep' AND country_id = persons.country_id) OR
      (admin_role = 'province_manager' AND province_id IN (
        SELECT id FROM public.provinces WHERE country_id = persons.country_id
      ))
    )
  )
);

-- Devices table policies  
DROP POLICY IF EXISTS "Admins can view device reports from their countries" ON public.devices;
CREATE POLICY "Admins can view device reports from their countries" ON public.devices
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND (
      role = 'super_admin' OR 
      admin_role = 'director' OR
      (admin_role = 'country_rep' AND country_id = devices.country_id) OR
      (admin_role = 'province_manager' AND province_id IN (
        SELECT id FROM public.provinces WHERE country_id = devices.country_id
      ))
    )
  )
);

-- Vehicles table policies
DROP POLICY IF EXISTS "Admins can view vehicle reports from their countries" ON public.vehicles;
CREATE POLICY "Admins can view vehicle reports from their countries" ON public.vehicles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND (
      role = 'super_admin' OR 
      admin_role = 'director' OR
      (admin_role = 'country_rep' AND country_id = vehicles.country_id) OR
      (admin_role = 'province_manager' AND province_id IN (
        SELECT id FROM public.provinces WHERE country_id = vehicles.country_id
      ))
    )
  )
);
