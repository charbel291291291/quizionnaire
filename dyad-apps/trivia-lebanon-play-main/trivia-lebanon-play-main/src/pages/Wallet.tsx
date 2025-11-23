import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet, useTransactions } from "@/hooks/use-wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Gift,
  Video,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { Transaction, TransactionCategory } from "@/types/wallet";

const categoryIcons: Record<TransactionCategory, React.ReactNode> = {
  reward: <Gift className="h-4 w-4" />,
  quiz_win: <Trophy className="h-4 w-4" />,
  ad_watch: <Video className="h-4 w-4" />,
  purchase: <ShoppingCart className="h-4 w-4" />,
  withdrawal: <ArrowUpRight className="h-4 w-4" />,
  bonus: <DollarSign className="h-4 w-4" />,
  referral: <Users className="h-4 w-4" />,
};

const categoryLabels: Record<TransactionCategory, string> = {
  reward: "Reward",
  quiz_win: "Quiz Win",
  ad_watch: "Ad Watched",
  purchase: "Purchase",
  withdrawal: "Withdrawal",
  bonus: "Bonus",
  referral: "Referral",
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const isCredit = transaction.type === "credit";

  return (
    <div className="flex items-center justify-between py-3 px-2 hover:bg-accent/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            isCredit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {categoryIcons[transaction.category]}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {categoryLabels[transaction.category]}
          </span>
          {transaction.description && (
            <span className="text-xs text-muted-foreground">
              {transaction.description}
            </span>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(new Date(transaction.created_at), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={`font-bold ${
            isCredit ? "text-green-600" : "text-red-600"
          }`}
        >
          {isCredit ? "+" : "-"}
          {transaction.amount.toFixed(2)} LBP
        </span>
        <Badge
          variant={transaction.status === "completed" ? "default" : "secondary"}
          className="text-xs"
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
};

export default function Wallet() {
  const navigate = useNavigate();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions(50);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const filteredTransactions = transactions?.filter((t) =>
    filter === "all" ? true : t.type === filter
  );

  const stats = {
    totalCredits:
      transactions
        ?.filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0) || 0,
    totalDebits:
      transactions
        ?.filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0) || 0,
    transactionCount: transactions?.length || 0,
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <WalletIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your earnings and transactions
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <CardDescription className="text-primary-foreground/80">
            Current Balance
          </CardDescription>
          <CardTitle className="text-4xl font-bold">
            {walletLoading ? (
              <Skeleton className="h-12 w-48 bg-primary-foreground/20" />
            ) : (
              `${wallet?.balance.toFixed(2) || "0.00"} ${
                wallet?.currency || "LBP"
              }`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => navigate("/purchase-coins")}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Buy More Coins
          </Button>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-green-600" />
              Total Credits
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.totalCredits.toFixed(2)} LBP
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
              Total Debits
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {stats.totalDebits.toFixed(2)} LBP
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-2xl">{stats.transactionCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent transactions and activities
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "credit" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("credit")}
              >
                Credits
              </Button>
              <Button
                variant={filter === "debit" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("debit")}
              >
                Debits
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-1">
                {filteredTransactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <TransactionItem transaction={transaction} />
                    {index < filteredTransactions.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <WalletIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete quizzes and watch ads to earn rewards!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
