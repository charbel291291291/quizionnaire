-- ============================================
-- COMPLETE DATABASE SETUP - RUN ALL IN ORDER
-- ============================================
-- Copy each section and run in Supabase SQL Editor
-- Run them one at a time in this order!

-- ============================================
-- STEP 1: Core Tables (Profiles, Questions, etc.)
-- ============================================
-- File: 20251120173429_ff1f86d3-d0cc-4587-8a7e-2804d24f63e8.sql
-- Run this first!

-- Instructions:
-- 1. Open supabase/migrations/20251120173429_ff1f86d3-d0cc-4587-8a7e-2804d24f63e8.sql
-- 2. Copy ENTIRE file content
-- 3. Paste in Supabase SQL Editor
-- 4. Click RUN
-- 5. Wait for success message

-- ============================================
-- STEP 2: Referral System
-- ============================================
-- File: 20251121054759_d479f1ab-3256-4ca8-ac5e-3e73bac2e07c.sql
-- Run this second!

-- Instructions:
-- 1. Open supabase/migrations/20251121054759_d479f1ab-3256-4ca8-ac5e-3e73bac2e07c.sql
-- 2. Copy ENTIRE file content
-- 3. Paste in Supabase SQL Editor
-- 4. Click RUN
-- 5. Wait for success message

-- ============================================
-- STEP 3: Wallet System
-- ============================================
-- File: 20251123000000_create_wallet_system.sql
-- Run this third!

-- Instructions:
-- 1. Open supabase/migrations/20251123000000_create_wallet_system.sql
-- 2. Copy ENTIRE file content
-- 3. Paste in Supabase SQL Editor
-- 4. Click RUN
-- 5. Wait for success message

-- ============================================
-- STEP 4: Purchase System
-- ============================================
-- File: 20251123000001_create_purchases_system.sql
-- Run this last!

-- Instructions:
-- 1. Open supabase/migrations/20251123000001_create_purchases_system.sql
-- 2. Copy ENTIRE file content
-- 3. Paste in Supabase SQL Editor
-- 4. Click RUN
-- 5. Wait for success message

-- ============================================
-- ✅ VERIFICATION
-- ============================================
-- After running all migrations, run this query to verify:

SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- You should see these tables:
-- - ad_views
-- - categories
-- - profiles
-- - purchases
-- - questions
-- - redemptions
-- - referrals
-- - streak_milestones
-- - transactions
-- - user_quiz_history
-- - wallets

-- If you see all 11 tables, you're done! ✅
-- Refresh your app and the "profiles not found" error will be gone!
