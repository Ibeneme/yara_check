-- Fix the search_by_tracking_code function to resolve ambiguous column references
DROP FUNCTION IF EXISTS public.search_by_tracking_code(text);

CREATE OR REPLACE FUNCTION public.search_by_tracking_code(search_tracking_code text)
RETURNS TABLE(report_id uuid, report_type text, report_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Search in persons table by tracking_code
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
      'tracking_code', p.tracking_code
    )
  FROM public.persons p
  WHERE p.tracking_code = search_tracking_code;

  -- Search in devices table by tracking_code
  RETURN QUERY
  SELECT 
    d.id,
    'device'::text,
    jsonb_build_object(
      'id', d.id,
      'type', d.type,
      'brand', d.brand,
      'model', d.model,
      'imei', d.imei,
      'location', d.location,
      'status', d.status,
      'report_date', d.report_date,
      'image_url', d.image_url,
      'tracking_code', d.tracking_code
    )
  FROM public.devices d
  WHERE d.tracking_code = search_tracking_code;

  -- Search in vehicles table by tracking_code
  RETURN QUERY
  SELECT 
    v.id,
    'vehicle'::text,
    jsonb_build_object(
      'id', v.id,
      'type', v.type,
      'brand', v.brand,
      'model', v.model,
      'chassis', v.chassis,
      'location', v.location,
      'status', v.status,
      'report_date', v.report_date,
      'image_url', v.image_url,
      'tracking_code', v.tracking_code
    )
  FROM public.vehicles v
  WHERE v.tracking_code = search_tracking_code;

  -- Search in household_items table by tracking_code
  RETURN QUERY
  SELECT 
    h.id,
    'household'::text,
    jsonb_build_object(
      'id', h.id,
      'type', h.type,
      'brand', h.brand,
      'model', h.model,
      'imei', h.imei,
      'location', h.location,
      'status', h.status,
      'report_date', h.report_date,
      'image_url', h.image_url,
      'tracking_code', h.tracking_code
    )
  FROM public.household_items h
  WHERE h.tracking_code = search_tracking_code;

  -- Search in personal_belongings table by tracking_code
  RETURN QUERY
  SELECT 
    pb.id,
    'personal'::text,
    jsonb_build_object(
      'id', pb.id,
      'type', pb.type,
      'brand', pb.brand,
      'model', pb.model,
      'imei', pb.imei,
      'location', pb.location,
      'status', pb.status,
      'report_date', pb.report_date,
      'image_url', pb.image_url,
      'tracking_code', pb.tracking_code
    )
  FROM public.personal_belongings pb
  WHERE pb.tracking_code = search_tracking_code;

  -- Search in hacked_accounts table by tracking_code
  RETURN QUERY
  SELECT 
    ha.id,
    'account'::text,
    jsonb_build_object(
      'id', ha.id,
      'account_type', ha.account_type,
      'account_identifier', ha.account_identifier,
      'date_compromised', ha.date_compromised,
      'status', ha.status,
      'report_date', ha.report_date,
      'description', ha.description,
      'tracking_code', ha.tracking_code
    )
  FROM public.hacked_accounts ha
  WHERE ha.tracking_code = search_tracking_code;

  -- Search in business_reputation_reports table by tracking_code
  RETURN QUERY
  SELECT 
    brr.id,
    'reputation'::text,
    jsonb_build_object(
      'id', brr.id,
      'reported_person_name', brr.reported_person_name,
      'reported_person_contact', brr.reported_person_contact,
      'business_type', brr.business_type,
      'reputation_status', brr.reputation_status,
      'status', brr.status,
      'report_date', brr.report_date,
      'description', brr.description,
      'tracking_code', brr.tracking_code
    )
  FROM public.business_reputation_reports brr
  WHERE brr.tracking_code = search_tracking_code;
END;
$function$;