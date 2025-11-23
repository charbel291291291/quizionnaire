import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Trophy, Brain, Sparkles, Gift, Check, X } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [streakMilestones, setStreakMilestones] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setTimeout(() => {
          fetchAllData(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchAllData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAllData = async (userId: string) => {
    try {
      const [profileRes, historyRes, redemptionsRes, referralsRes, milestonesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("user_quiz_history").select("*, questions(question_text)").eq("user_id", userId).order("played_at", { ascending: false }).limit(20),
        supabase.from("redemptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("referrals").select("*, profiles!referrals_referred_id_fkey(username, email)").eq("referrer_id", userId),
        supabase.from("streak_milestones").select("*").eq("user_id", userId).order("achieved_at", { ascending: false })
      ]);

      if (profileRes.error) throw profileRes.error;
      setProfile(profileRes.data);
      setUsername(profileRes.data.username || "");
      setQuizHistory(historyRes.data || []);
      setRedemptions(redemptionsRes.data || []);
      setReferrals(referralsRes.data || []);
      setStreakMilestones(milestonesRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
      setProfile({ ...profile, username });
    } catch (error: any) {
      toast.error("Failed to update profile");
    }
  };

  const copyReferralCode = () => {
    if (!profile?.referral_code) return;
    const referralUrl = `${window.location.origin}/auth?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-border/50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-neon">Profile</h1>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Brain className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">{profile?.total_quizzes_played || 0}</p>
            <p className="text-xs text-muted-foreground">Quizzes Played</p>
          </Card>
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Trophy className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">{profile?.total_correct_answers || 0}</p>
            <p className="text-xs text-muted-foreground">Correct Answers</p>
          </Card>
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Sparkles className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">{profile?.daily_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Gift className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </Card>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">Quiz History</TabsTrigger>
            <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6 bg-card/50 border-primary/20 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ""} disabled className="mt-2" />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-2"
                />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Update Profile
              </Button>
            </Card>

            <Card className="p-6 bg-card/50 border-primary/20 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Your Referral Code</h3>
              <div className="flex gap-2">
                <Input value={profile?.referral_code || ""} disabled className="flex-1" />
                <Button onClick={copyReferralCode} variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share your referral link and earn 100 bonus coins when a friend signs up and completes their first quiz!
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {quizHistory.length === 0 ? (
              <Card className="p-6 bg-card/50 border-primary/20 text-center">
                <p className="text-muted-foreground">No quiz history yet</p>
              </Card>
            ) : (
              quizHistory.map((entry) => (
                <Card key={entry.id} className="p-4 bg-card/50 border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {entry.questions?.question_text || "Question"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.played_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.is_correct ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm font-bold text-primary">+{entry.coins_earned}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-4">
            {redemptions.length === 0 ? (
              <Card className="p-6 bg-card/50 border-primary/20 text-center">
                <p className="text-muted-foreground">No redemptions yet</p>
              </Card>
            ) : (
              redemptions.map((redemption) => (
                <Card key={redemption.id} className="p-4 bg-card/50 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{redemption.service_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {redemption.service_type} • {new Date(redemption.created_at).toLocaleDateString()}
                      </p>
                      {redemption.redemption_code && (
                        <p className="text-xs text-primary mt-1">Code: {redemption.redemption_code}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{redemption.coins_spent} coins</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        redemption.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {redemption.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            {referrals.length === 0 ? (
              <Card className="p-6 bg-card/50 border-primary/20 text-center">
                <p className="text-muted-foreground">No referrals yet. Share your code to earn bonus coins!</p>
              </Card>
            ) : (
              referrals.map((referral) => (
                <Card key={referral.id} className="p-4 bg-card/50 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        @{referral.profiles?.username || "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {referral.coins_awarded ? (
                        <span className="text-sm font-bold text-green-500">+100 coins earned</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending first quiz</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            {streakMilestones.length === 0 ? (
              <Card className="p-6 bg-card/50 border-primary/20 text-center">
                <p className="text-muted-foreground">Keep playing daily to unlock streak milestones!</p>
              </Card>
            ) : (
              streakMilestones.map((milestone) => (
                <Card key={milestone.id} className="p-4 bg-card/50 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{milestone.streak_days} Day Streak</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(milestone.achieved_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">+{milestone.coins_earned} coins</p>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
