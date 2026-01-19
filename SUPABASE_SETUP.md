# Supabase Setup Instructions

## Step 1: Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Create a new project (give it a name like "ethos-pair")
4. Wait for the project to be provisioned (~2 minutes)

## Step 2: Create Database Tables

Go to the SQL Editor in your Supabase dashboard and run this SQL:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  name TEXT,
  display_name TEXT,
  username TEXT,
  location TEXT,
  nationality TEXT,
  continent TEXT,
  interests TEXT[], -- Array of interests
  looking_for TEXT[], -- Array of relationship types
  profile_picture TEXT,
  ethos_score INTEGER DEFAULT 0,
  trust_level TEXT,
  xp_total INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pair requests table
CREATE TABLE pair_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_pair_request UNIQUE(from_address, to_address)
);

-- Active pairs table
CREATE TABLE active_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_address TEXT NOT NULL,
  user2_address TEXT NOT NULL,
  paired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_pair UNIQUE(user1_address, user2_address)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL,
  sender_address TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked users table
CREATE TABLE blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_address TEXT NOT NULL,
  blocked_address TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_block UNIQUE(blocker_address, blocked_address),
  CHECK (blocker_address != blocked_address)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_address ON profiles(address);
CREATE INDEX idx_pair_requests_to ON pair_requests(to_address) WHERE status = 'pending';
CREATE INDEX idx_pair_requests_from ON pair_requests(from_address) WHERE status = 'pending';
CREATE INDEX idx_active_pairs_user1 ON active_pairs(user1_address);
CREATE INDEX idx_active_pairs_user2 ON active_pairs(user2_address);
CREATE INDEX idx_messages_pair_id ON messages(pair_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_address) WHERE is_read = false;
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_address);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_address);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since we're not using auth yet)
-- Note: In production, you should add proper authentication

-- Profiles policies
CREATE POLICY "Allow public read access" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON profiles
  FOR UPDATE USING (true);

-- Pair requests policies
CREATE POLICY "Allow public read access" ON pair_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON pair_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON pair_requests
  FOR UPDATE USING (true);

-- Active pairs policies
CREATE POLICY "Allow public read access" ON active_pairs
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON active_pairs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete" ON active_pairs
  FOR DELETE USING (true);

-- Messages policies
CREATE POLICY "Allow public read access" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON messages
  FOR UPDATE USING (true);

-- Blocked users policies
CREATE POLICY "Allow public read access" ON blocked_users
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON blocked_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete" ON blocked_users
  FOR DELETE USING (true);
```

## Step 3: Get Your API Keys

1. Go to Project Settings → API
2. Copy your "Project URL" (looks like: https://xxxxx.supabase.co)
3. Copy your "anon public" key (long string starting with "eyJ...")

## Step 4: Configure Your App

1. Create a `.env` file in your project root (not `.env.example`):

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace `your_project_url_here` with your actual Project URL
3. Replace `your_anon_key_here` with your actual anon key

## Step 5: Restart Your Dev Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Important Notes

- The `.env` file contains your API keys and should NOT be committed to git
- The `.env` file is already in `.gitignore`
- Share `.env.example` with your team, not `.env`
- Supabase free tier includes:
  - 500 MB database space
  - 1 GB file storage
  - 2 GB bandwidth per month
  - 50,000 monthly active users
  - Perfect for development and small apps!

## Troubleshooting

If you get errors:
1. Make sure your `.env` file is in the project root (same folder as `package.json`)
2. Restart your dev server after creating/editing `.env`
3. Check that your Supabase project is active in the dashboard
4. Verify your API keys are correct (no extra spaces)