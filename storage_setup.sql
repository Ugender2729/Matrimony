-- Supabase Storage Setup
-- Run this AFTER creating the storage bucket through the UI

-- Note: First create the bucket through Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name: profile-images
-- 4. Set to Public
-- 5. Then run this SQL to add policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images" ON storage.objects;

-- Allow anyone (including anonymous) to read public images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- Allow anyone (including anonymous) to upload images
-- This is needed for admin profile creation and user registration
CREATE POLICY "Users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-images');

-- Allow anyone (including anonymous) to update images
CREATE POLICY "Users can update images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-images');

-- Allow anyone (including anonymous) to delete images
CREATE POLICY "Users can delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-images');


