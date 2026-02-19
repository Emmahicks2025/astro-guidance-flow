import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, DollarSign, TrendingUp, Clock, Wallet,
  MessageCircle, Star, ArrowDownRight, Info,
  Ticket, Send, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EarningsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ticket form state
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [ticketNotes, setTicketNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: prof }, { data: txns }, { data: tix }] = await Promise.all([
        supabase.from("jotshi_profiles").select("total_earnings, total_sessions, rating, hourly_rate, display_name").eq("user_id", user.id).limit(1),
        supabase.from("consultations").select("id, amount_charged, duration_minutes, status, created_at, concern, ended_at").eq("jotshi_id", user.id).eq("status", "completed").order("created_at", { ascending: false }).limit(50),
        supabase.from("support_tickets").select("*").eq("user_id", user.id).eq("ticket_type", "payout").order("created_at", { ascending: false }).limit(20),
      ]);
      setProfile(prof?.[0] || null);
      setTransactions(txns || []);
      setTickets(tix || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const totalEarnings = profile?.total_earnings || 0;
  const pendingPayout = totalEarnings;
  const canWithdraw = totalEarnings >= 100;
  const hasOpenTicket = tickets.some(t => t.status === "open" || t.status === "in_review");

  const handleSubmitTicket = async () => {
    if (!user || !paymentMethod || !paymentDetails.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        ticket_type: "payout",
        subject: `Payout Request - $${pendingPayout}`,
        description: ticketNotes.trim() || null,
        amount_requested: pendingPayout,
        payment_method: paymentMethod,
        payment_details: paymentDetails.trim(),
      });
      if (error) throw error;
      toast.success("Payout ticket submitted successfully!");
      setShowTicketForm(false);
      setPaymentMethod("");
      setPaymentDetails("");
      setTicketNotes("");
      // Refresh tickets
      const { data: tix } = await supabase.from("support_tickets").select("*").eq("user_id", user.id).eq("ticket_type", "payout").order("created_at", { ascending: false }).limit(20);
      setTickets(tix || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-accent/10 text-accent border-accent/30";
      case "in_review": return "bg-primary/10 text-primary border-primary/30";
      case "completed": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
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
                <p className="text-xs text-muted-foreground">Open a ticket to withdraw your earnings</p>
              </div>
            </div>

            {/* How it works */}
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
                      <span>Open a <strong className="text-foreground">payout ticket</strong> below with your payment details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Our team reviews and processes within <strong className="text-foreground">5-7 business days</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>You'll be notified once the payout is completed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Balance & eligibility */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">Your Balance</p>
                <p className="text-xl font-bold">${pendingPayout}</p>
              </div>
              {canWithdraw ? (
                <Badge className="bg-accent/10 text-accent border-accent/30">
                  Eligible for payout
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  ${100 - pendingPayout} more to withdraw
                </Badge>
              )}
            </div>

            {/* Ticket Form Toggle */}
            <AnimatePresence mode="wait">
              {!showTicketForm ? (
                <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SpiritualButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={hasOpenTicket}
                    onClick={() => setShowTicketForm(true)}
                  >
                    <Ticket className="w-4 h-4" />
                    {hasOpenTicket
                      ? "Payout ticket already open"
                      : "Open Payout Ticket"}
                  </SpiritualButton>
                  {!canWithdraw && !hasOpenTicket && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Note: Minimum withdrawal is $100. You can still open a ticket — it will be processed once your balance qualifies.
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t border-border pt-4"
                >
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" /> New Payout Ticket
                  </h4>

                  <div className="space-y-2">
                    <Label>Withdrawal Amount</Label>
                    <div className="p-3 rounded-lg bg-muted/50 font-bold text-lg">${pendingPayout}</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="wise">Wise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDetails">Payment Details *</Label>
                    <Textarea
                      id="paymentDetails"
                      value={paymentDetails}
                      onChange={(e) => setPaymentDetails(e.target.value)}
                      placeholder={
                        paymentMethod === "bank_transfer"
                          ? "Bank name, account number, IFSC/routing number..."
                          : paymentMethod === "paypal"
                            ? "Your PayPal email address..."
                            : paymentMethod === "upi"
                              ? "Your UPI ID (e.g. name@upi)..."
                              : "Enter your payment account details..."
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketNotes">Additional Notes (optional)</Label>
                    <Textarea
                      id="ticketNotes"
                      value={ticketNotes}
                      onChange={(e) => setTicketNotes(e.target.value)}
                      placeholder="Any additional information..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <SpiritualButton
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      disabled={submitting || !paymentMethod || !paymentDetails.trim()}
                      onClick={handleSubmitTicket}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </SpiritualButton>
                    <SpiritualButton
                      variant="outline"
                      size="lg"
                      onClick={() => setShowTicketForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </SpiritualButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SpiritualCard>
        </motion.div>

        {/* Payout Tickets History */}
        {tickets.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4" /> Payout Tickets
            </h3>
            {tickets.map((ticket) => (
              <SpiritualCard key={ticket.id} variant="elevated" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {ticket.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : ticket.status === "rejected" ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <Clock className="w-4 h-4 text-accent" />
                    )}
                    <span className="text-sm font-medium">${ticket.amount_requested}</span>
                  </div>
                  <Badge className={`text-xs capitalize ${statusColor(ticket.status)}`}>
                    {ticket.status === "in_review" ? "In Review" : ticket.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Method: <span className="text-foreground capitalize">{ticket.payment_method?.replace("_", " ")}</span></p>
                  <p>Submitted: {new Date(ticket.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
                  {ticket.admin_notes && (
                    <p className="text-primary mt-1">Admin: {ticket.admin_notes}</p>
                  )}
                </div>
              </SpiritualCard>
            ))}
          </motion.div>
        )}

        {/* Recent Sessions */}
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
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{txn.concern || "Consultation"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        {txn.duration_minutes ? ` • ${txn.duration_minutes} min` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-accent">
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
