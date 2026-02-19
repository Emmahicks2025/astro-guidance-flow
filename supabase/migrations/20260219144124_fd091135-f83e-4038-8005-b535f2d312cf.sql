
-- Insert platform config values into api_keys
INSERT INTO public.api_keys (key_name, key_value)
VALUES 
  ('FREE_CREDIT_LIMIT', '5'),
  ('MIN_RATE_PER_MINUTE', '25')
ON CONFLICT DO NOTHING;

-- Update the trigger to read free credit limit from api_keys
CREATE OR REPLACE FUNCTION public.handle_new_profile_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  _credits integer;
BEGIN
  SELECT COALESCE(key_value::integer, 5) INTO _credits
  FROM public.api_keys WHERE key_name = 'FREE_CREDIT_LIMIT';
  
  IF _credits IS NULL THEN _credits := 5; END IF;
  
  INSERT INTO public.credit_balances (user_id, balance, lifetime_earned)
  VALUES (NEW.user_id, _credits, _credits)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;
