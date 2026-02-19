-- Allow jotshi (experts) to view profiles of users they have consultations with
CREATE POLICY "Jotshis can view consultation user profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.jotshi_id = auth.uid()
      AND c.user_id = profiles.user_id
  )
);