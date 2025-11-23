import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Trophy, Zap, Brain, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const [coins, setCoins] = useState(150);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Quizionnaire" className="h-10 w-10 object-contain" />
          <h1 className="text-xl font-bold text-neon">Quizionnaire</h1>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-primary/30 neon-glow">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">{coins}</span>
        </div>
      </header>

      {/* Hero Section */}
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
            Challenge Yourself
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Play trivia, earn coins, and redeem for real rewards in Lebanon
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Brain className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">1000+</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </Card>
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Trophy className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </Card>
          <Card className="p-4 bg-card/50 border-primary/20 text-center space-y-2">
            <Sparkles className="h-6 w-6 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">Win</p>
            <p className="text-xs text-muted-foreground">Real Prizes</p>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 w-full max-w-md">
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg h-14 neon-glow-strong transition-all duration-300 hover:scale-105"
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Quiz
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/50 hover:bg-primary/10 hover:border-primary text-foreground"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
            <Button 
              variant="outline" 
              size="lg"
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

export default Index;
