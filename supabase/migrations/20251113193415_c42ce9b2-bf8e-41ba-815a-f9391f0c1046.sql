-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tree progress table for the tree growing game
CREATE TABLE public.tree_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tree_level INTEGER DEFAULT 1 NOT NULL,
  water_count INTEGER DEFAULT 0 NOT NULL,
  last_watered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.tree_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tree"
  ON public.tree_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tree"
  ON public.tree_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tree"
  ON public.tree_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Quiz scores table
CREATE TABLE public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scores"
  ON public.quiz_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores"
  ON public.quiz_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trivia questions table
CREATE TABLE public.trivia_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  category TEXT DEFAULT 'environment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trivia questions"
  ON public.trivia_questions FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample trivia questions
INSERT INTO public.trivia_questions (question, options, correct_answer, category) VALUES
('What percentage of the Earth''s surface is covered by water?', '["50%", "61%", "71%", "81%"]', '71%', 'environment'),
('Which gas is most responsible for global warming?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Carbon Dioxide', 'climate'),
('How many years does it take for a plastic bottle to decompose?', '["50 years", "100 years", "450 years", "1000 years"]', '450 years', 'waste'),
('What is the most renewable source of energy?', '["Coal", "Solar", "Natural Gas", "Oil"]', 'Solar', 'energy'),
('Which country produces the most renewable energy?', '["USA", "China", "Germany", "India"]', 'China', 'energy'),
('What percentage of waste can be recycled?', '["25%", "50%", "75%", "90%"]', '75%', 'waste'),
('How many trees does it take to produce oxygen for one person per year?', '["1 tree", "2 trees", "5 trees", "10 trees"]', '2 trees', 'nature'),
('What is the primary cause of deforestation?', '["Agriculture", "Urbanization", "Mining", "Tourism"]', 'Agriculture', 'nature');

-- News articles table
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news articles"
  ON public.news_articles FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample news articles
INSERT INTO public.news_articles (title, content, source, published_at) VALUES
('Global Renewable Energy Capacity Reaches New Record', 'Renewable energy capacity worldwide grew by 10% this year, marking the fastest growth rate in two decades. Solar and wind power led the expansion.', 'Environmental News Network', NOW() - INTERVAL '1 day'),
('New Study Shows Ocean Cleanup Technology Working', 'Scientists report that new ocean cleanup systems have successfully removed over 100,000 kg of plastic from the Pacific Ocean in the past year.', 'Marine Conservation Today', NOW() - INTERVAL '2 days'),
('Cities Worldwide Adopt Zero-Waste Policies', 'More than 50 cities globally have committed to zero-waste policies by 2030, implementing comprehensive recycling and composting programs.', 'Urban Sustainability Journal', NOW() - INTERVAL '3 days');

-- Volunteering opportunities table
CREATE TABLE public.volunteering_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  opportunity_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.volunteering_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view volunteering opportunities"
  ON public.volunteering_opportunities FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample volunteering opportunities
INSERT INTO public.volunteering_opportunities (title, description, organization, location, contact_email, website_url, opportunity_type) VALUES
('Beach Cleanup Drive', 'Join us for a monthly beach cleanup to remove plastic and debris from our coastlines. All equipment provided.', 'Ocean Guardians', 'Various Coastal Areas', 'volunteer@oceanguardians.org', 'https://oceanguardians.org', 'cleanup'),
('Tree Planting Initiative', 'Help us plant 10,000 trees this year! We provide training, tools, and refreshments for all volunteers.', 'Green Earth Foundation', 'City Parks', 'contact@greenearth.org', 'https://greenearth.org', 'planting'),
('Community Garden Project', 'Join our urban farming initiative to grow organic produce and teach sustainable agriculture to local communities.', 'Urban Harvest', 'Downtown Community Center', 'info@urbanharvest.org', 'https://urbanharvest.org', 'education');

-- Climate data table for visualization
CREATE TABLE public.climate_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.climate_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view climate data"
  ON public.climate_data FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample climate data for the past week
INSERT INTO public.climate_data (data_type, value, unit, recorded_at) VALUES
('co2_emissions', 415.2, 'ppm', NOW() - INTERVAL '7 days'),
('co2_emissions', 415.5, 'ppm', NOW() - INTERVAL '6 days'),
('co2_emissions', 415.8, 'ppm', NOW() - INTERVAL '5 days'),
('co2_emissions', 416.1, 'ppm', NOW() - INTERVAL '4 days'),
('co2_emissions', 416.3, 'ppm', NOW() - INTERVAL '3 days'),
('co2_emissions', 416.6, 'ppm', NOW() - INTERVAL '2 days'),
('co2_emissions', 416.9, 'ppm', NOW() - INTERVAL '1 day'),
('temperature', 15.2, '°C', NOW() - INTERVAL '7 days'),
('temperature', 15.4, '°C', NOW() - INTERVAL '6 days'),
('temperature', 15.6, '°C', NOW() - INTERVAL '5 days'),
('temperature', 15.8, '°C', NOW() - INTERVAL '4 days'),
('temperature', 16.0, '°C', NOW() - INTERVAL '3 days'),
('temperature', 16.2, '°C', NOW() - INTERVAL '2 days'),
('temperature', 16.4, '°C', NOW() - INTERVAL '1 day');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();