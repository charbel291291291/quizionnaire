# ⚠️ IMPORTANT: Fix "Could not find table 'public.profiles'" Error

## 🔴 Current Issue

You're seeing this error:

```
Failed to load profile: Could not find the table 'public.profiles' in the schema cache
```

**This means your Supabase database is empty!** You need to run the migrations.

---

## 🎯 Quick Fix (5 Minutes)

### Step 1: Open Supabase Dashboard

Go to: https://supabase.com/dashboard → Your Project → SQL Editor

### Step 2: Run Migrations (One by One)

Open each file in order and copy/paste the ENTIRE content into SQL Editor, then click RUN:

#### 📄 Migration 1: Core Tables

**File:** `supabase/migrations/20251120173429_ff1f86d3-d0cc-4587-8a7e-2804d24f63e8.sql`

- Creates: profiles, categories, questions, quiz history, ad views, redemptions
- This is THE MOST IMPORTANT one that fixes the error

#### 📄 Migration 2: Referrals

**File:** `supabase/migrations/20251121054759_d479f1ab-3256-4ca8-ac5e-3e73bac2e07c.sql`

- Adds referral system

#### 📄 Migration 3: Wallet

**File:** `supabase/migrations/20251123000000_create_wallet_system.sql`

- Creates wallet and transaction tables

#### 📄 Migration 4: Purchases

**File:** `supabase/migrations/20251123000001_create_purchases_system.sql`

- Creates purchases table for coin buying

### Step 3: Verify

Go to Supabase Dashboard → Table Editor

You should see 11 tables:

- ✅ profiles
- ✅ categories
- ✅ questions
- ✅ user_quiz_history
- ✅ ad_views
- ✅ redemptions
- ✅ referrals
- ✅ streak_milestones
- ✅ wallets
- ✅ transactions
- ✅ purchases

### Step 4: Refresh Your App

- Go to http://localhost:8080
- Press Ctrl+F5 to hard refresh
- Sign in
- ✅ The error should be GONE!

---

## ✅ What Was Fixed

1. **Database Setup**: Instructions to create all required tables
2. **LTR UI**: Interface now forced to Left-to-Right layout
   - HTML has `dir="ltr"`
   - Global CSS enforces LTR text flow
   - All layouts are left-aligned

---

## 📚 Detailed Guides

- **DATABASE_SETUP.md** - Full step-by-step database setup
- **supabase/SETUP_ORDER.sql** - Migration order reference
- **WALLET_SYSTEM.md** - Wallet features documentation
- **PURCHASE_SYSTEM.md** - Coin purchase features documentation

---

## 🚨 Common Issues

### "Table already exists" error?

- **That's OK!** It means the table is already created
- Continue with the next migration

### Still seeing the error after migrations?

1. Check if tables exist in Supabase Table Editor
2. Hard refresh browser (Ctrl+F5)
3. Clear browser cache
4. Check `.env` file has correct Supabase credentials

### Auth issues?

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🎉 After Setup Works

Once migrations are done, your app will have:

- ✅ User profiles with auto-creation
- ✅ Quiz system with coins
- ✅ Ad watching rewards
- ✅ Full wallet system
- ✅ Coin purchase system
- ✅ Reward redemption
- ✅ Referral system
- ✅ Transaction history
- ✅ LTR interface

---

## 📞 Still Need Help?

1. Read **DATABASE_SETUP.md** for detailed instructions
2. Check browser console (F12) for specific errors
3. Check Supabase Dashboard → Logs for database errors
4. Make sure dev server is running: `npm run dev`

**Remember:** You only run migrations ONCE. After that, your database is permanently set up! 🚀
