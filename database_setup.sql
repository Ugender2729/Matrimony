-- Create separate tables for brides and grooms
-- Run this SQL in Supabase SQL Editor

-- Brides table
CREATE TABLE IF NOT EXISTS brides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'bride' CHECK (profile_type = 'bride'),
  phone TEXT,
  date_of_birth DATE,
  height TEXT,
  education TEXT,
  occupation TEXT,
  salary TEXT,
  city TEXT,
  state TEXT,
  religion TEXT,
  mother_tongue TEXT,
  family_type TEXT,
  about TEXT,
  profile_image TEXT,
  profile_images TEXT[],
  is_profile_complete BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  created_by_admin TEXT
);

-- Grooms table
CREATE TABLE IF NOT EXISTS grooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'groom' CHECK (profile_type = 'groom'),
  phone TEXT,
  date_of_birth DATE,
  height TEXT,
  education TEXT,
  occupation TEXT,
  salary TEXT,
  city TEXT,
  state TEXT,
  religion TEXT,
  mother_tongue TEXT,
  family_type TEXT,
  about TEXT,
  profile_image TEXT,
  profile_images TEXT[],
  is_profile_complete BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  created_by_admin TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brides_mobile ON brides(mobile);
CREATE INDEX IF NOT EXISTS idx_brides_status ON brides(status);
CREATE INDEX IF NOT EXISTS idx_grooms_mobile ON grooms(mobile);
CREATE INDEX IF NOT EXISTS idx_grooms_status ON grooms(status);

-- Enable RLS
ALTER TABLE brides ENABLE ROW LEVEL SECURITY;
ALTER TABLE grooms ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR BRIDES TABLE
-- ============================================

-- SELECT Policies for Brides
-- Public can view approved and complete profiles
DROP POLICY IF EXISTS "Public can view approved brides" ON brides;
CREATE POLICY "Public can view approved brides"
  ON brides FOR SELECT
  USING (status = 'approved' AND is_profile_complete = true);

-- Users can view their own profile (any status)
DROP POLICY IF EXISTS "Users can view own bride profile" ON brides;
CREATE POLICY "Users can view own bride profile"
  ON brides FOR SELECT
  USING (true); -- App logic handles filtering by mobile/id

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all brides" ON brides;
CREATE POLICY "Admins can view all brides"
  ON brides FOR SELECT
  USING (true); -- App logic handles admin check

-- INSERT Policies for Brides
-- Anyone can register (create their own profile)
DROP POLICY IF EXISTS "Anyone can register as bride" ON brides;
CREATE POLICY "Anyone can register as bride"
  ON brides FOR INSERT
  WITH CHECK (true);

-- Admins can create profiles for others
DROP POLICY IF EXISTS "Admins can create bride profiles" ON brides;
CREATE POLICY "Admins can create bride profiles"
  ON brides FOR INSERT
  WITH CHECK (true); -- App logic handles admin check

-- UPDATE Policies for Brides
-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own bride profile" ON brides;
CREATE POLICY "Users can update own bride profile"
  ON brides FOR UPDATE
  USING (true) -- App logic handles ownership check
  WITH CHECK (true);

-- Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any bride profile" ON brides;
CREATE POLICY "Admins can update any bride profile"
  ON brides FOR UPDATE
  USING (true) -- App logic handles admin check
  WITH CHECK (true);

-- DELETE Policies for Brides
-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own bride profile" ON brides;
CREATE POLICY "Users can delete own bride profile"
  ON brides FOR DELETE
  USING (true); -- App logic handles ownership check

-- Admins can delete any profile
DROP POLICY IF EXISTS "Admins can delete any bride profile" ON brides;
CREATE POLICY "Admins can delete any bride profile"
  ON brides FOR DELETE
  USING (true); -- App logic handles admin check

-- ============================================
-- RLS POLICIES FOR GROOMS TABLE
-- ============================================

-- SELECT Policies for Grooms
-- Public can view approved and complete profiles
DROP POLICY IF EXISTS "Public can view approved grooms" ON grooms;
CREATE POLICY "Public can view approved grooms"
  ON grooms FOR SELECT
  USING (status = 'approved' AND is_profile_complete = true);

-- Users can view their own profile (any status)
DROP POLICY IF EXISTS "Users can view own groom profile" ON grooms;
CREATE POLICY "Users can view own groom profile"
  ON grooms FOR SELECT
  USING (true); -- App logic handles filtering by mobile/id

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all grooms" ON grooms;
CREATE POLICY "Admins can view all grooms"
  ON grooms FOR SELECT
  USING (true); -- App logic handles admin check

-- INSERT Policies for Grooms
-- Anyone can register (create their own profile)
DROP POLICY IF EXISTS "Anyone can register as groom" ON grooms;
CREATE POLICY "Anyone can register as groom"
  ON grooms FOR INSERT
  WITH CHECK (true);

-- Admins can create profiles for others
DROP POLICY IF EXISTS "Admins can create groom profiles" ON grooms;
CREATE POLICY "Admins can create groom profiles"
  ON grooms FOR INSERT
  WITH CHECK (true); -- App logic handles admin check

-- UPDATE Policies for Grooms
-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own groom profile" ON grooms;
CREATE POLICY "Users can update own groom profile"
  ON grooms FOR UPDATE
  USING (true) -- App logic handles ownership check
  WITH CHECK (true);

-- Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any groom profile" ON grooms;
CREATE POLICY "Admins can update any groom profile"
  ON grooms FOR UPDATE
  USING (true) -- App logic handles admin check
  WITH CHECK (true);

-- DELETE Policies for Grooms
-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own groom profile" ON grooms;
CREATE POLICY "Users can delete own groom profile"
  ON grooms FOR DELETE
  USING (true); -- App logic handles ownership check

-- Admins can delete any profile
DROP POLICY IF EXISTS "Admins can delete any groom profile" ON grooms;
CREATE POLICY "Admins can delete any groom profile"
  ON grooms FOR DELETE
  USING (true); -- App logic handles admin check

-- Drop existing users view or table if it exists (since we're replacing it with a view)
DROP VIEW IF EXISTS users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Compatibility view (keeps existing app code working)
-- This view presents a unified users dataset across brides and grooms
CREATE OR REPLACE VIEW users AS
SELECT
  id,
  email,
  mobile,
  password,
  name,
  profile_type,
  phone,
  date_of_birth,
  height,
  education,
  occupation,
  salary,
  city,
  state,
  religion,
  mother_tongue,
  family_type,
  about,
  profile_image,
  profile_images,
  is_profile_complete,
  status,
  role,
  created_at,
  updated_at,
  created_by,
  created_by_admin
FROM brides
UNION ALL
SELECT
  id,
  email,
  mobile,
  password,
  name,
  profile_type,
  phone,
  date_of_birth,
  height,
  education,
  occupation,
  salary,
  city,
  state,
  religion,
  mother_tongue,
  family_type,
  about,
  profile_image,
  profile_images,
  is_profile_complete,
  status,
  role,
  created_at,
  updated_at,
  created_by,
  created_by_admin
FROM grooms;

