-- Fix RLS policy for shareholders to see all distributions they should have access to
DROP POLICY "Shareholders can view ROI distributions" ON roi_distributions;

-- Create new policy allowing shareholders to see distributions they're eligible for
CREATE POLICY "Shareholders can view eligible ROI distributions" 
ON roi_distributions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.admin_role = 'shareholder'
    AND (
      roi_distributions.shareholder_id IS NULL 
      OR roi_distributions.shareholder_id = auth.uid()
    )
  )
);