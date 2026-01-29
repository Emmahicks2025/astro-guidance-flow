-- Change time columns to text to accept flexible user input formats
ALTER TABLE public.profiles 
  ALTER COLUMN time_of_birth TYPE text,
  ALTER COLUMN partner_time_of_birth TYPE text;