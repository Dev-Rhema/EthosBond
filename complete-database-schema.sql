-- Complete Database Schema for Ethos Pair App
-- Run this SQL in your Supabase SQL Editor

-- Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  name TEXT,
  display_name TEXT,
  username TEXT,
  location TEXT,
  nationality TEXT,
  continent TEXT,
  interests TEXT[],
  looking_for TEXT[],
  profile_picture TEXT,
  ethos_score INTEGER DEFAULT 0,
  trust_level TEXT,
  xp_total INTEGER DEFAULT 0,
  description TEXT,
  gender_preference TEXT,
  min_visible_to_ethos_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add gender_preference if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gender_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gender_preference TEXT;
  END IF;

  -- Add min_visible_to_ethos_score if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'min_visible_to_ethos_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN min_visible_to_ethos_score INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_address ON profiles(address);
CREATE INDEX IF NOT EXISTS idx_profiles_gender_preference ON profiles(gender_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_min_visible_ethos_score ON profiles(min_visible_to_ethos_score);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive later)
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update existing profiles to have default visibility
UPDATE profiles
SET min_visible_to_ethos_score = 0
WHERE min_visible_to_ethos_score IS NULL;
