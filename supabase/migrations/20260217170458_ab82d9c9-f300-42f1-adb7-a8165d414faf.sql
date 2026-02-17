
-- Remove old per-minute chat columns, add token-based pricing
ALTER TABLE public.subscription_plans 
  DROP COLUMN IF EXISTS chat_credit_per_min,
  ADD COLUMN IF NOT EXISTS chat_credit_per_1k_tokens NUMERIC(10,4) NOT NULL DEFAULT 1;

-- Update plans with higher prices
UPDATE public.subscription_plans SET 
  price_usd = 0, monthly_credits = 100, call_credit_per_min = 12, chat_credit_per_1k_tokens = 1,
  features = '["AI Kundli Analysis","Daily Horoscope","Palm Reading","Guna Milan","100 Credits/mo"]'::jsonb
WHERE id = 'free';

UPDATE public.subscription_plans SET 
  price_usd = 9.99, monthly_credits = 1500, call_credit_per_min = 10, chat_credit_per_1k_tokens = 0.8,
  features = '["Everything in Free","Priority Expert Queue","1,500 Credits/mo","Lower Chat Token Rate"]'::jsonb
WHERE id = 'pro';

UPDATE public.subscription_plans SET 
  price_usd = 24.99, monthly_credits = 5000, call_credit_per_min = 8, chat_credit_per_1k_tokens = 0.6,
  features = '["Everything in Pro","5,000 Credits/mo","Lowest Rates","Dedicated Expert Access"]'::jsonb
WHERE id = 'premium';

-- Update top-up packs with higher prices
UPDATE public.topup_packs SET price_usd = 1.99, credits = 200, bonus_credits = 20 WHERE id = 'pack_small';
UPDATE public.topup_packs SET price_usd = 4.99, credits = 600, bonus_credits = 90 WHERE id = 'pack_medium';
UPDATE public.topup_packs SET price_usd = 9.99, credits = 1500, bonus_credits = 300 WHERE id = 'pack_large';
UPDATE public.topup_packs SET price_usd = 19.99, credits = 4000, bonus_credits = 800 WHERE id = 'pack_mega';
