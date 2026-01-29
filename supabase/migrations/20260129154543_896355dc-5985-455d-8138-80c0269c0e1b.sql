-- Create profiles table for users and jotshis
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'jotshi')),
  full_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth TEXT,
  birth_time_exactness TEXT CHECK (birth_time_exactness IN ('exact', 'approximate', 'unknown')),
  major_concern TEXT,
  relationship_status TEXT CHECK (relationship_status IN ('single', 'dating', 'engaged', 'married', 'separated')),
  partner_name TEXT,
  partner_dob DATE,
  partner_time_of_birth TIME,
  partner_place_of_birth TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jotshi_profiles table for astrologer-specific data
CREATE TABLE public.jotshi_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate INTEGER DEFAULT 20,
  total_sessions INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_earnings INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table for chat sessions
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jotshi_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  concern TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  amount_charged INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'mantra', 'remedy', 'pooja')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('recharge', 'spent', 'payout', 'refund')),
  description TEXT,
  consultation_id UUID REFERENCES public.consultations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jotshi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Jotshi profiles policies (public read for finding astrologers)
CREATE POLICY "Anyone can view jotshi profiles" 
  ON public.jotshi_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Jotshis can update their own profile" 
  ON public.jotshi_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Jotshis can insert their own profile" 
  ON public.jotshi_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Consultations policies
CREATE POLICY "Users can view their own consultations" 
  ON public.consultations FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = jotshi_id);

CREATE POLICY "Users can create consultations" 
  ON public.consultations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can update consultations" 
  ON public.consultations FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = jotshi_id);

-- Messages policies
CREATE POLICY "Consultation participants can view messages" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations 
      WHERE id = consultation_id 
      AND (user_id = auth.uid() OR jotshi_id = auth.uid())
    )
  );

CREATE POLICY "Consultation participants can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.consultations 
      WHERE id = consultation_id 
      AND (user_id = auth.uid() OR jotshi_id = auth.uid())
    )
  );

-- Wallet transactions policies
CREATE POLICY "Users can view their own transactions" 
  ON public.wallet_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.wallet_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jotshi_profiles_updated_at
  BEFORE UPDATE ON public.jotshi_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_jotshi_profiles_user_id ON public.jotshi_profiles(user_id);
CREATE INDEX idx_jotshi_profiles_is_online ON public.jotshi_profiles(is_online);
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_consultations_jotshi_id ON public.consultations(jotshi_id);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_messages_consultation_id ON public.messages(consultation_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);