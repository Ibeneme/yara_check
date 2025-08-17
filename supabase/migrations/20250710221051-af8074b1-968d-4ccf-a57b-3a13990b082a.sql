
-- Create the reports storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow public uploads to reports bucket
CREATE POLICY "Anyone can upload to reports bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'reports');

-- Create storage policy to allow public access to reports bucket
CREATE POLICY "Anyone can view reports bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'reports');

-- Create storage policy to allow public updates to reports bucket  
CREATE POLICY "Anyone can update reports bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'reports');

-- Create storage policy to allow public deletes from reports bucket
CREATE POLICY "Anyone can delete from reports bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'reports');
