-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.conversation_memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.conversation_memories;
DROP POLICY IF EXISTS "Users can view their own memories" ON public.conversation_memories;

CREATE POLICY "Users can insert their own memories"
ON public.conversation_memories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
ON public.conversation_memories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own memories"
ON public.conversation_memories FOR SELECT
TO authenticated
USING (auth.uid() = user_id);