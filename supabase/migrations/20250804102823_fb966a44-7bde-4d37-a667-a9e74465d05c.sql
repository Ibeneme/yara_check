-- Add shareholder_id to roi_distributions table to assign distributions to specific shareholders
ALTER TABLE public.roi_distributions 
ADD COLUMN shareholder_id UUID REFERENCES public.profiles(id),
ADD COLUMN notes TEXT;

-- Update RLS policies to allow shareholders to view their specific distributions
DROP POLICY IF EXISTS "Shareholders can view ROI distributions" ON public.roi_distributions;

CREATE POLICY "Shareholders can view ROI distributions" 
ON public.roi_distributions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.admin_role = 'shareholder'
    AND (roi_distributions.shareholder_id IS NULL OR roi_distributions.shareholder_id = auth.uid())
  )
);

-- Create admin management policies to allow super admins to delete profiles
CREATE POLICY "Super admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
  )
  AND id != auth.uid() -- Prevent deleting own profile
);