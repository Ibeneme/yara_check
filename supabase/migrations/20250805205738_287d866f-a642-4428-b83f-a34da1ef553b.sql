-- Add anonymous messages viewing permission to existing permissions structure
-- This will allow super admins to grant sub-admins the ability to view anonymous messages

-- Update existing profiles to add the new permission if they don't have it
UPDATE profiles 
SET permissions = COALESCE(permissions, '{}'::jsonb) || '{"can_view_anonymous_messages": false}'::jsonb
WHERE permissions IS NULL OR NOT (permissions ? 'can_view_anonymous_messages');