import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Crown, Star, Sparkles, Zap, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "sonner";
import { Capacitor, registerPlugin } from "@capacitor/core";

interface IAPPluginInterface {
  purchase(options: { productId: string }): Promise<{ productId: string; transactionId: string; receipt: string }>;
  restorePurchases(): Promise<{ productId: string; transactionId: string; receipt: string }>;
}

const IAPPlugin = registerPlugin<IAPPluginInterface>("IAPPlugin");

interface Plan {
  id: string;
  name: string;
  apple_product_id: string;
  price_usd: number;
  monthly_credits: number;
  chat_credit_per_1k_tokens: number;
  call_credit_per_min: number;
  features: string[];
}

interface TopupPack {
  id: string;
  apple_product_id: string;
  price_usd: number;
  credits: number;
  bonus_credits: number;
}

const planIcons: Record<string, typeof Star> = {
  free: Star,
  pro: Crown,
  premium: Sparkles,
};

const PricingPage = () => {
  const navigate = useNavigate();
  const { subscription, balance } = useCredits();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [packs, setPacks] = useState<TopupPack[]>([]);
  const [activeTab, setActiveTab] = useState<"plans" | "topup">("plans");

  useEffect(() => {
    const fetchData = async () => {
      const [plansRes, packsRes] = await Promise.all([
        supabase.from("subscription_plans").select("*").eq("is_active", true).order("price_usd"),
        supabase.from("topup_packs").select("*").eq("is_active", true).order("price_usd"),
      ]);
      if (plansRes.data) setPlans(plansRes.data as Plan[]);
      if (packsRes.data) setPacks(packsRes.data as TopupPack[]);
    };
    fetchData();
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === "free") return;

    if (Capacitor.isNativePlatform()) {
      try {
        const result = await IAPPlugin.purchase({ productId: plan.apple_product_id });
        // Validate receipt server-side
        const { error } = await supabase.functions.invoke("validate-apple-receipt", {
          body: { action: "validate_subscription", receipt_data: result.receipt, transaction_id: result.transactionId, product_id: result.productId },
        });
        if (error) throw error;
        toast.success(`Subscribed to ${plan.name}!`);
      } catch (err: any) {
        if (err?.message?.includes("cancelled") || err?.message?.includes("Cancel")) return;
        toast.error(err?.message || "Purchase failed. Please try again.");
      }
    } else {
      toast.info(
        `To subscribe to ${plan.name}, open this app on your iPhone and tap Subscribe there.`,
        { duration: 5000 }
      );
    }
  };

  const handleTopup = async (pack: TopupPack) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await IAPPlugin.purchase({ productId: pack.apple_product_id });
        const { error } = await supabase.functions.invoke("validate-apple-receipt", {
          body: { action: "validate_topup", receipt_data: result.receipt, transaction_id: result.transactionId, product_id: result.productId },
        });
        if (error) throw error;
        toast.success(`${pack.credits + pack.bonus_credits} credits added!`);
      } catch (err: any) {
        if (err?.message?.includes("cancelled") || err?.message?.includes("Cancel")) return;
        toast.error(err?.message || "Purchase failed. Please try again.");
      }
    } else {
      toast.info(
        `To purchase ${pack.credits + pack.bonus_credits} credits, open this app on your iPhone.`,
        { duration: 5000 }
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <span className="font-display font-bold text-xl">Plans & Pricing</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        {/* Current Status */}
        <SpiritualCard variant="golden" className="p-4 text-center">
          <p className="text-sm opacity-70">Current Plan</p>
          <p className="text-xl font-bold">{subscription.plan_name}</p>
          <p className="text-sm opacity-70 mt-1">
            <Zap className="w-4 h-4 inline mr-1" />{balance} credits available
          </p>
        </SpiritualCard>


        {/* Tab Switcher */}
        <div className="flex gap-2 bg-muted rounded-xl p-1">
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "plans" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab("topup")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "topup" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
          >
            Top-Up Credits
          </button>
        </div>

        {/* Plans */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            {plans.map((plan, i) => {
              const Icon = planIcons[plan.id] || Star;
              const isCurrent = subscription.plan === plan.id;
              const isPopular = plan.id === "pro";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <SpiritualCard
                    variant={isPopular ? "spiritual" : "elevated"}
                    className={`p-5 relative ${isPopular ? "ring-2 ring-accent" : ""}`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${plan.id === "premium" ? "bg-secondary/10" : plan.id === "pro" ? "bg-accent/10" : "bg-muted"
                          }`}>
                          <Icon className={`w-5 h-5 ${plan.id === "premium" ? "text-secondary" : plan.id === "pro" ? "text-accent" : "text-muted-foreground"
                            }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.monthly_credits} credits/mo</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {plan.price_usd === 0 ? "Free" : `$${plan.price_usd}`}
                        </p>
                        {plan.price_usd > 0 && <p className="text-xs text-muted-foreground">/month</p>}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {(plan.features as string[]).map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>AI Reports & Horoscopes — Always Free</span>
                      </div>
                    </div>

                    <SpiritualButton
                      variant={isCurrent ? "outline" : plan.id === "premium" ? "primary" : "golden"}
                      className="w-full"
                      disabled={isCurrent || plan.id === "free"}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {isCurrent ? "Current Plan" : plan.id === "free" ? "Free Forever" : `Subscribe — $${plan.price_usd}/mo`}
                    </SpiritualButton>
                  </SpiritualCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Top-Up */}
        {activeTab === "topup" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Need more credits? Top up anytime — bonus credits included!
            </p>
            <div className="grid grid-cols-2 gap-3">
              {packs.map((pack, i) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <SpiritualCard
                    variant="elevated"
                    interactive
                    className="p-4 text-center"
                    onClick={() => handleTopup(pack)}
                  >
                    <p className="text-2xl font-bold">{pack.credits}</p>
                    <p className="text-xs text-muted-foreground">credits</p>
                    {pack.bonus_credits > 0 && (
                      <p className="text-sm text-green-500 flex items-center justify-center gap-1 mt-1">
                        <Gift className="w-3 h-3" />
                        +{pack.bonus_credits} bonus
                      </p>
                    )}
                    <div className="mt-3 pt-2 border-t border-border">
                      <p className="font-bold text-primary">${pack.price_usd}</p>
                    </div>
                  </SpiritualCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note — Apple Guideline 3.1.2 compliance */}
        <div className="text-xs text-center text-muted-foreground px-4 space-y-2">
          <p>
            Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. 
            You can manage or cancel subscriptions in your Apple ID Settings. 
            Payment will be charged to your Apple ID account at confirmation of purchase.
          </p>
          <p>
            All AI features (Kundli, Palm Reading, Horoscope, Guna Milan) are always free.
          </p>
          <p>
            <button onClick={() => navigate('/terms')} className="underline text-primary">Terms of Use (EULA)</button>
            {" · "}
            <button onClick={() => navigate('/privacy-policy')} className="underline text-primary">Privacy Policy</button>
          </p>
        </div>
      </main>
    </motion.div>
  );
};

export default PricingPage;
