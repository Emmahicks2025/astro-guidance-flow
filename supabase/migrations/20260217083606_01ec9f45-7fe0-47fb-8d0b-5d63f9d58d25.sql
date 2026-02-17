
-- Create a secure table for admin-managed API keys
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "Admins can manage API keys"
  ON public.api_keys
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
