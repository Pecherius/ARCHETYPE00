-- Create tables for the raffle system

-- Raffles table
CREATE TABLE IF NOT EXISTS raffles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tickets INTEGER NOT NULL DEFAULT 1,
  up_address TEXT,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prizes table
CREATE TABLE IF NOT EXISTS prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  remaining INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Winners table
CREATE TABLE IF NOT EXISTS winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  prize_id UUID REFERENCES prizes(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  prize_name VARCHAR(255) NOT NULL,
  participant_color VARCHAR(7) NOT NULL,
  up_address TEXT,
  won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_raffle_id ON participants(raffle_id);
CREATE INDEX IF NOT EXISTS idx_prizes_raffle_id ON prizes(raffle_id);
CREATE INDEX IF NOT EXISTS idx_winners_raffle_id ON winners(raffle_id);
CREATE INDEX IF NOT EXISTS idx_participants_up_address ON participants(up_address) WHERE up_address IS NOT NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for raffles table
DROP TRIGGER IF EXISTS update_raffles_updated_at ON raffles;
CREATE TRIGGER update_raffles_updated_at
    BEFORE UPDATE ON raffles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
