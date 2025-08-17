-- Fix RLS policies to allow sub-admins to view assets properly
DROP POLICY IF EXISTS "Admins with asset permission can view assets" ON company_assets;

-- Create a more permissive policy for viewing assets
CREATE POLICY "Admins with asset permission can view assets" 
ON company_assets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (
      role = 'super_admin'::user_role 
      OR (permissions ->> 'can_view_assets')::boolean = true
    )
  )
);