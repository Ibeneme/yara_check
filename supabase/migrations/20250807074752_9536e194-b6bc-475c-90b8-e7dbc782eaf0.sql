-- Fix company_assets RLS policies to only allow authorized users
-- Remove the overly permissive policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Shareholders and admins can view company assets" ON public.company_assets;

-- Create proper RLS policy that respects permissions
CREATE POLICY "Only admins with asset permission can view assets" 
ON public.company_assets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (
      profiles.role = 'super_admin'::user_role 
      OR (
        profiles.role = 'admin'::user_role 
        AND (
          (profiles.permissions->>'can_view_assets')::boolean = true
          OR profiles.admin_role = 'shareholder'::admin_role
        )
      )
    )
  )
);

-- Add business reputation reports to verification search
-- This will help with issue (4) about missing business reputation in verification

-- Also fix anonymous messages visibility - add function to handle anonymous message creation/retrieval properly
-- Create function to update report status (for issue 3)
CREATE OR REPLACE FUNCTION update_report_status(
  report_id_param UUID,
  report_type_param TEXT,
  new_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update status based on report type
  IF report_type_param = 'person' THEN
    UPDATE persons SET status = new_status WHERE id = report_id_param;
    RETURN FOUND;
  ELSIF report_type_param = 'device' THEN  
    UPDATE devices SET status = new_status WHERE id = report_id_param;
    RETURN FOUND;
  ELSIF report_type_param = 'vehicle' THEN
    UPDATE vehicles SET status = new_status WHERE id = report_id_param;
    RETURN FOUND;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;