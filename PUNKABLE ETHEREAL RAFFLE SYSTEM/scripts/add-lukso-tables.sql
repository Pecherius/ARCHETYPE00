-- Add LUKSO-specific tables for NFT management

-- NFT Prizes table for managing actual NFT contracts and tokens
CREATE TABLE IF NOT EXISTS nft_prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prize_id UUID REFERENCES prizes(id) ON DELETE CASCADE,
  contract_address VARCHAR(42), -- LUKSO contract address
  token_ids TEXT[], -- Array of available token IDs
  metadata_url TEXT,
  image_url TEXT,
  total_supply INTEGER DEFAULT 1,
  remaining_supply INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction tracking for LUKSO blockchain
CREATE TABLE IF NOT EXISTS lukso_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  winner_id UUID REFERENCES winners(id) ON DELETE CASCADE,
  up_address VARCHAR(42) NOT NULL,
  prize_name VARCHAR(255) NOT NULL,
  nft_contract VARCHAR(42),
  token_id VARCHAR(255),
  transaction_hash VARCHAR(66), -- LUKSO transaction hash
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'confirmed', 'failed')),
  gas_used BIGINT,
  gas_price BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Metadata for tracking
  batch_id UUID, -- For grouping batch transactions
  notes TEXT
);

-- Batch operations table
CREATE TABLE IF NOT EXISTS transaction_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  total_transactions INTEGER NOT NULL,
  completed_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- LUKSO specific data
  from_address VARCHAR(42), -- Your Universal Profile address
  estimated_gas BIGINT,
  total_gas_used BIGINT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lukso_transactions_winner_id ON lukso_transactions(winner_id);
CREATE INDEX IF NOT EXISTS idx_lukso_transactions_status ON lukso_transactions(status);
CREATE INDEX IF NOT EXISTS idx_lukso_transactions_batch_id ON lukso_transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_nft_prizes_prize_id ON nft_prizes(prize_id);
CREATE INDEX IF NOT EXISTS idx_nft_prizes_contract_address ON nft_prizes(contract_address);
