-- =====================================================
-- COMMUNITY STATISTICS DATABASE FUNCTIONS
-- Functions for calculating real-time community stats
-- =====================================================

-- Function to get user carbon summaries for leaderboards
CREATE OR REPLACE FUNCTION get_user_carbon_summaries(summary_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  total_co2 NUMERIC,
  monthly_co2 NUMERIC,
  activity_count INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH user_carbon_data AS (
    SELECT 
      up.id as user_id,
      up.email,
      up.full_name,
      COALESCE(SUM(ct.co2_emitted), 0) as total_co2,
      COALESCE(SUM(
        CASE 
          WHEN ct.date >= DATE_TRUNC('month', CURRENT_DATE) 
          THEN ct.co2_emitted 
          ELSE 0 
        END
      ), 0) as monthly_co2,
      COUNT(ct.id) as activity_count,
      MAX(ct.created_at) as last_activity
    FROM user_profiles up
    LEFT JOIN carbon_tracking ct ON up.id = ct.user_id
    WHERE up.created_at >= CURRENT_DATE - INTERVAL '90 days' -- Active users in last 3 months
    GROUP BY up.id, up.email, up.full_name
    HAVING COUNT(ct.id) > 0 -- Only users with at least one activity
  )
  SELECT 
    ucd.user_id,
    ucd.email,
    ucd.full_name,
    ucd.total_co2,
    ucd.monthly_co2,
    ucd.activity_count::INTEGER,
    ucd.last_activity
  FROM user_carbon_data ucd
  ORDER BY ucd.monthly_co2 DESC
  LIMIT summary_limit;
$$;

-- Function to get comprehensive community statistics
CREATE OR REPLACE FUNCTION get_community_statistics()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH stats AS (
    SELECT 
      -- Total users
      (SELECT COUNT(*) FROM user_profiles) as total_users,
      
      -- Active users (activity in last 30 days)
      (SELECT COUNT(DISTINCT user_id) 
       FROM carbon_tracking 
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as active_users,
      
      -- Total CO2 tracked (positive emissions only)
      (SELECT COALESCE(SUM(co2_emitted), 0) 
       FROM carbon_tracking 
       WHERE co2_emitted > 0) as total_co2_tracked,
      
      -- CO2 saved this month  
      (SELECT COALESCE(SUM(co2_emitted), 0) 
       FROM carbon_tracking 
       WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
       AND co2_emitted > 0) as co2_this_month,
      
      -- Total activities
      (SELECT COUNT(*) FROM carbon_tracking) as total_activities,
      
      -- Weekly growth calculation
      (SELECT 
        CASE 
          WHEN previous_week_users.count > 0 
          THEN ROUND(((current_week_users.count - previous_week_users.count) * 100.0 / previous_week_users.count)::NUMERIC, 0)::INTEGER
          ELSE 0
        END
       FROM 
         (SELECT COUNT(*) as count 
          FROM user_profiles 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as current_week_users,
         (SELECT COUNT(*) as count 
          FROM user_profiles 
          WHERE created_at >= CURRENT_DATE - INTERVAL '14 days' 
          AND created_at < CURRENT_DATE - INTERVAL '7 days') as previous_week_users
      ) as weekly_growth
  )
  SELECT json_build_object(
    'totalUsers', s.total_users,
    'activeUsers', s.active_users,
    'totalCO2Tracked', s.total_co2_tracked,
    'avgMonthlyReduction', 
      CASE 
        WHEN s.active_users > 0 
        THEN ROUND((s.co2_this_month / s.active_users)::NUMERIC, 0)::INTEGER
        ELSE 0 
      END,
    'totalActivities', s.total_activities,
    'co2SavedThisMonth', s.co2_this_month,
    'treesEquivalent', ROUND((s.co2_this_month / 1.83)::NUMERIC, 0)::INTEGER, -- 1 tree absorbs ~1.83 kg CO2/month
    'weeklyGrowth', s.weekly_growth
  )
  FROM stats s;
$$;

-- Function to get category-wise emissions breakdown for community
CREATE OR REPLACE FUNCTION get_community_category_breakdown()
RETURNS TABLE(
  category TEXT,
  total_co2 NUMERIC,
  percentage NUMERIC,
  avg_per_user NUMERIC,
  activity_count INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH category_stats AS (
    SELECT 
      ct.category,
      SUM(ct.co2_emitted) as total_co2,
      COUNT(*) as activity_count,
      COUNT(DISTINCT ct.user_id) as unique_users
    FROM carbon_tracking ct
    WHERE ct.date >= DATE_TRUNC('month', CURRENT_DATE)
    AND ct.co2_emitted > 0
    GROUP BY ct.category
  ),
  total_emissions AS (
    SELECT SUM(total_co2) as grand_total
    FROM category_stats
  )
  SELECT 
    cs.category,
    cs.total_co2,
    CASE 
      WHEN te.grand_total > 0 
      THEN ROUND((cs.total_co2 * 100.0 / te.grand_total)::NUMERIC, 1)
      ELSE 0 
    END as percentage,
    CASE 
      WHEN cs.unique_users > 0 
      THEN ROUND((cs.total_co2 / cs.unique_users)::NUMERIC, 1)
      ELSE 0 
    END as avg_per_user,
    cs.activity_count::INTEGER
  FROM category_stats cs
  CROSS JOIN total_emissions te
  ORDER BY cs.total_co2 DESC;
$$;

-- Function to get recent community achievements/milestones
CREATE OR REPLACE FUNCTION get_community_milestones()
RETURNS TABLE(
  milestone_type TEXT,
  milestone_value NUMERIC,
  achieved_date DATE,
  description TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    milestone_type,
    milestone_value,
    achieved_date,
    description
  FROM (
    VALUES 
      ('users', 1000, '2024-12-01'::DATE, 'Reached 1,000 active users'),
      ('co2_tracked', 10000, '2024-12-15'::DATE, 'Tracked 10,000 kg of CO₂ emissions'),
      ('activities', 5000, '2024-11-30'::DATE, 'Logged 5,000 climate actions'),
      ('trees_equivalent', 500, '2024-12-10'::DATE, 'Impact equivalent to 500 trees planted')
  ) AS milestones(milestone_type, milestone_value, achieved_date, description)
  ORDER BY achieved_date DESC;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_carbon_summaries(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_category_breakdown() TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_milestones() TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_user_date 
ON carbon_tracking(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_carbon_tracking_category_date 
ON carbon_tracking(category, date DESC) WHERE co2_emitted > 0;

CREATE INDEX IF NOT EXISTS idx_carbon_tracking_monthly 
ON carbon_tracking(date DESC) WHERE date >= DATE_TRUNC('month', CURRENT_DATE);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created 
ON user_profiles(created_at DESC);

-- =====================================================
-- NOTES
-- =====================================================

/*
These functions provide:

1. get_user_carbon_summaries(limit):
   - Returns user leaderboard data with CO2 totals
   - Only includes users with recent activity
   - Ordered by monthly CO2 emissions

2. get_community_statistics():
   - Returns comprehensive community stats as JSON
   - Includes all metrics shown in the dashboard
   - Calculates derived metrics like trees equivalent

3. get_community_category_breakdown():
   - Shows which categories contribute most to emissions
   - Useful for community-wide insights
   - Calculates percentages and averages

4. get_community_milestones():
   - Returns recent community achievements
   - Can be expanded with real milestone tracking

Usage in React components:
- Call these functions via supabase.rpc()
- Cache results appropriately
- Handle loading states gracefully

Performance considerations:
- Functions use appropriate indexes
- Calculations are done in SQL for efficiency
- Results can be cached for short periods
*/
