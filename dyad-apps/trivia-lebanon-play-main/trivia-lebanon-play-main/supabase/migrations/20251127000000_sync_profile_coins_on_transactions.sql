-- Migration: Sync profile coins when transactions are inserted/updated
BEGIN;

-- Function: update profiles.coins when a completed transaction is inserted or updated
CREATE OR REPLACE FUNCTION public.sync_profile_coins_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply for completed transactions to avoid interim states
  IF NEW.status = 'completed' THEN
    IF NEW.type = 'credit' THEN
      UPDATE public.profiles
      SET coins = COALESCE(coins, 0) + CAST(NEW.amount AS INTEGER)
      WHERE id = NEW.user_id;
    ELSIF NEW.type = 'debit' THEN
      UPDATE public.profiles
      SET coins = COALESCE(coins, 0) - CAST(NEW.amount AS INTEGER)
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for insert and update to handle transactions
DROP TRIGGER IF EXISTS trigger_sync_profile_coins_on_transaction_insert ON public.transactions;
CREATE TRIGGER trigger_sync_profile_coins_on_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_coins_on_transaction();

DROP TRIGGER IF EXISTS trigger_sync_profile_coins_on_transaction_update ON public.transactions;
CREATE TRIGGER trigger_sync_profile_coins_on_transaction_update
  AFTER UPDATE OF status, type, amount ON public.transactions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.type IS DISTINCT FROM NEW.type OR OLD.amount IS DISTINCT FROM NEW.amount)
  EXECUTE FUNCTION public.sync_profile_coins_on_transaction();

COMMIT;
