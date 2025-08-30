-- Quick setup for EcoGuide AI - Essential tables only
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  carbon_goal DECIMAL(10,2) DEFAULT 2000.00,
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Carbon tracking table (this was missing!)
CREATE TABLE IF NOT EXISTS carbon_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  co2_emitted DECIMAL(10,2) NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AI recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  potential_savings DECIMAL(10,2),
  difficulty_level VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo user profile
INSERT INTO user_profiles (id, email, full_name, carbon_goal, onboarded)
VALUES (
  'demo-user-id',
  'fabian@inuaake.com',
  'Fabian Demo',
  2000.00,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  carbon_goal = EXCLUDED.carbon_goal,
  onboarded = EXCLUDED.onboarded,
  updated_at = NOW();

-- Insert sample carbon tracking data
INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes)
VALUES 
  ('demo-user-id', 'transportation', 'car_trip', 25.0, 5.25, CURRENT_DATE - 1, 'Commute to work'),
  ('demo-user-id', 'transportation', 'bicycle', 10.0, 0.0, CURRENT_DATE - 2, 'Bike to grocery store'),
  ('demo-user-id', 'energy', 'electricity_kwh', 15.0, 6.8, CURRENT_DATE - 3, 'Home electricity usage'),
  ('demo-user-id', 'food', 'beef_meal', 1.0, 6.61, CURRENT_DATE - 4, 'Dinner'),
  ('demo-user-id', 'waste', 'recycling_kg', 2.0, 0.2, CURRENT_DATE - 5, 'Weekly recycling');

-- Insert sample AI recommendations
INSERT INTO ai_recommendations (user_id, category, title, description, potential_savings, difficulty_level)
VALUES 
  ('demo-user-id', 'transportation', 'Switch to Electric Vehicle', 'Consider replacing your car with an electric vehicle for daily commutes', 45.5, 'high'),
  ('demo-user-id', 'energy', 'Install LED Bulbs', 'Replace incandescent bulbs with LED alternatives throughout your home', 12.3, 'low'),
  ('demo-user-id', 'food', 'Reduce Meat Consumption', 'Try meatless Mondays and reduce beef consumption by 50%', 18.7, 'medium');

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'carbon_tracking', 'ai_recommendations');
