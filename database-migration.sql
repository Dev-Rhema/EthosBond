-- Migration: Add gender preferences and profile visibility settings
-- Run this in your Supabase SQL editor

-- Add gender_preference column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender_preference TEXT;

-- Add min_visible_to_ethos_score column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS min_visible_to_ethos_score INTEGER DEFAULT 0;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_gender_preference ON profiles(gender_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_min_visible_ethos_score ON profiles(min_visible_to_ethos_score);

-- Update existing profiles to have default visibility (everyone can see)
UPDATE profiles
SET min_visible_to_ethos_score = 0
WHERE min_visible_to_ethos_score IS NULL;
