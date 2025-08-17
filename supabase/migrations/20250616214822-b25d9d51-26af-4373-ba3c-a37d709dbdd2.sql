
-- First, drop any existing conflicting policies that might be causing recursion
DROP POLICY IF EXISTS "Anyone can submit vehicle reports" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view their own vehicle reports" ON public.vehicles;
DROP POLICY IF EXISTS "Anyone can submit device reports" ON public.devices;
DROP POLICY IF EXISTS "Users can view their own device reports" ON public.devices;
DROP POLICY IF EXISTS "Anyone can submit person reports" ON public.persons;
DROP POLICY IF EXISTS "Users can view their own person reports" ON public.persons;

-- Now create clean, simple policies that avoid profile table references
CREATE POLICY "Allow insert vehicles" 
  ON public.vehicles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow select vehicles" 
  ON public.vehicles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow insert devices" 
  ON public.devices 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow select devices" 
  ON public.devices 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow insert persons" 
  ON public.persons 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow select persons" 
  ON public.persons 
  FOR SELECT 
  USING (true);
