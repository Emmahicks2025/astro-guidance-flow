import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowLeft, Plus, CreditCard, History, Gift, ChevronRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { toast } from "sonner";
import { useTranslation } from "@/stores/languageStore";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const WalletPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { balance, subscription, loading } = useCredits();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchTx = async () => {
      const { data } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setTransactions(data);
    };
    fetchTx();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">{t.myWallet}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        {/* Balance Card */}
        <SpiritualCard variant="golden" className="p-6 text-center">
          <p className="text-sm opacity-70 mb-1">{t.availableBalance}</p>
          <p className="text-4xl font-bold">{loading ? "..." : balance} credits</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Crown className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium">{subscription.plan_name} Plan</span>
          </div>
        </SpiritualCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <SpiritualButton
            variant="primary"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/pricing')}
          >
            <Crown className="w-5 h-5" />
            <span className="text-sm">Upgrade Plan</span>
          </SpiritualButton>
          <SpiritualButton
            variant="golden"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/pricing')}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">Top Up Credits</span>
          </SpiritualButton>
        </div>


        {/* Transaction History */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <History className="w-5 h-5 text-secondary" />
            {t.recentTransactions}
          </h3>
          <SpiritualCard variant="elevated" className="overflow-hidden">
            <div className="divide-y divide-border">
              {transactions.length === 0 && (
                <p className="p-4 text-center text-muted-foreground text-sm">No transactions yet</p>
              )}
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-green-500/10' : 'bg-primary/10'
                    }`}>
                      {tx.amount > 0 ? (
                        <Plus className="w-5 h-5 text-green-500" />
                      ) : (
                        <Wallet className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </SpiritualCard>
        </section>
      </main>
    </motion.div>
  );
};

export default WalletPage;
