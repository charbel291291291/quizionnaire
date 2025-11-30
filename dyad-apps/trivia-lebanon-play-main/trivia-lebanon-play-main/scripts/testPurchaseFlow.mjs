#!/usr/bin/env node

// scripts/testPurchaseFlow.mjs
// Creates a temporary test user and performs a purchase to validate triggers

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env"
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  try {
    const email = `test+${Date.now()}@example.com`;
    const password = "password123";
    console.log("Creating user:", email);

    const { data: user, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) throw createErr;

    const userId = user.id;
    console.log("Created user:", userId);

    // Wait a bit to allow trigger-based profile creation
    await new Promise((r) => setTimeout(r, 1000));

    // Fetch profile
    const { data: profileBefore, error: profileErr } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileErr) throw profileErr;

    console.log("Profile BEFORE purchase:", profileBefore?.coins);

    // Create a purchase for 50 coins
    const purchase = {
      user_id: userId,
      package_id: "test_package_50",
      coins_purchased: 50,
      amount_paid: 5.0,
      currency: "LBP",
      payment_method: "other",
      payment_reference: "test-ref",
      status: "completed",
    };

    const { data: purchaseData, error: purchaseErr } = await admin
      .from("purchases")
      .insert(purchase)
      .select()
      .single();

    if (purchaseErr) throw purchaseErr;
    console.log("Inserted purchase:", purchaseData.id);

    // Wait a bit for triggers
    await new Promise((r) => setTimeout(r, 1000));

    const { data: profileAfter, error: profileAfterErr } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileAfterErr) throw profileAfterErr;

    console.log("Profile AFTER purchase:", profileAfter?.coins);

    // Check transactions
    const { data: txs } = await admin
      .from("transactions")
      .select("*")
      .eq("user_id", userId);
    console.log("Transactions count for user", txs?.length);

    // Cleanup: remove the user and associated rows
    console.log("Cleaning up user and data...");
    await admin.from("purchases").delete().eq("id", purchaseData.id);
    await admin.from("transactions").delete().eq("user_id", userId);
    await admin.from("wallets").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);
    // delete auth user with admin
    await admin.auth.admin.deleteUser(userId);

    console.log("Cleanup completed.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
