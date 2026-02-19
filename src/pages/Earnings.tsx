import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, DollarSign, TrendingUp, Clock, Wallet,
  AlertCircle, ExternalLink, MessageCircle, Star,
  ArrowUpRight, ArrowDownRight, Info
} from "lucide-react";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const EarningsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: prof }, { data: txns }] = await Promise.all([
        supabase.from("jotshi_profiles").select("total_earnings, total_sessions, rating, hourly_rate, display_name").eq("user_id", user.id).limit(1),
        supabase.from("consultations").select("id, amount_charged, duration_minutes, status, created_at, concern, ended_at").eq("jotshi_id", user.id).eq("status", "completed").order("created_at", { ascending: false }).limit(50),
      ]);
      setProfile(prof?.[0] || null);
      setTransactions(txns || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const totalEarnings = profile?.total_earnings || 0;
  const pendingPayout = totalEarnings; // simplified: all earnings are pending until withdrawn
  const canWithdraw = totalEarnings >= 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" className="text-secondary-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <span className="font-display font-bold text-xl">Earnings & Payouts</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Earnings Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <SpiritualCard variant="golden" className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold">${totalEarnings}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </SpiritualCard>
          <SpiritualCard variant="mystic" className="p-4 text-center">
            <Wallet className="w-6 h-6 mx-auto mb-1 text-secondary" />
            <p className="text-2xl font-bold">${pendingPayout}</p>
            <p className="text-xs text-muted-foreground">Available Balance</p>
          </SpiritualCard>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <SpiritualCard className="p-3 text-center">
            <p className="text-lg font-bold">{profile?.total_sessions || 0}</p>
            <p className="text-[10px] text-muted-foreground">Sessions</p>
          </SpiritualCard>
          <SpiritualCard className="p-3 text-center">
            <p className="text-lg font-bold flex items-center justify-center gap-1">
              {profile?.rating || '0.0'} <Star className="w-3 h-3 text-accent fill-accent" />
            </p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </SpiritualCard>
          <SpiritualCard className="p-3 text-center">
            <p className="text-lg font-bold">${profile?.hourly_rate || 0}</p>
            <p className="text-[10px] text-muted-foreground">Rate/min</p>
          </SpiritualCard>
        </motion.div>

        {/* Payout Section */}
        <motion.div variants={itemVariants}>
          <SpiritualCard variant="elevated" className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Request Payout</h3>
                <p className="text-xs text-muted-foreground">Get your earnings transferred to your account</p>
              </div>
            </div>

            {/* Minimum Withdrawal Info */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">How Payouts Work</p>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Minimum withdrawal amount is <strong className="text-foreground">$100</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>To request a payout, open a <strong className="text-foreground">support ticket</strong> via email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Payouts are processed within <strong className="text-foreground">5-7 business days</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Include your <strong className="text-foreground">registered email & payment details</strong> (bank/PayPal) in the ticket</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Withdrawal Status */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">Your Balance</p>
                <p className="text-xl font-bold">${pendingPayout}</p>
              </div>
              {canWithdraw ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                  Eligible for payout
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  ${100 - pendingPayout} more to withdraw
                </Badge>
              )}
            </div>

            {/* CTA Button */}
            <SpiritualButton
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canWithdraw}
              onClick={() => {
                window.open("mailto:support@astroguru.app?subject=Payout%20Request%20-%20" + encodeURIComponent(profile?.display_name || 'Expert') + "&body=" + encodeURIComponent(
                  `Hi Team,\n\nI would like to request a payout.\n\nDetails:\n- Name: ${profile?.display_name || ''}\n- Email: ${user?.email || ''}\n- Available Balance: $${pendingPayout}\n- Payment Method: [Please specify: Bank Transfer / PayPal]\n- Payment Details: [Please provide your bank/PayPal details]\n\nThank you!`
                ), "_blank");
              }}
            >
              <ExternalLink className="w-4 h-4" />
              {canWithdraw ? "Open Payout Ticket" : `Minimum $100 required`}
            </SpiritualButton>

            {!canWithdraw && (
              <p className="text-xs text-center text-muted-foreground">
                Complete more sessions to reach the $100 minimum withdrawal threshold.
              </p>
            )}
          </SpiritualCard>
        </motion.div>

        {/* Recent Sessions / Transaction History */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recent Sessions
          </h3>

          {transactions.length === 0 ? (
            <SpiritualCard className="p-8 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No completed sessions yet. Start consulting to earn!</p>
            </SpiritualCard>
          ) : (
            transactions.map((txn) => (
              <SpiritualCard key={txn.id} variant="elevated" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{txn.concern || "Consultation"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        {txn.duration_minutes ? ` • ${txn.duration_minutes} min` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">
                    +${txn.amount_charged || 0}
                  </span>
                </div>
              </SpiritualCard>
            ))
          )}
        </motion.div>
      </main>
    </motion.div>
  );
};

export default EarningsPage;
