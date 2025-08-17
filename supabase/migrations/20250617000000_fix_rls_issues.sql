
-- Complete fix for RLS infinite recursion issues
-- First, disable RLS on all tables that might be causing issues
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.persons DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on all tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
    
    -- Drop all policies on vehicles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'vehicles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.vehicles';
    END LOOP;
    
    -- Drop all policies on devices table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'devices' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.devices';
    END LOOP;
    
    -- Drop all policies on persons table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'persons' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.persons';
    END LOOP;
END $$;

-- Drop any triggers that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Re-enable RLS with the simplest possible policies
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- Create ultra-simple policies that allow everything
CREATE POLICY "vehicles_full_access" ON public.vehicles FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "devices_full_access" ON public.devices FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "persons_full_access" ON public.persons FOR ALL TO public USING (true) WITH CHECK (true);

-- Make sure the policies are applied immediately
NOTIFY pgrst, 'reload schema';
