
-- Add tables for anonymous messages and contact logs
CREATE TABLE IF NOT EXISTS public.anonymous_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('person', 'device', 'vehicle')),
  message TEXT NOT NULL,
  sender_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add table to track contact attempts
CREATE TABLE IF NOT EXISTS public.contact_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('person', 'device', 'vehicle')),
  contact_type TEXT NOT NULL CHECK (contact_type IN ('police', 'owner', 'padiman')),
  contacted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.anonymous_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_logs ENABLE ROW LEVEL SECURITY;

-- Create simple policies for new tables
CREATE POLICY "anonymous_messages_allow_all" ON public.anonymous_messages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "contact_logs_allow_all" ON public.contact_logs FOR ALL TO public USING (true) WITH CHECK (true);

-- Add some sample financial records for demonstration
INSERT INTO public.financial_records (record_date, revenue, report_count) VALUES
  (CURRENT_DATE - INTERVAL '30 days', 1250.00, 45),
  (CURRENT_DATE - INTERVAL '60 days', 980.50, 38),
  (CURRENT_DATE - INTERVAL '90 days', 1450.75, 52),
  (CURRENT_DATE - INTERVAL '120 days', 890.25, 32)
ON CONFLICT DO NOTHING;
