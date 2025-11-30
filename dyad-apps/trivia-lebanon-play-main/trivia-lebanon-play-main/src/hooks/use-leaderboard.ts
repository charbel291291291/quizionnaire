import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { supabase } from "@/integrations/supabase/client";

export type LeaderboardItem = {
  id: string;
  user_id?: string;
  username?: string | null;
  score?: number;
  rank?: number;
  created_at?: string;
};

export const useLeaderboard = (limit = 50, realtime = false) => {
  const queryClient = useQueryClient();
  const queryKey = ["leaderboard", limit] as const;
  const query = useQuery<LeaderboardItem[], Error>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboard_global")
        .select("*")
        .limit(limit)
        .order("score", { ascending: false });

      if (error) {
        // Throw so react-query will handle and provide the error
        throw error;
      }

      return (data as unknown as LeaderboardItem[]) || [];
    },
  });

  React.useEffect(() => {
    if (!realtime) return;
    const channel = supabase
      .channel("public:leaderboard_global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard_global" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["leaderboard", limit] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtime, limit, queryClient]);

  return query;
};
