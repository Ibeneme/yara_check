-- Add visibility field to all report tables
ALTER TABLE persons ADD COLUMN visible BOOLEAN DEFAULT true;
ALTER TABLE devices ADD COLUMN visible BOOLEAN DEFAULT true;
ALTER TABLE vehicles ADD COLUMN visible BOOLEAN DEFAULT true;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to check visibility for public access
-- Persons visibility policy
CREATE POLICY "Hide invisible person reports from public" ON persons
FOR SELECT
USING (visible = true OR auth.uid() = user_id OR is_super_admin());

-- Devices visibility policy  
CREATE POLICY "Hide invisible device reports from public" ON devices
FOR SELECT
USING (visible = true OR auth.uid() = user_id OR is_super_admin());

-- Vehicles visibility policy
CREATE POLICY "Hide invisible vehicle reports from public" ON vehicles
FOR SELECT 
USING (visible = true OR auth.uid() = user_id OR is_super_admin());

-- Allow super admins to update visibility
CREATE POLICY "Super admins can update person visibility" ON persons
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update device visibility" ON devices
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update vehicle visibility" ON vehicles
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Allow super admins to delete reports
CREATE POLICY "Super admins can delete person reports" ON persons
FOR DELETE
USING (is_super_admin());

CREATE POLICY "Super admins can delete device reports" ON devices
FOR DELETE
USING (is_super_admin());

CREATE POLICY "Super admins can delete vehicle reports" ON vehicles
FOR DELETE
USING (is_super_admin());

-- Create function to get user reports by email
CREATE OR REPLACE FUNCTION get_user_reports_by_email(user_email text)
RETURNS TABLE(
  report_id uuid,
  report_type text,
  report_data jsonb
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Return person reports
  RETURN QUERY
  SELECT 
    p.id,
    'person'::text,
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'age', p.age,
      'gender', p.gender,
      'location', p.location,
      'date_missing', p.date_missing,
      'status', p.status,
      'report_date', p.report_date,
      'image_url', p.image_url,
      'description', p.description,
      'visible', p.visible
    )
  FROM persons p
  WHERE p.reporter_email = user_email;

  -- Return device reports
  RETURN QUERY
  SELECT 
    d.id,
    'device'::text,
    jsonb_build_object(
      'id', d.id,
      'type', d.type,
      'brand', d.brand,
      'model', d.model,
      'location', d.location,
      'status', d.status,
      'report_date', d.report_date,
      'image_url', d.image_url,
      'description', d.description,
      'visible', d.visible
    )
  FROM devices d
  WHERE d.reporter_email = user_email;

  -- Return vehicle reports
  RETURN QUERY
  SELECT 
    v.id,
    'vehicle'::text,
    jsonb_build_object(
      'id', v.id,
      'type', v.type,
      'brand', v.brand,
      'model', v.model,
      'location', v.location,
      'status', v.status,
      'report_date', v.report_date,
      'image_url', v.image_url,
      'description', v.description,
      'visible', v.visible
    )
  FROM vehicles v
  WHERE v.reporter_email = user_email;
END;
$$;