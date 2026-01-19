-- ============================================
-- ETHOS PAIR DATABASE SCHEMA
-- For Supabase PostgreSQL
-- ============================================

-- 1️⃣ USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ethos_address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_picture TEXT,
  ethos_score INTEGER,
  location TEXT,
  nationality TEXT,
  interests TEXT[], -- Array of strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_ethos_address ON users(ethos_address);

-- 2️⃣ PAIRS TABLE (Connections)
-- ============================================
CREATE TABLE pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  paired_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'ended')),
  paired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, paired_user_id),
  CHECK (user_id != paired_user_id)
);

CREATE INDEX idx_pairs_user_id ON pairs(user_id);
CREATE INDEX idx_pairs_status ON pairs(status);
CREATE INDEX idx_pairs_paired_user_id ON pairs(paired_user_id);

-- 3️⃣ PAIRING REQUESTS TABLE
-- ============================================
CREATE TABLE pairing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id)
);

CREATE INDEX idx_pairing_requests_to_user ON pairing_requests(to_user_id);
CREATE INDEX idx_pairing_requests_status ON pairing_requests(status);

-- 4️⃣ MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID REFERENCES pairs(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_messages_pair_id ON messages(pair_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 5️⃣ PROFILE VIEWS TABLE (Analytics)
-- ============================================
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT CHECK (action IN ('skip', 'pair_request'))
);

CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed_user ON profile_views(viewed_user_id);

-- 6️⃣ AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Accept Pairing Request
CREATE OR REPLACE FUNCTION accept_pairing_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  req pairing_requests;
BEGIN
  SELECT * INTO req FROM pairing_requests WHERE id = request_id;
  
  UPDATE pairing_requests
  SET status = 'accepted', responded_at = NOW()
  WHERE id = request_id;
  
  INSERT INTO pairs (user_id, paired_user_id, status)
  VALUES 
    (req.from_user_id, req.to_user_id, 'active'),
    (req.to_user_id, req.from_user_id, 'active');
END;
$$ LANGUAGE plpgsql;

-- End Pairing
CREATE OR REPLACE FUNCTION end_pairing(pair_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pairs
  SET status = 'ended', ended_at = NOW()
  WHERE id = pair_id OR 
    (user_id = (SELECT paired_user_id FROM pairs WHERE id = pair_id) AND
     paired_user_id = (SELECT user_id FROM pairs WHERE id = pair_id));
END;
$$ LANGUAGE plpgsql;
