/*
# Create Supabase Storage bucket for hospital images

1. New Storage
- `hospital-images` bucket — for storing uploaded images (services, departments, gallery, news, logos)

2. Security
- Allow public read access to all images
- Allow authenticated users to upload, update, and delete images
- 10MB file size limit
- Only image MIME types allowed
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hospital-images', 'hospital-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Enable public read access
DROP POLICY IF EXISTS "Public can read hospital images" ON storage.objects;
CREATE POLICY "Public can read hospital images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'hospital-images');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated can upload images" ON storage.objects;
CREATE POLICY "Authenticated can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hospital-images');

-- Allow authenticated users to update images
DROP POLICY IF EXISTS "Authenticated can update images" ON storage.objects;
CREATE POLICY "Authenticated can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hospital-images')
WITH CHECK (bucket_id = 'hospital-images');

-- Allow authenticated users to delete images
DROP POLICY IF EXISTS "Authenticated can delete images" ON storage.objects;
CREATE POLICY "Authenticated can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hospital-images');
