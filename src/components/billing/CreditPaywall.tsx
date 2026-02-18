import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Crown, Plus, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreditPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditsNeeded?: number;
  currentBalance: number;
  context?: "chat" | "call" | "general";
}

export function CreditPaywall({
  open,
  onOpenChange,
  creditsNeeded,
  currentBalance,
  context = "general",
}: CreditPaywallProps) {
  const navigate = useNavigate();

  const contextMessages = {
    chat: "You need credits to chat with an expert.",
    call: "You need credits to call an expert.",
    general: "You need credits to continue.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary to-secondary p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-primary-foreground">
              Insufficient Credits
            </h2>
            <p className="text-sm text-primary-foreground/80 mt-1">
              {contextMessages[context]}
            </p>
          </motion.div>
        </div>

        <div className="p-5 space-y-4">
          {/* Balance Display */}
          <div className="bg-muted rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Your Balance</p>
            <p className="text-3xl font-bold text-foreground">
              <Zap className="w-5 h-5 inline mr-1 text-accent" />
              {currentBalance}
            </p>
            <p className="text-xs text-muted-foreground mt-1">credits remaining</p>
            {creditsNeeded && creditsNeeded > currentBalance && (
              <p className="text-xs text-destructive mt-2">
                You need at least {creditsNeeded - currentBalance} more credits
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <SpiritualButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate("/pricing");
              }}
            >
              <Crown className="w-5 h-5" />
              Upgrade Plan
            </SpiritualButton>

            <SpiritualButton
              variant="golden"
              size="lg"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate("/pricing");
              }}
            >
              <Plus className="w-5 h-5" />
              Buy Credits
            </SpiritualButton>

            <SpiritualButton
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              Maybe Later
            </SpiritualButton>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            AI features (Kundli, Horoscope, Palm Reading) are always free.
            Credits are only needed for expert consultations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
