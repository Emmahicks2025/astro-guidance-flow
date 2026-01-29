import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowLeft, Plus, CreditCard, History, Gift, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { toast } from "sonner";

const rechargeOptions = [
  { amount: 100, bonus: 0 },
  { amount: 200, bonus: 10 },
  { amount: 500, bonus: 50, popular: true },
  { amount: 1000, bonus: 150 },
];

const transactionHistory = [
  { id: 1, type: 'recharge', amount: 500, date: '2024-01-15', description: 'Wallet Recharge' },
  { id: 2, type: 'spent', amount: -125, date: '2024-01-14', description: 'Chat with Pandit Ramesh' },
  { id: 3, type: 'spent', amount: -80, date: '2024-01-12', description: 'Palm Reading' },
  { id: 4, type: 'recharge', amount: 200, date: '2024-01-10', description: 'Wallet Recharge' },
];

const WalletPage = () => {
  const navigate = useNavigate();
  const [balance] = useState(495);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleRecharge = () => {
    if (!selectedAmount) {
      toast.error("Please select an amount");
      return;
    }
    toast.success(`Recharge of ₹${selectedAmount} initiated!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">My Wallet</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <SpiritualCard variant="golden" className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
          <p className="text-4xl font-bold text-accent">₹{balance}</p>
          <p className="text-sm text-muted-foreground mt-2">
            ≈ {Math.floor(balance / 25)} minutes with top astrologers
          </p>
        </SpiritualCard>

        {/* Recharge Options */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Recharge Wallet
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {rechargeOptions.map((option) => (
              <SpiritualCard
                key={option.amount}
                variant={selectedAmount === option.amount ? "spiritual" : "elevated"}
                interactive
                className={`p-4 text-center relative ${option.popular ? 'ring-2 ring-accent' : ''}`}
                onClick={() => setSelectedAmount(option.amount)}
              >
                {option.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <p className="text-2xl font-bold">₹{option.amount}</p>
                {option.bonus > 0 && (
                  <p className="text-sm text-green-500 flex items-center justify-center gap-1 mt-1">
                    <Gift className="w-4 h-4" />
                    +₹{option.bonus} bonus
                  </p>
                )}
              </SpiritualCard>
            ))}
          </div>
          <SpiritualButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleRecharge}
            disabled={!selectedAmount}
          >
            <CreditCard className="w-5 h-5" />
            Recharge ₹{selectedAmount || 0}
          </SpiritualButton>
        </section>

        {/* Transaction History */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <History className="w-5 h-5 text-secondary" />
            Recent Transactions
          </h3>
          <SpiritualCard variant="elevated" className="overflow-hidden">
            <div className="divide-y divide-border">
              {transactionHistory.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'recharge' ? 'bg-green-500/10' : 'bg-primary/10'
                    }`}>
                      {tx.type === 'recharge' ? (
                        <Plus className={`w-5 h-5 text-green-500`} />
                      ) : (
                        <Wallet className={`w-5 h-5 text-primary`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </SpiritualCard>
          <SpiritualButton variant="ghost" className="w-full">
            View All Transactions
            <ChevronRight className="w-4 h-4" />
          </SpiritualButton>
        </section>
      </main>
    </motion.div>
  );
};

export default WalletPage;
