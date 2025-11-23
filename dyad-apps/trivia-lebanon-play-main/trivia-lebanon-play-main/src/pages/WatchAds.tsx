import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Coins, Tv, Play } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAddCredit } from "@/hooks/use-wallet";

const WatchAds = () => {
  const navigate = useNavigate();
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [coins, setCoins] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const addCredit = useAddCredit();

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

  const watchAd = () => {
    setWatching(true);
    setProgress(0);

    // Simulate ad watching (30 seconds)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          completeAdWatch();
          return 100;
        }
        return prev + 100 / 30; // 30 seconds
      });
    }, 1000);
  };

  const completeAdWatch = async () => {
    if (!userId) return;

    try {
      // Record ad view
      const { error: adError } = await supabase.from("ad_views").insert({
        user_id: userId,
        ad_type: "video",
        coins_earned: 50,
      });

      if (adError) throw adError;

      // Update user coins
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ coins: coins + 50 })
        .eq("id", userId);

      if (updateError) throw updateError;

      setCoins(coins + 50);
      toast.success("🎉 You earned 50 coins!");

      // Add credit to wallet
      addCredit.mutate({
        amount: 50,
        category: "ad_watch",
        description: "Watched video advertisement",
      });

      setWatching(false);
      setProgress(0);
    } catch (error: any) {
      toast.error("Failed to record ad view");
      setWatching(false);
      setProgress(0);
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
          <h1 className="text-lg font-bold text-neon">Watch Ads</h1>
        </div>
        <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-primary/30">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">{coins}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {!watching ? (
          <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
            <Card className="p-8 bg-card/50 border-primary/20 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <Tv className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-neon">
                Earn Coins by Watching Ads
              </h2>
              <p className="text-muted-foreground">
                Watch a short ad to earn 50 coins. Use your coins to play
                quizzes and redeem rewards!
              </p>
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl">
                <Coins className="h-6 w-6" />
                <span>+50 Coins</span>
              </div>
            </Card>

            <Button
              size="lg"
              onClick={watchAd}
              className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg h-14 neon-glow-strong transition-all duration-300 hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Watching
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
            <Card className="p-8 bg-card/50 border-primary/20 text-center space-y-6">
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border border-primary/20">
                <div className="text-center space-y-2">
                  <Tv className="h-16 w-16 mx-auto text-primary animate-pulse" />
                  <p className="text-sm text-muted-foreground">Ad Playing...</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <p className="text-xs text-muted-foreground">
                Please wait until the ad finishes to earn your coins
              </p>
            </Card>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground max-w-md">
          <p>
            💡 Tip: Watch multiple ads to stack up coins for more quiz plays!
          </p>
        </div>
      </main>
    </div>
  );
};

export default WatchAds;
