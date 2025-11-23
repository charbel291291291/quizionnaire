import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Coins, Trophy, X, Check } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAddCredit } from "@/hooks/use-wallet";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  coins_reward: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const addCredit = useAddCredit();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setTimeout(() => {
        fetchProfile(session.user.id);
      }, 0);
      loadQuestion();
    });
  }, [navigate]);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (data) setProfile(data);
  };

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      setQuestion(data);
    } catch (error) {
      toast.error("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!question || !user || answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const isCorrect = answer === question.correct_answer;

    try {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!currentProfile) throw new Error("Profile not found");

      // Calculate streak and bonus coins
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastPlayed = currentProfile.last_played_at
        ? new Date(currentProfile.last_played_at)
        : null;
      lastPlayed?.setHours(0, 0, 0, 0);

      let newStreak = 1;
      let streakBonus = 0;

      if (lastPlayed) {
        const daysDiff = Math.floor(
          (today.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          newStreak = currentProfile.daily_streak;
        } else if (daysDiff === 1) {
          newStreak = currentProfile.daily_streak + 1;

          const milestones = [7, 14, 30, 60, 90];
          if (milestones.includes(newStreak)) {
            streakBonus = newStreak * 10;

            await supabase.from("streak_milestones").insert({
              user_id: user.id,
              streak_days: newStreak,
              coins_earned: streakBonus,
            });

            toast.success(
              `🎉 ${newStreak} Day Streak Milestone! +${streakBonus} bonus coins!`,
              {
                duration: 5000,
              }
            );
          }
        } else {
          newStreak = 1;
          if (currentProfile.daily_streak > 1) {
            toast.error(`Streak broken! Start a new one today.`);
          }
        }
      }

      const coinsEarned = isCorrect ? question.coins_reward : 0;
      const totalCoins = coinsEarned + streakBonus;

      await supabase.from("user_quiz_history").insert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: answer,
        is_correct: isCorrect,
        coins_earned: totalCoins,
      });

      await supabase
        .from("profiles")
        .update({
          coins: currentProfile.coins + totalCoins,
          total_quizzes_played: currentProfile.total_quizzes_played + 1,
          total_correct_answers: isCorrect
            ? currentProfile.total_correct_answers + 1
            : currentProfile.total_correct_answers,
          daily_streak: newStreak,
          last_played_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Check referral bonus
      const { data: referralData } = await supabase
        .from("referrals")
        .select("*")
        .eq("referred_id", user.id)
        .is("completed_first_quiz_at", null)
        .maybeSingle();

      if (referralData && currentProfile.total_quizzes_played === 0) {
        await supabase
          .from("referrals")
          .update({
            completed_first_quiz_at: new Date().toISOString(),
            coins_awarded: true,
          })
          .eq("id", referralData.id);

        const { data: referrerProfile } = await supabase
          .from("profiles")
          .select("coins")
          .eq("id", referralData.referrer_id)
          .single();

        if (referrerProfile) {
          await supabase
            .from("profiles")
            .update({ coins: referrerProfile.coins + 100 })
            .eq("id", referralData.referrer_id);
        }

        toast.success("Your referrer earned 100 bonus coins!");
      }

      if (isCorrect) {
        toast.success(
          `🎉 Correct! +${coinsEarned} coins${
            streakBonus > 0 ? ` +${streakBonus} streak bonus` : ""
          }`
        );

        // Add credit to wallet
        if (totalCoins > 0) {
          addCredit.mutate({
            amount: totalCoins,
            category: "quiz_win",
            description: `Quiz win: ${question.question_text.substring(
              0,
              50
            )}...`,
          });
        }
      } else {
        toast.error("Wrong answer. Try again!");
      }

      setTimeout(() => {
        fetchProfile(user.id);
      }, 0);
    } catch (error) {
      toast.error("Failed to record answer");
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    loadQuestion();
  };

  const getButtonClass = (option: string) => {
    if (!answered) return "bg-card hover:bg-primary/20 border-primary/30";

    if (option === question?.correct_answer) {
      return "bg-green-500/20 border-green-500 text-green-500";
    }

    if (option === selectedAnswer && option !== question?.correct_answer) {
      return "bg-destructive/20 border-destructive text-destructive";
    }

    return "bg-card/50 border-border/30 opacity-50";
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
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-bold text-neon">Quiz Time</h1>
        </div>
        <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-primary/30">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">{profile?.coins || 0}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          {question && (
            <>
              <Card className="p-6 bg-card/50 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-foreground">
                      {question.question_text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-bold">
                        +{question.coins_reward} coins
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["option_a", "option_b", "option_c", "option_d"].map((key) => {
                  const option = question[key as keyof Question] as string;
                  const optionLetter = key.split("_")[1].toUpperCase();
                  const isCorrect = option === question.correct_answer;
                  const isSelected = option === selectedAnswer;

                  return (
                    <Button
                      key={key}
                      onClick={() => handleAnswer(option)}
                      disabled={answered}
                      className={`h-auto p-4 justify-start text-left transition-all duration-300 ${getButtonClass(
                        option
                      )}`}
                      variant="outline"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            answered && isCorrect
                              ? "bg-green-500 text-white"
                              : answered && isSelected && !isCorrect
                              ? "bg-destructive text-white"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {answered && isCorrect && (
                            <Check className="h-4 w-4" />
                          )}
                          {answered && isSelected && !isCorrect && (
                            <X className="h-4 w-4" />
                          )}
                          {!answered && optionLetter}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {answered && (
                <Button
                  onClick={nextQuestion}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold neon-glow-strong"
                >
                  Next Question
                </Button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
