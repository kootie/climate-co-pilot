-- Additional schema for user carbon tracking
-- Run this after the main schema.sql

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    location VARCHAR(100),
    carbon_goal DECIMAL(10,2) DEFAULT 2000.00, -- kg CO2 per year goal
    onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create carbon_tracking table for user activities
CREATE TABLE carbon_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'transportation', 'energy', 'food', 'waste', 'consumption'
    activity_type VARCHAR(100) NOT NULL, -- 'car_trip', 'flight', 'electricity', 'gas', 'meal', etc.
    amount DECIMAL(10,2) NOT NULL, -- quantity (miles, kWh, meals, etc.)
    unit VARCHAR(20) NOT NULL, -- 'miles', 'km', 'kWh', 'meals', 'kg'
    co2_kg DECIMAL(10,2) NOT NULL, -- calculated CO2 emissions in kg
    description TEXT,
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create carbon_goals table for user targets
CREATE TABLE carbon_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- 'monthly', 'yearly', 'weekly'
    target_co2_kg DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activity_suggestions table
CREATE TABLE activity_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    impact_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    estimated_savings_kg DECIMAL(10,2), -- potential CO2 savings
    difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_achievements table
CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    achievement_type VARCHAR(50) NOT NULL, -- 'first_week', 'goal_achieved', 'streak_30', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_carbon_tracking_user_id ON carbon_tracking(user_id);
CREATE INDEX idx_carbon_tracking_date ON carbon_tracking(date_recorded DESC);
CREATE INDEX idx_carbon_tracking_category ON carbon_tracking(category);
CREATE INDEX idx_carbon_goals_user_id ON carbon_goals(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own tracking" ON carbon_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracking" ON carbon_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracking" ON carbon_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracking" ON carbon_tracking FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON carbon_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON carbon_goals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for suggestions
CREATE POLICY "Public read suggestions" ON activity_suggestions FOR SELECT USING (published = true);
CREATE POLICY "Admin manage suggestions" ON activity_suggestions FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample activity suggestions
INSERT INTO activity_suggestions (title, description, category, impact_level, estimated_savings_kg, difficulty) VALUES
('Switch to LED Bulbs', 'Replace incandescent bulbs with LED alternatives to reduce energy consumption', 'energy', 'medium', 50.0, 'easy'),
('Use Public Transportation', 'Take bus or train instead of driving for your daily commute', 'transportation', 'high', 200.0, 'medium'),
('Reduce Meat Consumption', 'Try plant-based meals 2-3 times per week', 'food', 'high', 150.0, 'medium'),
('Start Composting', 'Compost organic waste to reduce methane emissions from landfills', 'waste', 'medium', 75.0, 'medium'),
('Unplug Electronics', 'Unplug devices when not in use to eliminate phantom power draw', 'energy', 'low', 25.0, 'easy'),
('Bike or Walk Short Trips', 'Use active transportation for trips under 2 miles', 'transportation', 'medium', 100.0, 'easy'),
('Reduce Single-Use Plastics', 'Use reusable bags, bottles, and containers', 'consumption', 'medium', 30.0, 'easy'),
('Optimize Home Heating', 'Lower thermostat by 2°F in winter', 'energy', 'medium', 80.0, 'easy'),
('Buy Local Produce', 'Choose locally grown food to reduce transportation emissions', 'food', 'low', 40.0, 'easy'),
('Air Dry Clothes', 'Use clothesline instead of electric dryer when possible', 'energy', 'low', 35.0, 'easy');

-- Function to calculate user stats (for public display)
CREATE OR REPLACE FUNCTION get_public_tracking_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(DISTINCT user_id) FROM carbon_tracking),
        'total_co2_tracked', (SELECT ROUND(SUM(co2_kg)::numeric, 2) FROM carbon_tracking),
        'avg_monthly_reduction', (
            SELECT ROUND(AVG(monthly_total)::numeric, 2)
            FROM (
                SELECT 
                    user_id,
                    DATE_TRUNC('month', date_recorded) as month,
                    SUM(co2_kg) as monthly_total
                FROM carbon_tracking 
                WHERE date_recorded >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY user_id, DATE_TRUNC('month', date_recorded)
            ) monthly_data
        ),
        'top_categories', (
            SELECT json_agg(json_build_object('category', category, 'total_co2', total_co2))
            FROM (
                SELECT 
                    category,
                    ROUND(SUM(co2_kg)::numeric, 2) as total_co2
                FROM carbon_tracking
                GROUP BY category
                ORDER BY SUM(co2_kg) DESC
                LIMIT 5
            ) top_cats
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
