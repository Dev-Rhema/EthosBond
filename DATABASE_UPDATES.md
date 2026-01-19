# Database Updates for Real-Time Chat

## Run this SQL in your Supabase SQL Editor

```sql
-- Messages table for real-time chat
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL,
  sender_address TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key to active_pairs
  CONSTRAINT fk_pair FOREIGN KEY (pair_id) REFERENCES active_pairs(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_messages_pair_id ON messages(pair_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_address) WHERE is_read = false;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (update these in production)
CREATE POLICY "Allow public read access" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON messages
  FOR UPDATE USING (true);

-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## Important Notes

1. Run this SQL script in your Supabase SQL Editor
2. The real-time subscription will work automatically after creating the table
3. Messages are linked to active_pairs, so when users unpair, messages are automatically deleted
4. The `is_read` field tracks unread messages for notifications