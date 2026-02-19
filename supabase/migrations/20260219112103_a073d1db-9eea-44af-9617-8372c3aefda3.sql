
-- Allow users to update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Add last_read_at to consultations for tracking notification read state
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS last_read_at_user timestamptz;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS last_read_at_expert timestamptz;
