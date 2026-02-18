import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreditStatus {
  balance: number;
  subscription: {
    plan: string;
    plan_name: string;
    expires_at?: string;
    call_credit_per_min: number;
    chat_credit_per_1k_tokens: number;
  };
}

const DEFAULT_STATUS: CreditStatus = {
  balance: 0,
  subscription: {
    plan: 'free',
    plan_name: 'Free',
    call_credit_per_min: 12,
    chat_credit_per_1k_tokens: 1,
  },
};

export const useCredits = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<CreditStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch balance and active subscription in parallel
      const [balanceRes, subRes] = await Promise.all([
        supabase
          .from('credit_balances')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_subscriptions')
          .select('plan_id, expires_at, subscription_plans(name, call_credit_per_min, chat_credit_per_1k_tokens)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle(),
      ]);

      const balance = balanceRes.data?.balance ?? 50;
      const sub = subRes.data;
      const plan = sub ? (sub as any).subscription_plans : null;

      setStatus({
        balance,
        subscription: sub
          ? {
              plan: sub.plan_id,
              plan_name: plan?.name ?? 'Pro',
              expires_at: sub.expires_at ?? undefined,
              call_credit_per_min: plan?.call_credit_per_min ?? 10,
              chat_credit_per_1k_tokens: plan?.chat_credit_per_1k_tokens ?? 0.8,
            }
          : {
              plan: 'free',
              plan_name: 'Free',
              call_credit_per_min: 12,
              chat_credit_per_1k_tokens: 1,
            },
      });
    } catch (e) {
      console.error('Failed to fetch credit status:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const deductCredits = async (amount: number, description: string, consultationId?: string) => {
    if (!user) return false;
    if (status.balance < amount) return false;

    const { error } = await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      amount: -amount,
      transaction_type: 'usage',
      description,
      consultation_id: consultationId,
    });

    if (!error) {
      await supabase
        .from('credit_balances')
        .update({ balance: status.balance - amount })
        .eq('user_id', user.id);

      setStatus(prev => ({ ...prev, balance: prev.balance - amount }));
      return true;
    }
    return false;
  };

  return { ...status, loading, refetch: fetchStatus, deductCredits };
};
