-- Update company_assets RLS policy to match ROI logic for shareholders
DROP POLICY IF EXISTS "Admins with asset permission can view assets" ON public.company_assets;

-- Create new policy that allows shareholders to view assets (same logic as ROI)
CREATE POLICY "Shareholders and admins can view company assets" 
ON public.company_assets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (
      profiles.role = 'super_admin'::user_role 
      OR profiles.admin_role = 'shareholder'::admin_role
      OR ((profiles.permissions ->> 'can_view_assets')::boolean = true)
    )
  )
);