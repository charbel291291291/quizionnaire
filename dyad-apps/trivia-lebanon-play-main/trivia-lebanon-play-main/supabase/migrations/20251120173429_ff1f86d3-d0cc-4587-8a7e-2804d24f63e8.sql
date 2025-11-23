-- Create profiles table with coins wallet
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  coins INTEGER NOT NULL DEFAULT 100,
  total_quizzes_played INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policy (read-only for all)
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  coins_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Questions policy (read-only for authenticated users)
CREATE POLICY "Authenticated users can view questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

-- Create user_quiz_history table
CREATE TABLE public.user_quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_quiz_history
ALTER TABLE public.user_quiz_history ENABLE ROW LEVEL SECURITY;

-- Quiz history policies
CREATE POLICY "Users can view own quiz history"
  ON public.user_quiz_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz history"
  ON public.user_quiz_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create ad_views table to track ad watching
CREATE TABLE public.ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL,
  coins_earned INTEGER NOT NULL DEFAULT 50,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ad_views
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- Ad views policies
CREATE POLICY "Users can view own ad history"
  ON public.ad_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad views"
  ON public.ad_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create redemptions table
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  coins_spent INTEGER NOT NULL,
  redemption_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on redemptions
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Redemptions policies
CREATE POLICY "Users can view own redemptions"
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, coins)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    100
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, icon, color) VALUES
  ('Science', 'Flask', 'hsl(210, 100%, 50%)'),
  ('History', 'Scroll', 'hsl(30, 100%, 50%)'),
  ('Sports', 'Trophy', 'hsl(120, 100%, 40%)'),
  ('Movies', 'Film', 'hsl(280, 100%, 50%)'),
  ('Music', 'Music', 'hsl(340, 100%, 50%)'),
  ('Geography', 'Globe', 'hsl(180, 100%, 40%)'),
  ('Technology', 'Cpu', 'hsl(200, 100%, 50%)'),
  ('Pop Culture', 'Sparkles', 'hsl(300, 100%, 50%)');

-- Insert sample questions for Science category
INSERT INTO public.questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, coins_reward)
SELECT 
  id,
  'What is the chemical symbol for gold?',
  'Go',
  'Au',
  'Gd',
  'Ag',
  'B',
  'easy',
  10
FROM public.categories WHERE name = 'Science';

INSERT INTO public.questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, coins_reward)
SELECT 
  id,
  'What is the speed of light in vacuum?',
  '300,000 km/s',
  '150,000 km/s',
  '450,000 km/s',
  '600,000 km/s',
  'A',
  'medium',
  20
FROM public.categories WHERE name = 'Science';

INSERT INTO public.questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, coins_reward)
SELECT 
  id,
  'What planet is known as the Red Planet?',
  'Venus',
  'Jupiter',
  'Mars',
  'Saturn',
  'C',
  'easy',
  10
FROM public.categories WHERE name = 'Science';