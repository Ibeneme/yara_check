-- Create household_items table
CREATE TABLE public.household_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT NOT NULL,
  imei TEXT NOT NULL, -- Serial number/unique identifier
  year INTEGER NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  contact TEXT NOT NULL,
  image_url TEXT,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  reporter_address TEXT,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country_id UUID,
  visible BOOLEAN DEFAULT true
);

-- Create business_reputation_reports table
CREATE TABLE public.business_reputation_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  reported_person_name TEXT NOT NULL,
  reported_person_contact TEXT NOT NULL,
  business_type TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_amount TEXT NOT NULL,
  reputation_status TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  reporter_phone TEXT NOT NULL,
  reporter_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification', -- pending_verification, verified, rejected
  visible BOOLEAN DEFAULT false, -- Default to false until verified
  verification_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country_id UUID
);

-- Create personal_belongings table
CREATE TABLE public.personal_belongings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT NOT NULL,
  imei TEXT NOT NULL, -- Serial number/unique identifier
  year INTEGER NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  contact TEXT NOT NULL,
  image_url TEXT,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  reporter_address TEXT,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country_id UUID,
  visible BOOLEAN DEFAULT true
);

-- Enable RLS for all new tables
ALTER TABLE public.household_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reputation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_belongings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for household_items
CREATE POLICY "Allow all access to household items" 
ON public.household_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- RLS Policies for business_reputation_reports
CREATE POLICY "Allow all access to business reputation reports" 
ON public.business_reputation_reports 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Super admins can manage business reputation report verification
CREATE POLICY "Super admins can verify business reputation reports" 
ON public.business_reputation_reports 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Hide unverified business reputation reports from public view
CREATE POLICY "Hide unverified business reputation reports" 
ON public.business_reputation_reports 
FOR SELECT 
USING (visible = true OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- RLS Policies for personal_belongings
CREATE POLICY "Allow all access to personal belongings" 
ON public.personal_belongings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_household_items_updated_at
  BEFORE UPDATE ON public.household_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_reputation_reports_updated_at
  BEFORE UPDATE ON public.business_reputation_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_belongings_updated_at
  BEFORE UPDATE ON public.personal_belongings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();