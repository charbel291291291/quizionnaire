/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Transaction, CreateTransactionInput } from "@/types/wallet";
import { toast } from "@/hooks/use-toast";

// Fetch user's wallet
export const useWallet = () => {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("wallets" as any)
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as unknown as Wallet;
    },
  });
};

// Fetch wallet transactions
export const useTransactions = (limit: number = 50) => {
  return useQuery({
    queryKey: ["transactions", limit],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as Transaction[];
    },
  });
};

// Create a new transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets" as any)
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (walletError) throw walletError;
      if (!wallet) throw new Error("Wallet not found");

      // Create transaction
      const { data, error } = await supabase
        .from("transactions" as any)
        .insert({
          wallet_id: (wallet as any).id,
          user_id: user.id,
          amount: input.amount,
          type: input.type,
          category: input.category,
          description: input.description || null,
          reference_id: input.reference_id || null,
          status: "completed",
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Transaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      toast({
        title: "Transaction Successful",
        description: `${
          data.type === "credit" ? "+" : "-"
        }${data.amount.toFixed(2)} ${data.category}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Transaction Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
};

// Add credit (reward) to wallet
export const useAddCredit = () => {
  const createTransaction = useCreateTransaction();

  return useMutation({
    mutationFn: async ({
      amount,
      category,
      description,
    }: {
      amount: number;
      category: CreateTransactionInput["category"];
      description?: string;
    }) => {
      return createTransaction.mutateAsync({
        amount,
        type: "credit",
        category,
        description,
      });
    },
  });
};

// Debit (spend) from wallet
export const useDebitWallet = () => {
  const createTransaction = useCreateTransaction();

  return useMutation({
    mutationFn: async ({
      amount,
      category,
      description,
    }: {
      amount: number;
      category: CreateTransactionInput["category"];
      description?: string;
    }) => {
      return createTransaction.mutateAsync({
        amount,
        type: "debit",
        category,
        description,
      });
    },
  });
};
