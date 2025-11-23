import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Coins,
  Trophy,
  Zap,
  Brain,
  Sparkles,
  LogOut,
  PlayCircle,
  Tv,
  Wallet,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      } else {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === "PGRST116") {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: userId,
                email: user.email || "",
                username: user.email?.split("@")[0] || "user",
                coins: 100,
              })
              .select()
              .single();

            if (createError) throw createError;
            setProfile(newProfile);
            return;
          }
        }
        throw error;
      }
      setProfile(data);
    } catch (error: any) {
      console.error("Profile error:", error);
      toast.error(
        "Failed to load profile: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <img
            src={logo}
            alt="Loading"
            className="h-16 w-16 mx-auto animate-pulse"
          />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Quizionnaire"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-neon">Quizionnaire</h1>
            <p className="text-xs text-muted-foreground">
              @{profile?.username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-primary/30 neon-glow">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">
              {profile?.coins || 0}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="text-center space-y-4 animate-in fade-in duration-700">
          <div className="relative inline-block">
            <img
              src={logo}
              alt="Quizionnaire Logo"
              className="h-32 w-32 mx-auto object-contain animate-in zoom-in duration-500"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-neon">
            Welcome Back!
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Watch ads to earn coins, play quizzes to multiply your rewards
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Brain className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {profile?.total_quizzes_played || 0}
            </p>
            <p className="text-xs text-muted-foreground">Quizzes</p>
          </Card>
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Trophy className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {profile?.total_correct_answers || 0}
            </p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </Card>
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Sparkles className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {profile?.daily_streak || 0}
            </p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 w-full max-w-md">
          <Button
            size="lg"
            onClick={() => navigate("/quiz")}
            className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg h-14 neon-glow-strong transition-all duration-300 hover:scale-105"
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Quiz
          </Button>

          <Button
            size="lg"
            onClick={() => navigate("/watch-ads")}
            className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-lg h-14 border border-primary/30 transition-all duration-300 hover:scale-105"
          >
            <Tv className="mr-2 h-5 w-5" />
            Watch Ads & Earn Coins
          </Button>

          <Button
            size="lg"
            onClick={() => navigate("/purchase-coins")}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg h-14 border border-amber-400 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buy Coins
          </Button>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/wallet")}
              className="border-primary/50 hover:bg-primary/10 hover:border-primary text-foreground"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/profile")}
              className="border-primary/50 hover:bg-primary/10 hover:border-primary text-foreground"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/rewards")}
              className="border-primary/50 hover:bg-primary/10 hover:border-primary text-foreground"
            >
              <Coins className="mr-2 h-4 w-4" />
              Rewards
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1 pt-8">
          <p>🎁 Redeem coins for Alfa, MTC, Toters, Shein & more</p>
          <p className="text-xs">Play daily to earn bonus coins!</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
