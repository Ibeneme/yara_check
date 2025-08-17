
-- Insert a comprehensive list of countries
INSERT INTO public.countries (name, code) VALUES
('Afghanistan', 'AF'),
('Albania', 'AL'),
('Algeria', 'DZ'),
('Argentina', 'AR'),
('Australia', 'AU'),
('Austria', 'AT'),
('Bangladesh', 'BD'),
('Belgium', 'BE'),
('Brazil', 'BR'),
('Canada', 'CA'),
('China', 'CN'),
('Denmark', 'DK'),
('Egypt', 'EG'),
('Finland', 'FI'),
('France', 'FR'),
('Germany', 'DE'),
('Ghana', 'GH'),
('Greece', 'GR'),
('India', 'IN'),
('Indonesia', 'ID'),
('Iran', 'IR'),
('Iraq', 'IQ'),
('Ireland', 'IE'),
('Israel', 'IL'),
('Italy', 'IT'),
('Japan', 'JP'),
('Kenya', 'KE'),
('South Korea', 'KR'),
('Malaysia', 'MY'),
('Mexico', 'MX'),
('Netherlands', 'NL'),
('New Zealand', 'NZ'),
('Nigeria', 'NG'),
('Norway', 'NO'),
('Pakistan', 'PK'),
('Philippines', 'PH'),
('Poland', 'PL'),
('Portugal', 'PT'),
('Russia', 'RU'),
('Saudi Arabia', 'SA'),
('Singapore', 'SG'),
('South Africa', 'ZA'),
('Spain', 'ES'),
('Sweden', 'SE'),
('Switzerland', 'CH'),
('Thailand', 'TH'),
('Turkey', 'TR'),
('Ukraine', 'UA'),
('United Arab Emirates', 'AE'),
('United Kingdom', 'GB'),
('United States', 'US'),
('Vietnam', 'VN')
ON CONFLICT (code) DO NOTHING;

-- Fix the admin profile visibility issue by updating RLS policies
DROP POLICY IF EXISTS "Admins can view other admin profiles" ON public.profiles;

CREATE POLICY "Admins can view other admin profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  -- Super admins can see all profiles
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
  OR
  -- Users can see their own profile
  id = auth.uid()
);

-- Ensure the generate_secure_temp_password function works correctly
CREATE OR REPLACE FUNCTION public.generate_secure_temp_password()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;
