-- =====================================================
-- ECOGUIDE AI DATABASE SCHEMA
-- Create all necessary tables for the application
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  location VARCHAR(255),
  carbon_goal DECIMAL(10,2) DEFAULT 2000.00,
  household_size INTEGER DEFAULT 1,
  income_bracket VARCHAR(50),
  occupation VARCHAR(255),
  transportation_preference VARCHAR(50) DEFAULT 'mixed',
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CARBON TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS carbon_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  co2_emitted DECIMAL(10,2) NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. AI RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  recommendation_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  potential_savings DECIMAL(10,2),
  difficulty_level VARCHAR(50) DEFAULT 'medium',
  implemented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. SATELLITE DATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS satellite_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  data_type VARCHAR(100) NOT NULL,
  value DECIMAL(15,6),
  unit VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(100) DEFAULT 'sentinel_hub',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. ENVIRONMENTAL GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS environmental_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_type VARCHAR(100) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. COMMUNITY CHALLENGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  challenge_type VARCHAR(100) NOT NULL,
  target_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. USER CHALLENGE PARTICIPATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_challenge_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_value DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);

-- =====================================================
-- 8. RESEARCH INSIGHTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS research_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  source VARCHAR(255),
  publication_date DATE,
  relevance_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Carbon tracking indexes
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_user_id ON carbon_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_date ON carbon_tracking(date);
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_category ON carbon_tracking(category);

-- AI recommendations indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_category ON ai_recommendations(category);

-- Satellite data indexes
CREATE INDEX IF NOT EXISTS idx_satellite_data_location ON satellite_data(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_satellite_data_timestamp ON satellite_data(timestamp);

-- Environmental goals indexes
CREATE INDEX IF NOT EXISTS idx_environmental_goals_user_id ON environmental_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_environmental_goals_status ON environmental_goals(status);

-- Community challenges indexes
CREATE INDEX IF NOT EXISTS idx_community_challenges_status ON community_challenges(status);
CREATE INDEX IF NOT EXISTS idx_community_challenges_dates ON community_challenges(start_date, end_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_participation ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Carbon tracking: users can only see/edit their own entries
CREATE POLICY "Users can view own carbon tracking" ON carbon_tracking
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own carbon tracking" ON carbon_tracking
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own carbon tracking" ON carbon_tracking
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own carbon tracking" ON carbon_tracking
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- AI recommendations: users can only see their own recommendations
CREATE POLICY "Users can view own AI recommendations" ON ai_recommendations
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own AI recommendations" ON ai_recommendations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own AI recommendations" ON ai_recommendations
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Environmental goals: users can only see/edit their own goals
CREATE POLICY "Users can view own environmental goals" ON environmental_goals
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own environmental goals" ON environmental_goals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own environmental goals" ON environmental_goals
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- User challenge participation: users can only see their own participation
CREATE POLICY "Users can view own challenge participation" ON user_challenge_participation
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own challenge participation" ON user_challenge_participation
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own challenge participation" ON user_challenge_participation
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Public tables (no RLS needed)
-- satellite_data, community_challenges, research_insights are public

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carbon_tracking_updated_at BEFORE UPDATE ON carbon_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environmental_goals_updated_at BEFORE UPDATE ON environmental_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_challenges_updated_at BEFORE UPDATE ON community_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_insights_updated_at BEFORE UPDATE ON research_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample user profile for testing
INSERT INTO user_profiles (id, email, full_name, carbon_goal, location, onboarded)
VALUES (
  'demo-user-id',
  'fabian@inuaake.com',
  'Fabian Demo',
  2000.00,
  'Berlin, Germany',
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  carbon_goal = EXCLUDED.carbon_goal,
  location = EXCLUDED.location,
  onboarded = EXCLUDED.onboarded,
  updated_at = NOW();

-- Insert sample carbon tracking entries
INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes)
VALUES 
  ('demo-user-id', 'transportation', 'car_trip', 25.0, 5.25, CURRENT_DATE - 1, 'Commute to work'),
  ('demo-user-id', 'transportation', 'bicycle', 10.0, 0.0, CURRENT_DATE - 2, 'Bike to grocery store'),
  ('demo-user-id', 'energy', 'electricity_kwh', 15.0, 6.8, CURRENT_DATE - 3, 'Home electricity usage'),
  ('demo-user-id', 'food', 'beef_meal', 1.0, 6.61, CURRENT_DATE - 4, 'Dinner'),
  ('demo-user-id', 'waste', 'recycling_kg', 2.0, 0.2, CURRENT_DATE - 5, 'Weekly recycling');

-- Insert sample AI recommendations
INSERT INTO ai_recommendations (user_id, category, recommendation_type, title, description, potential_savings, difficulty_level)
VALUES 
  ('demo-user-id', 'transportation', 'efficiency', 'Switch to Electric Vehicle', 'Consider replacing your car with an electric vehicle for daily commutes', 45.5, 'high'),
  ('demo-user-id', 'energy', 'conservation', 'Install LED Bulbs', 'Replace incandescent bulbs with LED alternatives throughout your home', 12.3, 'low'),
  ('demo-user-id', 'food', 'diet', 'Reduce Meat Consumption', 'Try meatless Mondays and reduce beef consumption by 50%', 18.7, 'medium');

-- Insert sample environmental goals
INSERT INTO environmental_goals (user_id, goal_type, target_value, current_value, unit, deadline)
VALUES 
  ('demo-user-id', 'carbon_reduction', 500.0, 150.0, 'kg CO2', CURRENT_DATE + INTERVAL '6 months'),
  ('demo-user-id', 'renewable_energy', 80.0, 25.0, 'percentage', CURRENT_DATE + INTERVAL '1 year');

-- Insert sample community challenges
INSERT INTO community_challenges (title, description, challenge_type, target_participants, start_date, end_date)
VALUES 
  ('Carbon-Free February', 'Go car-free for the entire month of February', 'transportation', 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'),
  ('Energy Conservation Week', 'Reduce household energy consumption by 20% for one week', 'energy', 50, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 week');

-- Insert sample research insights
INSERT INTO research_insights (title, summary, category, source, publication_date, relevance_score)
VALUES 
  ('Impact of Electric Vehicles on Urban Air Quality', 'Study shows 30% reduction in urban air pollution with widespread EV adoption', 'transportation', 'Nature Climate Change', CURRENT_DATE - INTERVAL '2 months', 0.95),
  ('Plant-Based Diet Carbon Footprint Analysis', 'Comprehensive analysis of dietary choices and their environmental impact', 'food', 'Environmental Research Letters', CURRENT_DATE - INTERVAL '1 month', 0.88);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles', 
    'carbon_tracking', 
    'ai_recommendations', 
    'satellite_data', 
    'environmental_goals', 
    'community_challenges', 
    'user_challenge_participation', 
    'research_insights'
  )
ORDER BY table_name;

-- Check sample data
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'carbon_tracking', COUNT(*) FROM carbon_tracking
UNION ALL
SELECT 'ai_recommendations', COUNT(*) FROM ai_recommendations
UNION ALL
SELECT 'environmental_goals', COUNT(*) FROM environmental_goals
UNION ALL
SELECT 'community_challenges', COUNT(*) FROM community_challenges
UNION ALL
SELECT 'research_insights', COUNT(*) FROM research_insights;
