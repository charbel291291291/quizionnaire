import { CoinPackage } from "@/types/purchase";

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    coins: 100,
    price: 5000,
    currency: "LBP",
    bonus: 0,
  },
  {
    id: "basic",
    name: "Basic Pack",
    coins: 500,
    price: 20000,
    currency: "LBP",
    bonus: 50,
    savings: "Save 10%",
  },
  {
    id: "popular",
    name: "Popular Pack",
    coins: 1200,
    price: 45000,
    currency: "LBP",
    bonus: 200,
    popular: true,
    savings: "Save 15%",
  },
  {
    id: "mega",
    name: "Mega Pack",
    coins: 2500,
    price: 85000,
    currency: "LBP",
    bonus: 500,
    savings: "Save 20%",
  },
  {
    id: "ultimate",
    name: "Ultimate Pack",
    coins: 5000,
    price: 150000,
    currency: "LBP",
    bonus: 1500,
    savings: "Save 30%",
  },
];
