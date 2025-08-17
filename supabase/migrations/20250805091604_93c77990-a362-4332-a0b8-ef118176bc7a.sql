-- Create a table for hacked account reports
CREATE TABLE public.hacked_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  account_type TEXT NOT NULL,
  account_identifier TEXT NOT NULL,
  date_compromised DATE NOT NULL,
  description TEXT NOT NULL,
  contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  country_id UUID,
  visible BOOLEAN DEFAULT true,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  reporter_address TEXT,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hacked_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for hacked accounts
CREATE POLICY "Allow all access to hacked accounts" 
ON public.hacked_accounts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_hacked_accounts_updated_at
BEFORE UPDATE ON public.hacked_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();