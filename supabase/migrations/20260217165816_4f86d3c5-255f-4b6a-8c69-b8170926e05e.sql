
-- Subscription plans reference table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  apple_product_id TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  monthly_credits INTEGER NOT NULL DEFAULT 0,
  chat_credit_per_min INTEGER NOT NULL DEFAULT 2,
  call_credit_per_min INTEGER NOT NULL DEFAULT 8,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the 3 tiers
INSERT INTO public.subscription_plans (id, name, apple_product_id, price_usd, monthly_credits, chat_credit_per_min, call_credit_per_min, features) VALUES
  ('free', 'Free', 'com.astro.free', 0, 50, 2, 8, '["AI Kundli Analysis","Daily Horoscope","Palm Reading","Guna Milan"]'::jsonb),
  ('pro', 'Pro', 'com.astro.pro.monthly', 4.99, 500, 2, 8, '["Everything in Free","Priority Expert Queue","500 Credits/mo"]'::jsonb),
  ('premium', 'Premium', 'com.astro.premium.monthly', 12.99, 2000, 2, 8, '["Everything in Pro","2000 Credits/mo","Dedicated Expert Access"]'::jsonb);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  apple_transaction_id TEXT,
  apple_original_transaction_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Credit balances
CREATE TABLE public.credit_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 50,
  lifetime_earned INTEGER NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance"
  ON public.credit_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance"
  ON public.credit_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance"
  ON public.credit_balances FOR UPDATE
  USING (auth.uid() = user_id);

-- Top-up packs reference
CREATE TABLE public.topup_packs (
  id TEXT PRIMARY KEY,
  apple_product_id TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed top-up packs
INSERT INTO public.topup_packs (id, apple_product_id, price_usd, credits, bonus_credits) VALUES
  ('pack_small', 'com.astro.credits.100', 0.99, 100, 10),
  ('pack_medium', 'com.astro.credits.500', 3.99, 500, 75),
  ('pack_large', 'com.astro.credits.1000', 6.99, 1000, 200),
  ('pack_mega', 'com.astro.credits.2000', 9.99, 2000, 400);

-- Allow public read on plans & packs (no auth needed to browse pricing)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plans" ON public.subscription_plans FOR SELECT USING (true);

ALTER TABLE public.topup_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view packs" ON public.topup_packs FOR SELECT USING (true);

-- Credit transaction log (extend existing wallet_transactions purpose)
-- Add plan_id reference to wallet_transactions
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS apple_transaction_id TEXT;

-- Trigger to auto-create credit balance on new profile
CREATE OR REPLACE FUNCTION public.handle_new_profile_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credit_balances (user_id, balance, lifetime_earned)
  VALUES (NEW.user_id, 50, 50)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

CREATE TRIGGER on_profile_created_add_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_credits();

-- Auto-update updated_at
CREATE TRIGGER update_credit_balances_updated_at
  BEFORE UPDATE ON public.credit_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
