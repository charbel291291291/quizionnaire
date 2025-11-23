# Wallet System Documentation

## Overview

The wallet system is a complete transaction management solution for the Trivia Lebanon Play app. It tracks all monetary activities including quiz winnings, ad rewards, and redemptions.

## Database Schema

### Tables

#### `wallets`

- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `balance` (DECIMAL): Current wallet balance
- `currency` (VARCHAR): Currency code (default: 'LBP')
- `created_at` (TIMESTAMP): Wallet creation time
- `updated_at` (TIMESTAMP): Last update time

#### `transactions`

- `id` (UUID): Primary key
- `wallet_id` (UUID): Foreign key to wallets
- `user_id` (UUID): Foreign key to auth.users
- `amount` (DECIMAL): Transaction amount
- `type` (VARCHAR): 'credit' or 'debit'
- `category` (VARCHAR): Transaction category
  - `reward`: General rewards
  - `quiz_win`: Quiz completion rewards
  - `ad_watch`: Ad watching rewards
  - `purchase`: Redemptions/purchases
  - `withdrawal`: Cash withdrawals
  - `bonus`: Bonus rewards
  - `referral`: Referral rewards
- `description` (TEXT): Transaction details
- `reference_id` (UUID): Optional reference to related entity
- `status` (VARCHAR): 'pending', 'completed', 'failed', or 'cancelled'
- `created_at` (TIMESTAMP): Transaction timestamp

## Features

### Automatic Balance Updates

- Triggers automatically update wallet balance when transactions are created
- Credit transactions add to balance
- Debit transactions subtract from balance

### Auto-Wallet Creation

- Wallet is automatically created when a new user signs up
- Initial balance: 0.00 LBP

### Row Level Security

- Users can only view and update their own wallets
- Users can only view their own transactions
- Users can create transactions for their own wallets

## Usage

### Components

#### Wallet Page (`/wallet`)

Displays:

- Current balance with gradient card
- Total credits, debits, and transaction count
- Filterable transaction history
- Transaction details with icons and timestamps

### Custom Hooks

#### `useWallet()`

Fetches the current user's wallet data.

```typescript
const { data: wallet, isLoading } = useWallet();
```

#### `useTransactions(limit?)`

Fetches user's transaction history.

```typescript
const { data: transactions, isLoading } = useTransactions(50);
```

#### `useAddCredit()`

Adds credits to the wallet.

```typescript
const addCredit = useAddCredit();
addCredit.mutate({
  amount: 100,
  category: "quiz_win",
  description: "Completed quiz successfully",
});
```

#### `useDebitWallet()`

Deducts from the wallet.

```typescript
const debitWallet = useDebitWallet();
debitWallet.mutate({
  amount: 50,
  category: "purchase",
  description: "Redeemed Alfa 5,000 LL",
});
```

## Integration Points

### Quiz Page

- Automatically credits wallet when user answers correctly
- Includes streak bonuses in wallet transactions

### Rewards Page

- Debits wallet when user redeems rewards
- Records redemption in transaction history

### Watch Ads Page

- Credits wallet when user completes ad viewing
- Records ad watch in transaction history

## Migration

Run the migration to create the wallet system:

```bash
# Using Supabase CLI
supabase db push

# Or apply the migration file manually
supabase/migrations/20251123000000_create_wallet_system.sql
```

## Type Safety Notes

The wallet hooks use type assertions (`as any`, `as unknown`) because the wallet tables are not yet in the generated Supabase types. After applying the migration:

1. Run type generation:

   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
   ```

2. Remove the type assertions from `src/hooks/use-wallet.ts`

## Navigation

The wallet is accessible from:

- Dashboard: "Wallet" button
- Direct URL: `/wallet`

## Future Enhancements

Potential features to add:

- Withdrawal functionality
- Payment gateway integration
- Transaction export (CSV/PDF)
- Real-time balance updates via subscriptions
- Transaction search and advanced filtering
- Monthly/yearly transaction summaries
- Spending analytics and charts
