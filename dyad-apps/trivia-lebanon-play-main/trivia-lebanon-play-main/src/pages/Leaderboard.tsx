import React from "react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, error, isLoading, refetch } = useLeaderboard(50);

  React.useEffect(() => {
    if (error) {
      // The error returned by Supabase will include message about missing table or RLS
      toast.error(error.message || "Failed to load leaderboard");
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="ml-auto">
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
      </header>

      <div className="grid gap-4 max-w-3xl mx-auto">
        {isLoading ? (
          <Card className="p-6 text-center">Loading leaderboard...</Card>
        ) : error ? (
          <Card className="p-6 text-center">
            <p>Error loading leaderboard</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="grid grid-cols-[auto_1fr_auto] gap-3">
              <div className="font-bold">Rank</div>
              <div className="font-bold">Player</div>
              <div className="font-bold text-right">Score</div>
            </div>

            <div className="divide-y mt-3">
              {(data || []).map((row, idx) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center py-3"
                >
                  <div className="font-semibold text-primary">#{idx + 1}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {row.username ?? row.user_id}
                    </div>
                  </div>
                  <div className="text-right font-medium">{row.score ?? 0}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
