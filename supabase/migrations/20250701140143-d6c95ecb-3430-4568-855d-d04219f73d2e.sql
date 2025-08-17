
-- Fix the user_accounts RLS policy to allow users to insert their own accounts
-- The current policy might be too restrictive

-- First, let's check if we need to modify the user_accounts table structure
-- and ensure the RLS policies allow proper user signup

-- Drop and recreate the insert policy for user_accounts
DROP POLICY IF EXISTS "Users can insert their own account" ON public.user_accounts;

CREATE POLICY "Users can insert their own account" ON public.user_accounts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Also ensure users can update their own accounts after creation
DROP POLICY IF EXISTS "Users can update their own account" ON public.user_accounts;

CREATE POLICY "Users can update their own account" ON public.user_accounts
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Make sure the user_id column is properly set as NOT NULL since it's required for RLS
ALTER TABLE public.user_accounts 
ALTER COLUMN user_id SET NOT NULL;

-- Add a trigger to automatically set user_id when inserting into user_accounts
CREATE OR REPLACE FUNCTION public.set_user_id_on_user_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Set user_id to the current authenticated user if not already set
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_user_id_trigger ON public.user_accounts;
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON public.user_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_user_accounts();
