import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDebug = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<any>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchCounts();
    });
  }, [navigate]);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const q1 = await supabase
        .from("questions")
        .select("id", { count: "exact" })
        .limit(1);
      const q2 = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .limit(1);
      const q3 = await supabase
        .from("transactions")
        .select("id", { count: "exact" })
        .limit(1);
      const q4 = await supabase
        .from("wallets")
        .select("id", { count: "exact" })
        .limit(1);

      setCounts({
        questions: q1.count || 0,
        profiles: q2.count || 0,
        transactions: q3.count || 0,
        wallets: q4.count || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-neon mb-4">Admin Debug</h1>
      <p className="mb-4">Logged in: {user?.email || "unknown"}</p>

      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        <div className="p-4 bg-card border border-border rounded">
          <h2 className="text-lg font-semibold">Counts</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              <li>Questions: {counts.questions}</li>
              <li>Profiles: {counts.profiles}</li>
              <li>Wallets: {counts.wallets}</li>
              <li>Transactions: {counts.transactions}</li>
            </ul>
          )}
        </div>

        <div className="p-4 bg-card border border-border rounded">
          <h2 className="text-lg font-semibold">Actions</h2>
          <div className="space-y-2">
            <Button onClick={() => fetchCounts()} size="sm">
              Refresh
            </Button>
            <Button onClick={() => navigate("/")} variant="ghost" size="sm">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;
