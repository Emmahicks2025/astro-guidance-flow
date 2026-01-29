-- Add voice_id column for ElevenLabs voice selection
ALTER TABLE public.jotshi_profiles 
ADD COLUMN voice_id text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.jotshi_profiles.voice_id IS 'ElevenLabs voice ID for voice consultations';