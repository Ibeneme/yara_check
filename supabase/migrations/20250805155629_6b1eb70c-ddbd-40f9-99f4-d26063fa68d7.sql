-- Add new admin roles to existing enum
ALTER TYPE admin_role ADD VALUE 'customer_support_executive';
ALTER TYPE admin_role ADD VALUE 'investor';

-- Create support tickets table for Contact Support functionality
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT
);

-- Enable RLS on support tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for support tickets
CREATE POLICY "Users can submit tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Super admins can view all tickets" 
ON public.support_tickets 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Admins with ticket permission can view tickets" 
ON public.support_tickets 
FOR SELECT 
USING (has_admin_permission('can_view_support_tickets'));

CREATE POLICY "Admins with ticket permission can update tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (has_admin_permission('can_view_support_tickets'));

-- Add support tickets permission to existing permissions
-- This will be handled in the AdminPermissionsForm component

-- Create trigger for updating timestamps
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();