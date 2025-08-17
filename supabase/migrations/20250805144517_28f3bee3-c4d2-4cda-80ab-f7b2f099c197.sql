-- Add permissions field to profiles if not exists (extend existing permissions)
UPDATE profiles SET permissions = jsonb_build_object(
  'can_respond_to_live_chat', CASE 
    WHEN role = 'super_admin' OR admin_role = 'super_admin' THEN true 
    ELSE false 
  END,
  'can_view_analytics', CASE 
    WHEN role = 'super_admin' OR admin_role = 'super_admin' THEN true 
    ELSE false 
  END,
  'can_manage_reports', CASE 
    WHEN role = 'super_admin' OR admin_role = 'super_admin' THEN true 
    ELSE false 
  END,
  'can_view_stolen_items', CASE 
    WHEN role = 'super_admin' OR admin_role = 'super_admin' THEN true 
    ELSE false 
  END
) WHERE permissions = '{}' OR permissions IS NULL;

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (
      role = 'super_admin' 
      OR admin_role = 'super_admin'
      OR (permissions ->> permission_name)::boolean = true
    )
  );
END;
$$;