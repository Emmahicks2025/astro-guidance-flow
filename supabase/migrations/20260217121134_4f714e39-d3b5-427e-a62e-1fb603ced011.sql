
-- Table to store per-expert conversation memories/key points for each user
CREATE TABLE public.conversation_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  expert_id TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  total_calls INTEGER NOT NULL DEFAULT 0,
  last_call_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, expert_id)
);

-- Enable RLS
ALTER TABLE public.conversation_memories ENABLE ROW LEVEL SECURITY;

-- Users can read their own memories
CREATE POLICY "Users can view their own memories"
ON public.conversation_memories FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own memories
CREATE POLICY "Users can insert their own memories"
ON public.conversation_memories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own memories
CREATE POLICY "Users can update their own memories"
ON public.conversation_memories FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_conversation_memories_updated_at
BEFORE UPDATE ON public.conversation_memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Also add a column to profiles for pre-analyzed kundli/palm text summaries
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kundli_analysis_text TEXT,
ADD COLUMN IF NOT EXISTS palm_analysis_text TEXT;
