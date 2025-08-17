
-- Add RLS policies for the reports tables to allow submissions without profile dependencies

-- Enable RLS on vehicles table if not already enabled
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert vehicle reports
CREATE POLICY "Anyone can submit vehicle reports" 
  ON public.vehicles 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to view their own vehicle reports
CREATE POLICY "Users can view their own vehicle reports" 
  ON public.vehicles 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Enable RLS on devices table if not already enabled
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert device reports
CREATE POLICY "Anyone can submit device reports" 
  ON public.devices 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to view their own device reports
CREATE POLICY "Users can view their own device reports" 
  ON public.devices 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Enable RLS on persons table if not already enabled
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert person reports
CREATE POLICY "Anyone can submit person reports" 
  ON public.persons 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to view their own person reports
CREATE POLICY "Users can view their own person reports" 
  ON public.persons 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);
