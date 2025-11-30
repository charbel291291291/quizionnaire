-- Migration: Sync profiles.coins on completed purchases
BEGIN;

-- Function to update profile coins when a completed purchase is inserted
CREATE OR REPLACE FUNCTION public.sync_profile_coins_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.profiles
    SET coins = COALESCE(coins, 0) + NEW.coins_purchased
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchases
DROP TRIGGER IF EXISTS trigger_sync_profile_coins_on_purchase ON purchases;
CREATE TRIGGER trigger_sync_profile_coins_on_purchase
  AFTER INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_coins_on_purchase();

COMMIT;
