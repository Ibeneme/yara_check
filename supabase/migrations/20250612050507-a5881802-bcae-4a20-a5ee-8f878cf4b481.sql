
-- Drop and recreate the functions with proper security settings
DROP FUNCTION IF EXISTS public.search_items_public(text);
DROP FUNCTION IF EXISTS public.search_persons_public(text);

-- Create the search_items_public function with proper security settings
CREATE OR REPLACE FUNCTION public.search_items_public(search_term text)
RETURNS TABLE(item_id uuid, item_type text, item_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Search devices by IMEI
  RETURN QUERY
  SELECT 
    d.id,
    'device'::text,
    jsonb_build_object(
      'id', d.id,
      'type', d.type,
      'brand', d.brand,
      'model', d.model,
      'color', d.color,
      'location', d.location,
      'report_date', d.report_date,
      'imei', d.imei,
      'status', d.status,
      'description', d.description
    )
  FROM public.devices d
  WHERE d.imei = search_term;

  -- Search vehicles by chassis number
  RETURN QUERY
  SELECT 
    v.id,
    'vehicle'::text,
    jsonb_build_object(
      'id', v.id,
      'type', v.type,
      'brand', v.brand,
      'model', v.model,
      'color', v.color,
      'location', v.location,
      'report_date', v.report_date,
      'chassis', v.chassis,
      'year', v.year,
      'status', v.status,
      'description', v.description
    )
  FROM public.vehicles v
  WHERE v.chassis = search_term;
END;
$$;

-- Create the search_persons_public function with proper security settings
CREATE OR REPLACE FUNCTION public.search_persons_public(search_term text)
RETURNS TABLE(person_id uuid, person_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'age', p.age,
      'gender', p.gender,
      'physical_attributes', p.physical_attributes,
      'description', p.description,
      'location', p.location,
      'date_missing', p.date_missing,
      'status', p.status
    )
  FROM public.persons p
  WHERE p.name ILIKE '%' || search_term || '%' 
     OR p.description ILIKE '%' || search_term || '%'
     OR p.physical_attributes ILIKE '%' || search_term || '%';
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.search_items_public(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_persons_public(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_items_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.search_persons_public(text) TO anon;
