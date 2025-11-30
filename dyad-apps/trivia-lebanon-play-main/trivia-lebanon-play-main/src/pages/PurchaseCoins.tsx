import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Coins,
  CreditCard,
  Wallet as WalletIcon,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { COIN_PACKAGES } from "@/data/coinPackages";
import { CoinPackage } from "@/types/purchase";
import { useAddCredit } from "@/hooks/use-wallet";

type PurchaseInsert = {
  user_id: string;
  package_id: string | number;
  coins_purchased: number;
  coins_spent: number; // Add this field, set to 0 for purchases
  amount_paid: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  status: string;
  service_name: string;
  service_type: string;
};

const PurchaseCoins = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
    null
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("whish");
  const [paymentReference, setPaymentReference] = useState("");
  const [processing, setProcessing] = useState(false);
  const addCredit = useAddCredit();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentDialog(true);
  };

  const handlePurchase = async () => {
    if (!userId || !selectedPackage) {
      toast.error("User or package not found");
      return;
    }

    setProcessing(true);
    const totalCoins = selectedPackage.coins + selectedPackage.bonus;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: purchaseError } = await (supabase as any)
        .from('purchases')
        .insert({
          user_id: userId,
          package_id: selectedPackage.id,
          coins_purchased: totalCoins,
          coins_spent: 0,
          amount_paid: selectedPackage.price,
          currency: selectedPackage.currency,
          payment_method: paymentMethod,
          payment_reference: paymentReference || null,
          status: "completed",
          service_name: selectedPackage.name,
          service_type: "coin_purchase",
        } as PurchaseInsert);

      if (purchaseError) throw purchaseError;

      // Update profile coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", userId)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ coins: profile.coins + totalCoins })
          .eq("id", userId);
      }

      // Add to wallet
      addCredit.mutate({
        amount: totalCoins,
        category: "bonus",
        description: `Purchased ${selectedPackage.name} - ${
          selectedPackage.coins
        } coins${
          selectedPackage.bonus > 0 ? ` + ${selectedPackage.bonus} bonus` : ""
        }`,
      });

      toast.success(`🎉 Successfully purchased ${totalCoins} coins!`);
      setShowPaymentDialog(false);
      setPaymentReference("");

      // Navigate to wallet
      setTimeout(() => navigate("/wallet"), 1500);
    } catch (error: unknown) {
      console.error("Purchase error:", error);
      const message =
        error instanceof Error ? error.message : "Please try again";
      toast.error("Purchase failed: " + message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Quizionnaire"
            className="h-8 w-8 object-contain"
          />
          <h1 className="text-lg font-bold text-neon">Purchase Coins</h1>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Get More Coins!</h2>
          </div>
          <p className="text-muted-foreground">
            Choose a package and boost your rewards instantly
          </p>
        </div>

        {/* Coin Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {COIN_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                pkg.popular ? "border-primary border-2 shadow-xl" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  POPULAR
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    {pkg.savings && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {pkg.savings}
                      </Badge>
                    )}
                  </div>
                  <Coins className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">
                      {pkg.coins.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">coins</span>
                  </div>

                  {pkg.bonus > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        +{pkg.bonus} Bonus Coins
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="text-2xl font-bold">
                    {pkg.price.toLocaleString()} {pkg.currency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ≈ {(pkg.price / (pkg.coins + pkg.bonus)).toFixed(0)}{" "}
                    {pkg.currency}/coin
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectPackage(pkg)}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5" />
              Why Buy Coins?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>
                Redeem coins for real rewards (Alfa, MTC, Toters, Shein & more)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Skip the wait and get coins instantly</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Bonus coins on larger packages</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Secure payment processing</span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>
              {selectedPackage && (
                <>
                  You're purchasing <strong>{selectedPackage.name}</strong> for{" "}
                  <strong>
                    {selectedPackage.price.toLocaleString()}{" "}
                    {selectedPackage.currency}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedPackage && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Base Coins:
                  </span>
                  <span className="font-bold">
                    {selectedPackage.coins.toLocaleString()}
                  </span>
                </div>
                {selectedPackage.bonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Bonus:
                    </span>
                    <span className="font-bold text-green-600">
                      +{selectedPackage.bonus.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total Coins:</span>
                  <span className="text-xl font-bold text-primary">
                    {(
                      selectedPackage.coins + selectedPackage.bonus
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whish" id="whish" />
                  <Label htmlFor="whish" className="cursor-pointer">
                    Whish Money (Recommended)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="omt" id="omt" />
                  <Label htmlFor="omt" className="cursor-pointer">
                    OMT
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer">
                    Credit/Debit Card
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Payment Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="Enter transaction ID or reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For tracking purposes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={processing}>
              {processing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseCoins;
