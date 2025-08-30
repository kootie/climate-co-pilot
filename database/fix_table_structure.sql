-- Fix table structure for EcoGuide AI
-- Run this in your Supabase SQL Editor

-- First, let's check what tables and columns currently exist
SELECT 'Current table structure:' as info;

-- Check if carbon_tracking table exists and what columns it has
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'carbon_tracking' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if user_profiles table exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- If the tables don't have the right structure, let's recreate them properly
-- Drop existing tables if they exist (this will delete any data)
DROP TABLE IF EXISTS carbon_tracking CASCADE;
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Recreate user_profiles table with correct structure
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  carbon_goal DECIMAL(10,2) DEFAULT 2000.00,
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate carbon_tracking table with correct structure
CREATE TABLE carbon_tracking (
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

-- Recreate ai_recommendations table with correct structure
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  potential_savings DECIMAL(10,2),
  difficulty_level VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo user profile with proper UUID
INSERT INTO user_profiles (id, email, full_name, carbon_goal, onboarded)
VALUES (
  gen_random_uuid(),
  'fabian@inuaake.com',
  'Fabian Demo',
  2000.00,
  TRUE
);

-- Get the user ID we just created for subsequent inserts
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get the user ID we just created
  SELECT id INTO demo_user_id FROM user_profiles WHERE email = 'fabian@inuaake.com';
  
  -- Insert sample carbon tracking data
  INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes)
  VALUES 
    (demo_user_id, 'transportation', 'car_trip', 25.0, 5.25, CURRENT_DATE - 1, 'Commute to work'),
    (demo_user_id, 'transportation', 'bicycle', 10.0, 0.0, CURRENT_DATE - 2, 'Bike to grocery store'),
    (demo_user_id, 'energy', 'electricity_kwh', 15.0, 6.8, CURRENT_DATE - 3, 'Home electricity usage'),
    (demo_user_id, 'food', 'beef_meal', 1.0, 6.61, CURRENT_DATE - 4, 'Dinner'),
    (demo_user_id, 'waste', 'recycling_kg', 2.0, 0.2, CURRENT_DATE - 5, 'Weekly recycling');

  -- Insert sample AI recommendations
  INSERT INTO ai_recommendations (user_id, category, title, description, potential_savings, difficulty_level)
  VALUES 
    (demo_user_id, 'transportation', 'Switch to Electric Vehicle', 'Consider replacing your car with an electric vehicle for daily commutes', 45.5, 'high'),
    (demo_user_id, 'energy', 'Install LED Bulbs', 'Replace incandescent bulbs with LED alternatives throughout your home', 12.3, 'low'),
    (demo_user_id, 'food', 'Reduce Meat Consumption', 'Try meatless Mondays and reduce beef consumption by 50%', 18.7, 'medium');
END $$;

-- Verify the new structure
SELECT 'New table structure created:' as info;

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'carbon_tracking', 'ai_recommendations')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Test a simple query to make sure it works
SELECT 'Testing carbon_tracking query:' as test;
SELECT category, activity_type, co2_emitted, date 
FROM carbon_tracking 
WHERE user_id IN (SELECT id FROM user_profiles WHERE email = 'fabian@inuaake.com')
ORDER BY date DESC;

-- Show the demo user data
SELECT 'Demo user created:' as info;
SELECT id, email, full_name, carbon_goal FROM user_profiles WHERE email = 'fabian@inuaake.com';

SELECT 'Tables fixed successfully!' as status;
