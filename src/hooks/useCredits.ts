import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreditStatus {
  balance: number;
  subscription: {
    plan: string;
    plan_name: string;
    expires_at?: string;
  };
}

export const useCredits = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<CreditStatus>({
    balance: 0,
    subscription: { plan: 'free', plan_name: 'Free' },
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('validate-apple-receipt', {
        body: { action: 'get_status' },
      });

      if (!error && data) {
        setStatus(data);
      }
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
