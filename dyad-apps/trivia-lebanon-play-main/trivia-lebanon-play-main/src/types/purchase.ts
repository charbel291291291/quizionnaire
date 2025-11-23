export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  bonus: number;
  popular?: boolean;
  savings?: string;
}

export interface PurchaseInput {
  package_id: string;
  coins_purchased: number;
  amount_paid: number;
  payment_method: string;
  payment_reference?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  package_id: string;
  coins_purchased: number;
  amount_paid: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
}
