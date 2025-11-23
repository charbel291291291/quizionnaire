-- Create purchases table for coin purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id VARCHAR(50) NOT NULL,
  coins_purchased INTEGER NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'LBP' NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('whish', 'omt', 'card', 'paypal', 'other')),
  payment_reference TEXT,
  status VARCHAR(20) DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_method ON purchases(payment_method);

-- Enable Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchases
CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON purchases TO authenticated;

-- Create function to track purchase in wallet transactions
CREATE OR REPLACE FUNCTION create_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create wallet transaction for completed purchases
  IF NEW.status = 'completed' THEN
    -- Get or create user's wallet
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (NEW.user_id, 0, 'LBP')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create transaction record
    INSERT INTO transactions (
      wallet_id,
      user_id,
      amount,
      type,
      category,
      description,
      reference_id,
      status
    )
    SELECT 
      w.id,
      NEW.user_id,
      NEW.coins_purchased,
      'credit',
      'bonus',
      'Coin purchase: ' || NEW.package_id || ' (' || NEW.coins_purchased || ' coins)',
      NEW.id,
      'completed'
    FROM wallets w
    WHERE w.user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic wallet transaction on purchase
DROP TRIGGER IF EXISTS trigger_create_purchase_transaction ON purchases;
CREATE TRIGGER trigger_create_purchase_transaction
  AFTER INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION create_purchase_transaction();
