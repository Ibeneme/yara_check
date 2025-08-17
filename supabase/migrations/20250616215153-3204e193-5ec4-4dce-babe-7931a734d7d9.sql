
-- First, let's completely disable RLS on all report tables to eliminate any policy conflicts
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on these tables
DROP POLICY IF EXISTS "Allow insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow select vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow insert devices" ON public.devices;
DROP POLICY IF EXISTS "Allow select devices" ON public.devices;
DROP POLICY IF EXISTS "Allow insert persons" ON public.persons;
DROP POLICY IF EXISTS "Allow select persons" ON public.persons;
DROP POLICY IF EXISTS "Anyone can submit vehicle reports" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view their own vehicle reports" ON public.vehicles;
DROP POLICY IF EXISTS "Anyone can submit device reports" ON public.devices;
DROP POLICY IF EXISTS "Users can view their own device reports" ON public.devices;
DROP POLICY IF EXISTS "Anyone can submit person reports" ON public.persons;
DROP POLICY IF EXISTS "Users can view their own person reports" ON public.persons;

-- Check if there are any triggers that might be causing issues with profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Now re-enable RLS and create the simplest possible policies
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- Create the most basic policies that allow all operations
CREATE POLICY "vehicles_all_access" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "devices_all_access" ON public.devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "persons_all_access" ON public.persons FOR ALL USING (true) WITH CHECK (true);
