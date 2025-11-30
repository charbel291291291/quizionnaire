-- Clean migration: Seed ~520 questions into public.questions using generate_series
-- Creates 65 questions per category; adjust value if you need more/less.
BEGIN;
WITH cats AS (
  SELECT id, name FROM public.categories
), gen AS (
  SELECT c.id AS category_id, c.name AS category_name, gs AS seq
  FROM cats c CROSS JOIN generate_series(1, 65) gs
)
INSERT INTO public.questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, coins_reward)
SELECT
  category_id,
  category_name || ' Q' || seq || ' (Auto) ' || ROW_NUMBER() OVER (ORDER BY category_id, seq) AS question_text,
  'Option A'::text,
  'Option B'::text,
  'Option C'::text,
  'Option D'::text,
  (array['A','B','C','D'])[ ((seq - 1) % 4) + 1 ],
  (array['easy','medium','hard'])[ ((seq - 1) % 3) + 1 ],
  (10 + ((seq - 1) % 21))
FROM gen;
COMMIT;
