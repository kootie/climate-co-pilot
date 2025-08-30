-- =====================================================
-- QUICK SETUP SCRIPT FOR FABIAN DEMO USER
-- Run this script to set up demo data for fabian@inuaake.com
-- =====================================================

-- First, ensure the user exists in auth.users (this should be done through Supabase Auth UI)
-- Then run the main dummy data script

\echo 'Setting up demo data for fabian@inuaake.com...'

-- Check if required tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE EXCEPTION 'user_profiles table does not exist. Please run the main schema setup first.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carbon_tracking') THEN
        RAISE EXCEPTION 'carbon_tracking table does not exist. Please run the user tracking schema first.';
    END IF;
    
    RAISE NOTICE 'All required tables exist. Proceeding with data setup...';
END $$;

-- Clean up any existing data for this user (for testing)
DO $$
DECLARE
    fabian_user_id UUID;
BEGIN
    -- Get user ID if exists
    SELECT id INTO fabian_user_id 
    FROM user_profiles 
    WHERE email = 'fabian@inuaake.com';
    
    IF fabian_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found existing user data for fabian@inuaake.com, cleaning up...';
        
        -- Delete in correct order due to foreign key constraints
        DELETE FROM user_preferences WHERE user_id = fabian_user_id;
        DELETE FROM user_goals WHERE user_id = fabian_user_id;
        DELETE FROM ai_recommendations WHERE user_id = fabian_user_id;
        DELETE FROM carbon_tracking WHERE user_id = fabian_user_id;
        DELETE FROM user_profiles WHERE id = fabian_user_id;
        
        RAISE NOTICE 'Cleanup completed.';
    ELSE
        RAISE NOTICE 'No existing data found for fabian@inuaake.com.';
    END IF;
END $$;

-- Load the dummy data
\i dummy_data_fabian.sql

-- Verify the setup
DO $$
DECLARE
    user_count INTEGER;
    activity_count INTEGER;
    recommendation_count INTEGER;
    satellite_count INTEGER;
BEGIN
    -- Check user profile
    SELECT COUNT(*) INTO user_count 
    FROM user_profiles 
    WHERE email = 'fabian@inuaake.com';
    
    -- Check carbon tracking data
    SELECT COUNT(*) INTO activity_count 
    FROM carbon_tracking ct
    INNER JOIN user_profiles up ON ct.user_id = up.id
    WHERE up.email = 'fabian@inuaake.com';
    
    -- Check AI recommendations
    SELECT COUNT(*) INTO recommendation_count 
    FROM ai_recommendations ar
    INNER JOIN user_profiles up ON ar.user_id = up.id
    WHERE up.email = 'fabian@inuaake.com';
    
    -- Check satellite data
    SELECT COUNT(*) INTO satellite_count 
    FROM satellite_data_points 
    WHERE lat BETWEEN 52.4 AND 52.6 
    AND lng BETWEEN 13.2 AND 13.5;
    
    RAISE NOTICE '=== SETUP VERIFICATION ===';
    RAISE NOTICE 'User profiles created: %', user_count;
    RAISE NOTICE 'Carbon tracking activities: %', activity_count;
    RAISE NOTICE 'AI recommendations: %', recommendation_count;
    RAISE NOTICE 'Satellite data points (Berlin area): %', satellite_count;
    
    IF user_count > 0 AND activity_count > 0 AND recommendation_count > 0 THEN
        RAISE NOTICE '✅ Demo setup completed successfully!';
        RAISE NOTICE '';
        RAISE NOTICE '🔑 Demo User Credentials:';
        RAISE NOTICE '   Email: fabian@inuaake.com';
        RAISE NOTICE '   Name: Fabian Muller';
        RAISE NOTICE '   Location: Berlin, Germany';
        RAISE NOTICE '';
        RAISE NOTICE '📊 Demo Data Summary:';
        RAISE NOTICE '   • % carbon tracking activities over 3 months', activity_count;
        RAISE NOTICE '   • % AI-generated recommendations', recommendation_count;
        RAISE NOTICE '   • Current monthly CO2: ~850 kg (goal: 650 kg)';
        RAISE NOTICE '   • Primary emission source: Transportation (50%%)';
        RAISE NOTICE '   • Showing improvement trends and sustainable choices';
        RAISE NOTICE '';
        RAISE NOTICE '🌍 Features Demonstrated:';
        RAISE NOTICE '   • Personal carbon footprint tracking';
        RAISE NOTICE '   • AI-powered recommendations';
        RAISE NOTICE '   • Berlin-area satellite data';
        RAISE NOTICE '   • Goal setting and progress tracking';
        RAISE NOTICE '   • Community comparisons';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Next Steps:';
        RAISE NOTICE '   1. Create auth user in Supabase Auth UI';
        RAISE NOTICE '   2. Test login with fabian@inuaake.com';
        RAISE NOTICE '   3. Explore all dashboard features';
        RAISE NOTICE '   4. Test AI recommendation generation';
    ELSE
        RAISE WARNING '❌ Setup verification failed. Check for errors above.';
    END IF;
END $$;

-- Create a quick data summary view for easy access
CREATE OR REPLACE VIEW fabian_demo_summary AS
SELECT 
    'Demo User Overview' as section,
    jsonb_build_object(
        'email', up.email,
        'name', up.full_name,
        'location', up.location,
        'carbon_goal', up.carbon_goal,
        'current_month_co2', (
            SELECT ROUND(SUM(co2_emitted)::numeric, 1)
            FROM carbon_tracking ct
            WHERE ct.user_id = up.id
            AND ct.date >= DATE_TRUNC('month', CURRENT_DATE)
        ),
        'total_activities', (
            SELECT COUNT(*)
            FROM carbon_tracking ct
            WHERE ct.user_id = up.id
        ),
        'ai_recommendations', (
            SELECT COUNT(*)
            FROM ai_recommendations ar
            WHERE ar.user_id = up.id
        ),
        'goal_progress_percent', ROUND((
            (SELECT SUM(co2_emitted)
             FROM carbon_tracking ct
             WHERE ct.user_id = up.id
             AND ct.date >= DATE_TRUNC('month', CURRENT_DATE)
            ) * 100.0 / up.carbon_goal
        )::numeric, 1),
        'top_emission_categories', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'category', category,
                    'total_co2', ROUND(SUM(co2_emitted)::numeric, 1),
                    'percentage', ROUND((SUM(co2_emitted) * 100.0 / (
                        SELECT SUM(co2_emitted) 
                        FROM carbon_tracking ct2 
                        WHERE ct2.user_id = ct.user_id
                        AND ct2.date >= DATE_TRUNC('month', CURRENT_DATE)
                    ))::numeric, 1)
                )
                ORDER BY SUM(co2_emitted) DESC
            )
            FROM carbon_tracking ct
            WHERE ct.user_id = up.id
            AND ct.date >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY category
        )
    ) as data
FROM user_profiles up
WHERE up.email = 'fabian@inuaake.com';

\echo ''
\echo '✅ Fabian demo setup completed!'
\echo ''
\echo 'Query "SELECT * FROM fabian_demo_summary;" to see a complete overview.'
\echo 'The user can now log in and explore all platform features with realistic data.'
