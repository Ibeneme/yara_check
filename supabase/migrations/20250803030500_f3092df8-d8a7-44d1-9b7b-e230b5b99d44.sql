-- Create ROI distributions table
CREATE TABLE public.roi_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(15,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  distributed_by UUID REFERENCES profiles(id),
  withdrawal_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ROI withdrawal requests table
CREATE TABLE public.roi_withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distribution_id UUID REFERENCES roi_distributions(id) ON DELETE CASCADE,
  shareholder_id UUID REFERENCES profiles(id),
  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sent', 'completed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id),
  notes TEXT
);

-- Create live chat messages table
CREATE TABLE public.live_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT false,
  admin_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.roi_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for ROI distributions
CREATE POLICY "Super admins can manage ROI distributions" 
ON public.roi_distributions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "Shareholders can view ROI distributions" 
ON public.roi_distributions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND admin_role = 'shareholder'
));

-- RLS policies for ROI withdrawal requests  
CREATE POLICY "Shareholders can manage their own withdrawal requests" 
ON public.roi_withdrawal_requests 
FOR ALL 
USING (shareholder_id = auth.uid());

CREATE POLICY "Super admins can view all withdrawal requests" 
ON public.roi_withdrawal_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'super_admin'
));

-- RLS policies for live chat
CREATE POLICY "Users can view and send chat messages" 
ON public.live_chat_messages 
FOR ALL 
USING (true);

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roi_distributions_updated_at
BEFORE UPDATE ON public.roi_distributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();