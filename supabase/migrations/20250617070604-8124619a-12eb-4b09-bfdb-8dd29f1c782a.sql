
-- Final fix for infinite recursion - disable RLS on profiles table completely
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table to ensure clean slate
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Ensure vehicles, devices, and persons tables have the simplest policies
DROP POLICY IF EXISTS "vehicles_full_access" ON public.vehicles;
DROP POLICY IF EXISTS "devices_full_access" ON public.devices;
DROP POLICY IF EXISTS "persons_full_access" ON public.persons;

-- Re-create ultra-simple policies
CREATE POLICY "vehicles_allow_all" ON public.vehicles FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "devices_allow_all" ON public.devices FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "persons_allow_all" ON public.persons FOR ALL TO public USING (true) WITH CHECK (true);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
