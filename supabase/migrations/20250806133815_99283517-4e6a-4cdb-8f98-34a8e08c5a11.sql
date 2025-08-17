-- Create company assets table
CREATE TABLE public.company_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  purchase_date DATE,
  purchase_price NUMERIC(15,2),
  current_value NUMERIC(15,2) NOT NULL,
  depreciation_rate NUMERIC(5,2) DEFAULT 0,
  location TEXT,
  condition TEXT NOT NULL DEFAULT 'excellent',
  serial_number TEXT,
  warranty_expiry DATE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.company_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for company assets
CREATE POLICY "Super admins can manage all assets" 
ON public.company_assets 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Admins with asset permission can view assets" 
ON public.company_assets 
FOR SELECT 
USING (
  has_admin_permission('can_view_assets')
);

CREATE POLICY "Admins with asset permission can create assets" 
ON public.company_assets 
FOR INSERT 
WITH CHECK (
  has_admin_permission('can_manage_assets')
);

CREATE POLICY "Admins with asset permission can update assets" 
ON public.company_assets 
FOR UPDATE 
USING (
  has_admin_permission('can_manage_assets')
);

CREATE POLICY "Admins with asset permission can delete assets" 
ON public.company_assets 
FOR DELETE 
USING (
  has_admin_permission('can_delete_assets')
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_assets_updated_at
BEFORE UPDATE ON public.company_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the default permissions structure to include asset permissions
UPDATE profiles 
SET permissions = permissions || jsonb_build_object(
  'can_view_assets', false,
  'can_manage_assets', false,
  'can_delete_assets', false
)
WHERE role = 'admin' AND admin_role != 'super_admin';