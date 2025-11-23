import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Coins, Gift } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useDebitWallet } from "@/hooks/use-wallet";

const REWARDS = [
  { name: "Alfa 5,000 LL", service: "alfa", coins: 100, icon: "📱" },
  { name: "MTC 5,000 LL", service: "mtc", coins: 100, icon: "📱" },
  { name: "Toters 10,000 LL", service: "toters", coins: 200, icon: "🛵" },
  { name: "Shein 20,000 LL", service: "shein", coins: 400, icon: "👕" },
  { name: "Zomato 15,000 LL", service: "zomato", coins: 300, icon: "🍔" },
  { name: "Careem 10,000 LL", service: "careem", coins: 200, icon: "🚗" },
];

const Rewards = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const debitWallet = useDebitWallet();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      fetchCoins(session.user.id);
    });
  }, [navigate]);

  const fetchCoins = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", uid)
      .single();

    if (data) setCoins(data.coins);
  };

  const redeemReward = async (reward: (typeof REWARDS)[0]) => {
    if (!userId || coins < reward.coins) {
      toast.error("Not enough coins!");
      return;
    }

    setRedeeming(reward.service);

    try {
      // Create redemption record
      const { error: redeemError } = await supabase.from("redemptions").insert({
        user_id: userId,
        service_name: reward.name,
        service_type: reward.service,
        coins_spent: reward.coins,
      });

      if (redeemError) throw redeemError;

      // Update user coins
      const newCoins = coins - reward.coins;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ coins: newCoins })
        .eq("id", userId);

      if (updateError) throw updateError;

      setCoins(newCoins);
      toast.success(
        `🎉 ${reward.name} redeemed! Check your email for the code.`
      );

      // Debit from wallet
      debitWallet.mutate({
        amount: reward.coins,
        category: "purchase",
        description: `Redeemed: ${reward.name}`,
      });
    } catch (error) {
      toast.error("Failed to redeem reward");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Quizionnaire"
            className="h-8 w-8 object-contain"
          />
          <h1 className="text-lg font-bold text-neon">Rewards</h1>
        </div>
        <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-primary/30">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">{coins}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-neon">Redeem Your Coins</h2>
            <p className="text-muted-foreground">
              Exchange your hard-earned coins for real rewards in Lebanon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REWARDS.map((reward) => {
              const canAfford = coins >= reward.coins;
              const isRedeeming = redeeming === reward.service;

              return (
                <Card
                  key={reward.service}
                  className={`p-6 border-primary/20 transition-all duration-300 ${
                    canAfford
                      ? "bg-card/50 hover:bg-card/70 hover:border-primary/40"
                      : "bg-card/30 opacity-60"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{reward.icon}</div>
                      <h3 className="font-bold text-foreground">
                        {reward.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-primary font-bold">
                      <Coins className="h-5 w-5" />
                      <span>{reward.coins} coins</span>
                    </div>

                    <Button
                      onClick={() => redeemReward(reward)}
                      disabled={!canAfford || isRedeeming}
                      className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                    >
                      {isRedeeming ? (
                        "Redeeming..."
                      ) : canAfford ? (
                        <>
                          <Gift className="mr-2 h-4 w-4" />
                          Redeem
                        </>
                      ) : (
                        "Not enough coins"
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-1 pt-8">
            <p>💡 Tip: Play more quizzes and watch ads to earn coins faster!</p>
            <p className="text-xs">
              Redemption codes will be sent to your email within 24 hours
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rewards;
