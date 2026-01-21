# Database Setup Instructions

## Error You're Seeing

```
406 Failed to load resource
400 Failed to load resource
Error saving profile: Failed to save profile
```

## Why This Happens

The database is missing the new columns (`gender_preference` and `min_visible_to_ethos_score`) that the app is trying to save.

## How to Fix

### Step 1: Go to Supabase Dashboard

1. Open your Supabase dashboard at https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Database Schema

Copy and paste the entire contents of `complete-database-schema.sql` into the SQL editor and click "Run".

This will:
- Create the `profiles` table if it doesn't exist
- Add the missing columns (`gender_preference`, `min_visible_to_ethos_score`)
- Create indexes for better performance
- Set up Row Level Security policies

### Step 3: Verify the Changes

After running the SQL, you can verify the changes by:

1. Go to "Table Editor" in the left sidebar
2. Select the `profiles` table
3. Check that these columns exist:
   - `gender_preference` (text)
   - `min_visible_to_ethos_score` (int8)

### Step 4: Test the App

1. Refresh your app
2. Try creating a new profile
3. The error should be gone!

## Alternative: Quick Fix (If you just need the new columns)

If your profiles table already exists and you just need to add the new columns, run this simpler SQL:

```sql
-- Add gender_preference column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender_preference TEXT;

-- Add min_visible_to_ethos_score column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS min_visible_to_ethos_score INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_gender_preference ON profiles(gender_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_min_visible_ethos_score ON profiles(min_visible_to_ethos_score);
```

## What Each Column Does

- **gender_preference**: Stores values like `man-woman`, `woman-man`, `man-everyone`, etc.
  - Used for gender-based matching in the discovery feed

- **min_visible_to_ethos_score**: Stores a number (0-2800)
  - Controls who can see this user's profile based on their Ethos score
  - Default is 0 (visible to everyone)

## Troubleshooting

If you still see errors after running the migration:

1. **Check your Supabase URL and keys** in `.env` file:
   ```
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

2. **Check Row Level Security (RLS) policies**:
   - Go to "Authentication" > "Policies" in Supabase
   - Make sure there's a policy allowing operations on the `profiles` table

3. **Clear browser cache and reload** the app

4. **Check browser console** for any other errors
