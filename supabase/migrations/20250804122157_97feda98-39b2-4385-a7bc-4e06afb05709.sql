-- Fix infinite recursion in profiles table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view other admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;

-- Create proper RLS policies without recursion
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow super admins to view all profiles (using security definer function to avoid recursion)
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_super_admin());

-- Allow super admins to delete other profiles (but not their own)
CREATE POLICY "Super admins can delete other profiles" 
ON public.profiles 
FOR DELETE 
USING (is_super_admin() AND id != auth.uid());

-- Allow super admins to update profiles
CREATE POLICY "Super admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Allow super admins to insert new profiles (for creating admin accounts)
CREATE POLICY "Super admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_super_admin());