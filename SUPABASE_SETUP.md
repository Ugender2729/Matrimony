# Supabase Database Setup

## Quick Setup

1. **Go to Supabase Dashboard**: https://sjrcaflgzhhjkahnboft.supabase.co
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `database_setup.sql`** (in the project root)
4. **Click "Run"** to execute the SQL

## Required Tables

### 1. Users Table

The SQL file `database_setup.sql` contains all the necessary SQL commands. It includes:

- Users table creation with all required fields
- Indexes for performance
- Row Level Security (RLS) policies
- Public access policy for approved profiles

**Important**: Copy the entire contents of `database_setup.sql` file and paste it into the Supabase SQL Editor, then run it.

### 2. Storage Bucket for Images

**Step 1**: Create the bucket through Supabase Dashboard:
1. Go to **Storage** → Click **"New bucket"**
2. Name: `profile-images`
3. Set to **Public** 
4. Click **"Create bucket"**

**Step 2**: Add storage policies:
1. Go to **SQL Editor**
2. Copy and paste the entire contents of `storage_setup.sql`
3. Click **"Run"** to execute the SQL

Alternatively, you can add policies through the Storage UI:
- Go to Storage → `profile-images` bucket → Policies → New Policy

## Setup Steps

1. Go to your Supabase Dashboard: https://sjrcaflgzhhjkahnboft.supabase.co
2. Navigate to SQL Editor
3. Run the SQL commands above
4. Navigate to Storage
5. Create the `profile-images` bucket with public access

## Notes

- For production, consider using Supabase Auth instead of storing passwords
- Row Level Security (RLS) policies control who can access what data
- Images are stored in Supabase Storage, not in the database (only URLs are stored)

