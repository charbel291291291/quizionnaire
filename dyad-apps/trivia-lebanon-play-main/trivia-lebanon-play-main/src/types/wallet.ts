export type TransactionType = "credit" | "debit";

export type TransactionCategory =
  | "reward"
  | "quiz_win"
  | "ad_watch"
  | "purchase"
  | "withdrawal"
  | "bonus"
  | "referral";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string | null;
  reference_id: string | null;
  status: TransactionStatus;
  created_at: string;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  reference_id?: string;
}
