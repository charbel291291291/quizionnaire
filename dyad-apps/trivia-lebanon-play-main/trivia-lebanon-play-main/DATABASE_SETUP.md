# 🚀 Database Setup Guide - Fix "Could not find table 'public.profiles'"

## ⚠️ The Problem

The error `Could not find the table 'public.profiles' in the schema cache` means your Supabase database doesn't have the required tables yet. You need to run the migrations.

## ✅ Solution: Run All Migrations

You have 3 migration files that need to be applied to your Supabase database:

### Migration Files:

1. `20251120173429_ff1f86d3-d0cc-4587-8a7e-2804d24f63e8.sql` - Creates profiles, questions, categories, etc.
2. `20251121054759_d479f1ab-3256-4ca8-ac5e-3e73bac2e07c.sql` - Adds referral system
3. `20251123000000_create_wallet_system.sql` - Creates wallet and transactions tables
4. `20251123000001_create_purchases_system.sql` - Creates purchases table

## 🎯 Step-by-Step Setup

### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase project**: https://supabase.com/dashboard

2. **Open SQL Editor**:

   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration 1** (Profiles & Core Tables):

   - Open: `supabase/migrations/20251120173429_ff1f86d3-d0cc-4587-8a7e-2804d24f63e8.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter
   - ✅ You should see "Success"

4. **Run Migration 2** (Referrals):

   - Open: `supabase/migrations/20251121054759_d479f1ab-3256-4ca8-ac5e-3e73bac2e07c.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run"
   - ✅ You should see "Success"

5. **Run Migration 3** (Wallet System):

   - Open: `supabase/migrations/20251123000000_create_wallet_system.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run"
   - ✅ You should see "Success"

6. **Run Migration 4** (Purchase System):
   - Open: `supabase/migrations/20251123000001_create_purchases_system.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run"
   - ✅ You should see "Success"

### Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```powershell
# Login to Supabase
supabase login

# Link your project (you'll need your project reference ID)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

## ✅ Verify Setup

After running migrations, verify in Supabase Dashboard:

1. Go to **Table Editor**
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `categories`
   - ✅ `questions`
   - ✅ `user_quiz_history`
   - ✅ `ad_views`
   - ✅ `redemptions`
   - ✅ `referrals`
   - ✅ `streak_milestones`
   - ✅ `wallets`
   - ✅ `transactions`
   - ✅ `purchases`

## 🔄 After Running Migrations

1. **Refresh your app**: http://localhost:8080
2. **Sign in** (or create a new account)
3. The "Failed to load profile" error should be GONE ✅
4. Your profile will be auto-created with 100 coins
5. All features should work:
   - ✅ Dashboard loads
   - ✅ Quiz works
   - ✅ Watch Ads works
   - ✅ Wallet shows balance
   - ✅ Purchase Coins works
   - ✅ Rewards work

## 🆕 LTR (Left-to-Right) UI

The UI has been updated to force LTR layout:

- ✅ HTML has `dir="ltr"` attribute
- ✅ Global CSS enforces left-to-right text alignment
- ✅ All text and layouts flow left-to-right

## 🐛 Troubleshooting

### Still seeing "profiles not found"?

- ✅ Make sure you ran ALL 4 migrations
- ✅ Check Supabase Dashboard → Table Editor to confirm tables exist
- ✅ Try refreshing the page (Ctrl+F5)
- ✅ Clear browser cache

### Migrations fail with "already exists"?

- That's OK! It means some tables are already created
- Continue with the next migration

### Check for errors in SQL Editor

- If a migration fails, read the error message
- Usually it's a permission issue or syntax error
- Make sure you're copying the ENTIRE file content

## 📝 Quick Setup Checklist

- [ ] Run migration 1 (profiles, categories, questions)
- [ ] Run migration 2 (referrals)
- [ ] Run migration 3 (wallet system)
- [ ] Run migration 4 (purchase system)
- [ ] Verify tables exist in Supabase
- [ ] Refresh app
- [ ] Sign in
- [ ] Confirm no errors

## 🎉 After Setup

Once all migrations are complete, you can:

- ✅ Play quizzes and earn coins
- ✅ Watch ads for rewards
- ✅ Purchase coin packages
- ✅ View wallet and transactions
- ✅ Redeem rewards
- ✅ Track your profile stats

## 📞 Need Help?

If you still have issues:

1. Check the browser console for errors (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Verify your environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

---

**Remember**: You only need to run migrations ONCE. After that, your database is set up forever! 🚀
