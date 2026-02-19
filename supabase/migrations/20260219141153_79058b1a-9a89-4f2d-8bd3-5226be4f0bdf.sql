CREATE OR REPLACE FUNCTION public.handle_new_profile_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.credit_balances (user_id, balance, lifetime_earned)
  VALUES (NEW.user_id, 5, 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Also update the default values on the credit_balances table
ALTER TABLE public.credit_balances ALTER COLUMN balance SET DEFAULT 5;
ALTER TABLE public.credit_balances ALTER COLUMN lifetime_earned SET DEFAULT 5;