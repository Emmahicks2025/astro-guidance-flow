-- Add approval status to jotshi_profiles
ALTER TABLE public.jotshi_profiles
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending'
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approved_at timestamp
ALTER TABLE public.jotshi_profiles
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Update existing providers to be approved
UPDATE public.jotshi_profiles SET approval_status = 'approved' WHERE approval_status = 'pending';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_jotshi_profiles_approval_status ON public.jotshi_profiles(approval_status);