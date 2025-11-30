-- Migration: Add XP and Level to profiles and xp_earned to user_quiz_history
BEGIN;

-- Add xp and level columns to profiles if not exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;

-- Add xp_earned column to user_quiz_history if not exist
ALTER TABLE public.user_quiz_history
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER NOT NULL DEFAULT 0;

-- Update existing rows to have level consistent with xp
UPDATE public.profiles
SET level = GREATEST(1, FLOOR(COALESCE(xp, 0) / 100) + 1);

-- Create function to update level from xp whenever xp changes
CREATE OR REPLACE FUNCTION public.recompute_profile_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = GREATEST(1, FLOOR(COALESCE(NEW.xp, 0) / 100) + 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger before update/insert on profiles
DROP TRIGGER IF EXISTS trigger_recompute_profile_level ON public.profiles;
CREATE TRIGGER trigger_recompute_profile_level
  BEFORE INSERT OR UPDATE OF xp ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.recompute_profile_level();

COMMIT;
