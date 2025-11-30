Update questions from CSV (safe defaults)

This script helps you update multiple seeded / placeholder questions in the `public.questions` table using either the row `id` or `question_text` as a key.

Prerequisites

- Fill `SUPABASE_SERVICE_ROLE_KEY` and `VITE_SUPABASE_URL` (or `SUPABASE_URL`) in your `.env`.
- Have Node.js installed and dependencies available (the project already has `@supabase/supabase-js`).

CSV format (header row):

- id,question_text,option_a,option_b,option_c,option_d,correct_answer,difficulty,coins_reward
- Use `id` OR `question_text` to target rows. If both are provided, `id` will be used first.
- Only non-empty columns will be applied as updates (empty cells are ignored).

Steps (dry-run by default):

1. Copy `scripts/questions_update_sample.csv` to `scripts/questions_update.csv` and edit rows you want to update.
2. Run a dry-run (print updates but do not apply):

   node -r dotenv/config scripts/updateQuestionsFromCsv.mjs --file=scripts/questions_update.csv

3. Apply changes:

   node -r dotenv/config scripts/updateQuestionsFromCsv.mjs --file=scripts/questions_update.csv --apply

Optional flags:

- `--backup` - Create a CSV backup of the rows to be updated before applying changes. Example:

  node -r dotenv/config scripts/updateQuestionsFromCsv.mjs --file=scripts/questions_update.csv --apply --backup

Safety:

- The script will refuse to process rows that don't include either `id` or `question_text`.
- We recommend running in a staging or dev environment first.
- If you need to update a large number of rows, consider batching smaller CSVs or using the SQL Editor + transaction backups.

If you want, I can also:

- Add a `--batchSize` option to process rows in parallel or groups.
- Add validation of `correct_answer` values to enforce A|B|C|D only.
- Add a test-run summary that shows which rows would be updated without calling the DB.
