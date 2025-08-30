-- AI Features Schema - Run this after user_tracking_schema.sql

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create ai_recommendations table for caching AI responses
CREATE TABLE ai_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    recommendations JSONB NOT NULL, -- Array of AI recommendation objects
    insights TEXT, -- AI-generated insights text
    profile_snapshot JSONB, -- User carbon profile used for generation
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create ai_research_insights table for storing AI-generated research
CREATE TABLE ai_research_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    impact_data TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'study', 'report', 'analysis'
    credibility_score INTEGER CHECK (credibility_score >= 1 AND credibility_score <= 10),
    generated_by_ai BOOLEAN DEFAULT TRUE,
    published BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_recommendation_feedback table for tracking user engagement
CREATE TABLE user_recommendation_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    recommendation_id VARCHAR(100) NOT NULL, -- ID from the AI recommendation
    feedback_type VARCHAR(50) NOT NULL, -- 'helpful', 'not_helpful', 'completed', 'dismissed'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_generated_at ON ai_recommendations(generated_at DESC);
CREATE INDEX idx_ai_research_insights_category ON ai_research_insights(category);
CREATE INDEX idx_ai_research_insights_published ON ai_research_insights(published);
CREATE INDEX idx_ai_research_insights_featured ON ai_research_insights(featured);
CREATE INDEX idx_user_recommendation_feedback_user_id ON user_recommendation_feedback(user_id);
CREATE INDEX idx_user_recommendation_feedback_recommendation_id ON user_recommendation_feedback(recommendation_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_research_insights_updated_at BEFORE UPDATE ON ai_research_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_research_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own AI recommendations" ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI recommendations" ON ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI recommendations" ON ai_recommendations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public read AI research insights" ON ai_research_insights FOR SELECT USING (published = true);
CREATE POLICY "Admin manage AI research insights" ON ai_research_insights FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own recommendation feedback" ON user_recommendation_feedback FOR ALL USING (auth.uid() = user_id);

-- Function to clean up old AI recommendations (keep last 5 per user)
CREATE OR REPLACE FUNCTION cleanup_old_ai_recommendations()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_recommendations
    WHERE id NOT IN (
        SELECT id
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY generated_at DESC) as rn
            FROM ai_recommendations
        ) ranked
        WHERE rn <= 5
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get AI recommendation stats
CREATE OR REPLACE FUNCTION get_ai_recommendation_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_recommendations_generated', (
            SELECT COUNT(*) 
            FROM ai_recommendations 
            WHERE user_id = user_uuid
        ),
        'last_generated', (
            SELECT generated_at 
            FROM ai_recommendations 
            WHERE user_id = user_uuid 
            ORDER BY generated_at DESC 
            LIMIT 1
        ),
        'feedback_given', (
            SELECT COUNT(*) 
            FROM user_recommendation_feedback 
            WHERE user_id = user_uuid
        ),
        'completed_recommendations', (
            SELECT COUNT(*) 
            FROM user_recommendation_feedback 
            WHERE user_id = user_uuid AND feedback_type = 'completed'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some initial AI-generated research insights (sample data)
INSERT INTO ai_research_insights (title, summary, category, impact_data, source_type, credibility_score, featured) VALUES
(
    'Household Energy Efficiency: Smart Thermostats Reduce Emissions by 12-15%',
    'Recent comprehensive analysis of smart thermostat deployment across 50,000 households shows consistent energy savings of 12-15% for heating and cooling. The study found that programmable scheduling and occupancy detection features contribute most significantly to reductions. Average household CO₂ savings range from 400-600 kg annually, with greatest impact in climate zones requiring significant heating or cooling. Implementation requires minimal behavioral change, making this a highly effective personal climate action.',
    'energy',
    '12-15% energy reduction, 400-600 kg CO₂ savings annually per household',
    'analysis',
    9,
    true
),
(
    'Plant-Based Meal Frequency: Linear Relationship with Carbon Footprint Reduction',
    'Meta-analysis of dietary carbon footprint studies reveals a strong linear relationship between plant-based meal frequency and emissions reduction. Each plant-based meal substitution reduces average daily carbon footprint by 1.2-2.1 kg CO₂ equivalent. The research shows that replacing just 3 meat-based meals per week with plant alternatives can reduce annual food-related emissions by 15-20%. Greatest impact comes from reducing beef consumption, with chicken and pork substitutions showing moderate benefits.',
    'food',
    '1.2-2.1 kg CO₂ reduction per plant-based meal, 15-20% annual food emissions reduction',
    'study',
    9,
    true
),
(
    'Active Transportation: Urban Cycling Infrastructure Drives 25% Reduction in Transport Emissions',
    'Analysis of transportation patterns in 40 cities with expanded cycling infrastructure shows average 25% reduction in personal transport emissions among active users. The study tracked 15,000 individuals over 18 months, finding that protected bike lane networks increase cycling frequency by 200-300%. Average CO₂ savings of 800-1200 kg annually per regular cyclist, with additional health co-benefits valued at $2,400 annually. Weather patterns and trip distance emerged as key adoption factors.',
    'transportation',
    '25% transport emission reduction, 800-1200 kg CO₂ savings annually',
    'study',
    8,
    true
),
(
    'Renewable Energy Transition: Residential Solar Adoption Accelerates Carbon Payback Timeline',
    'Comprehensive lifecycle analysis of residential solar installations shows carbon payback periods have decreased to 1.5-2.5 years, down from 4-6 years in previous decade. Modern solar panels with 25-year warranties provide net carbon benefits of 15-25 tons CO₂ offset per household over their lifetime. Study of 100,000 installations shows average 60-80% reduction in household electricity-related emissions, with battery storage systems providing additional 10-15% optimization through load shifting.',
    'energy',
    '60-80% electricity emission reduction, 15-25 tons lifetime CO₂ offset',
    'analysis',
    8,
    false
),
(
    'Circular Economy Practices: Waste Reduction Strategies Show 30% Carbon Impact Decrease',
    'Longitudinal study of household waste reduction strategies across 25,000 participants demonstrates that comprehensive circular economy practices reduce waste-related carbon footprint by 30%. Most effective strategies include composting (40% organic waste reduction), repair culture adoption (extending product lifecycles by 50%), and strategic purchasing decisions. The research quantifies average 200-350 kg CO₂ equivalent savings annually per household through waste stream optimization and consumption pattern changes.',
    'waste',
    '30% waste carbon reduction, 200-350 kg CO₂ savings annually via circular practices',
    'report',
    7,
    false
);

-- Create a function to generate AI research insights (placeholder for future automation)
CREATE OR REPLACE FUNCTION generate_ai_research_batch()
RETURNS void AS $$
BEGIN
    -- This function would call the Inflection AI API to generate new research insights
    -- For now, it's a placeholder that could be triggered by a cron job
    RAISE NOTICE 'AI research generation would be triggered here';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
