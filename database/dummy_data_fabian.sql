-- =====================================================
-- DUMMY DATA FOR FABIAN@INUAAKE.COM
-- EcoGuide AI Test User Data
-- =====================================================

-- Note: Run this after setting up the complete database schema
-- This creates realistic test data for development and demonstration

-- =====================================================
-- 1. USER PROFILE DATA
-- =====================================================

-- Insert user profile (assuming auth.users is managed by Supabase Auth)
-- This would be created through the authentication flow, but we'll insert profile data

INSERT INTO user_profiles (
  id,
  email,
  full_name,
  carbon_goal,
  location,
  household_size,
  income_bracket,
  occupation,
  transportation_preference,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'fabian@inuaake.com',
  'Fabian Muller',
  650.0, -- Target: 650 kg CO2 per month (currently at ~850)
  'Berlin, Germany',
  2,
  '50000-75000',
  'Software Engineer',
  'mixed',
  NOW() - INTERVAL '3 months',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  carbon_goal = EXCLUDED.carbon_goal,
  location = EXCLUDED.location,
  household_size = EXCLUDED.household_size,
  updated_at = NOW();

-- =====================================================
-- 2. CARBON TRACKING DATA (Last 3 months)
-- =====================================================

-- Get user ID for subsequent inserts
WITH user_data AS (
  SELECT id as user_id FROM user_profiles WHERE email = 'fabian@inuaake.com'
)

-- Transportation activities
INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes, created_at)
SELECT 
  user_id,
  'transportation',
  activity_type,
  value,
  co2_emitted,
  date,
  notes,
  date
FROM user_data,
(VALUES
  -- Recent week (high car usage)
  ('car_trip', 45.0, 9.45, CURRENT_DATE - 1, 'Commute to office'),
  ('car_trip', 25.0, 5.25, CURRENT_DATE - 1, 'Grocery shopping'),
  ('public_transport', 15.0, 1.8, CURRENT_DATE - 2, 'S-Bahn to city center'),
  ('car_trip', 50.0, 10.5, CURRENT_DATE - 3, 'Weekend trip to countryside'),
  ('bicycle', 8.0, 0.0, CURRENT_DATE - 4, 'Bike to work'),
  ('car_trip', 30.0, 6.3, CURRENT_DATE - 5, 'Visit friends'),
  ('public_transport', 20.0, 2.4, CURRENT_DATE - 6, 'Metro to airport pickup'),
  
  -- Previous week (better habits)
  ('bicycle', 12.0, 0.0, CURRENT_DATE - 8, 'Bike commute'),
  ('public_transport', 25.0, 3.0, CURRENT_DATE - 9, 'Bus and train to work'),
  ('car_trip', 35.0, 7.35, CURRENT_DATE - 10, 'Commute (rainy day)'),
  ('walking', 5.0, 0.0, CURRENT_DATE - 11, 'Walk to local meetings'),
  ('bicycle', 15.0, 0.0, CURRENT_DATE - 12, 'Cycling weekend'),
  ('car_trip', 60.0, 12.6, CURRENT_DATE - 13, 'Family visit'),
  ('public_transport', 18.0, 2.16, CURRENT_DATE - 14, 'U-Bahn commute'),
  
  -- Month ago data
  ('car_trip', 40.0, 8.4, CURRENT_DATE - 20, 'Regular commute'),
  ('bicycle', 10.0, 0.0, CURRENT_DATE - 25, 'Bike to work'),
  ('flight', 800.0, 180.0, CURRENT_DATE - 30, 'Business trip to Amsterdam'),
  ('car_trip', 120.0, 25.2, CURRENT_DATE - 35, 'Road trip weekend'),
  ('public_transport', 30.0, 3.6, CURRENT_DATE - 40, 'Daily commuting'),
  
  -- Two months ago
  ('car_trip', 200.0, 42.0, CURRENT_DATE - 50, 'Moving apartment'),
  ('public_transport', 40.0, 4.8, CURRENT_DATE - 55, 'Conference travel'),
  ('bicycle', 25.0, 0.0, CURRENT_DATE - 60, 'Summer cycling'),
  ('car_trip', 80.0, 16.8, CURRENT_DATE - 65, 'Vacation prep'),
  
  -- Three months ago  
  ('flight', 1200.0, 270.0, CURRENT_DATE - 80, 'International conference'),
  ('car_trip', 150.0, 31.5, CURRENT_DATE - 85, 'Holiday travel'),
  ('public_transport', 35.0, 4.2, CURRENT_DATE - 90, 'Regular commuting')
) AS activities(activity_type, value, co2_emitted, date, notes);

-- Energy consumption activities
INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes, created_at)
SELECT 
  user_id,
  'energy',
  activity_type,
  value,
  co2_emitted,
  date,
  notes,
  date
FROM user_data,
(VALUES
  -- Monthly electricity bills
  ('electricity', 280.0, 112.0, CURRENT_DATE - 15, 'Monthly electricity bill'),
  ('electricity', 320.0, 128.0, CURRENT_DATE - 45, 'Higher usage (home office)'),
  ('electricity', 250.0, 100.0, CURRENT_DATE - 75, 'Summer month (less heating)'),
  
  -- Heating (natural gas)
  ('heating', 450.0, 90.0, CURRENT_DATE - 10, 'Monthly gas heating'),
  ('heating', 520.0, 104.0, CURRENT_DATE - 40, 'Cold winter month'),
  ('heating', 200.0, 40.0, CURRENT_DATE - 70, 'Spring heating'),
  
  -- Hot water
  ('hot_water', 80.0, 16.0, CURRENT_DATE - 5, 'Monthly hot water usage'),
  ('hot_water', 85.0, 17.0, CURRENT_DATE - 35, 'Slightly higher usage'),
  ('hot_water', 75.0, 15.0, CURRENT_DATE - 65, 'Regular hot water use')
) AS activities(activity_type, value, co2_emitted, date, notes);

-- Food consumption activities
INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes, created_at)
SELECT 
  user_id,
  'food',
  activity_type,
  value,
  co2_emitted,
  date,
  notes,
  date
FROM user_data,
(VALUES
  -- Meat consumption (reducing over time)
  ('meat_beef', 2.0, 50.0, CURRENT_DATE - 2, 'Beef dinner'),
  ('meat_chicken', 1.5, 8.25, CURRENT_DATE - 5, 'Chicken lunch'),
  ('meat_pork', 1.0, 7.3, CURRENT_DATE - 8, 'Pork schnitzel'),
  ('meat_beef', 1.5, 37.5, CURRENT_DATE - 12, 'BBQ weekend'),
  ('meat_chicken', 2.0, 11.0, CURRENT_DATE - 18, 'Meal prep'),
  
  -- Dairy products
  ('dairy_milk', 0.5, 1.65, CURRENT_DATE - 1, 'Daily milk consumption'),
  ('dairy_cheese', 0.3, 3.48, CURRENT_DATE - 3, 'Cheese for cooking'),
  ('dairy_yogurt', 0.2, 1.0, CURRENT_DATE - 6, 'Breakfast yogurt'),
  ('dairy_milk', 0.5, 1.65, CURRENT_DATE - 15, 'Weekly milk'),
  
  -- Plant-based alternatives (increasing)
  ('plant_based', 1.0, 2.0, CURRENT_DATE - 4, 'Oat milk switch'),
  ('plant_based', 0.8, 1.6, CURRENT_DATE - 7, 'Tofu dinner'),
  ('plant_based', 1.2, 2.4, CURRENT_DATE - 11, 'Vegan meal experiment'),
  ('plant_based', 0.9, 1.8, CURRENT_DATE - 16, 'Plant protein lunch'),
  
  -- Organic/local food
  ('local_organic', 2.0, 3.0, CURRENT_DATE - 9, 'Farmers market shopping'),
  ('local_organic', 1.5, 2.25, CURRENT_DATE - 20, 'Local vegetables'),
  ('local_organic', 2.5, 3.75, CURRENT_DATE - 30, 'Organic groceries')
) AS activities(activity_type, value, co2_emitted, date, notes);

-- Consumption/Shopping activities
INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes, created_at)
SELECT 
  user_id,
  'consumption',
  activity_type,
  value,
  co2_emitted,
  date,
  notes,
  date
FROM user_data,
(VALUES
  -- Electronics
  ('electronics', 1.0, 45.0, CURRENT_DATE - 7, 'New smartphone'),
  ('electronics', 1.0, 25.0, CURRENT_DATE - 25, 'Laptop accessories'),
  ('electronics', 1.0, 15.0, CURRENT_DATE - 60, 'Headphones'),
  
  -- Clothing (some sustainable choices)
  ('clothing_fast_fashion', 3.0, 60.0, CURRENT_DATE - 14, 'Work clothes'),
  ('clothing_sustainable', 2.0, 20.0, CURRENT_DATE - 35, 'Sustainable brand shirt'),
  ('clothing_second_hand', 1.0, 5.0, CURRENT_DATE - 50, 'Vintage jacket'),
  ('clothing_fast_fashion', 2.0, 40.0, CURRENT_DATE - 70, 'Summer clothes'),
  
  -- Home goods
  ('home_goods', 1.0, 30.0, CURRENT_DATE - 21, 'Kitchen appliance'),
  ('home_goods', 1.0, 12.0, CURRENT_DATE - 45, 'Furniture item'),
  ('home_goods', 1.0, 8.0, CURRENT_DATE - 75, 'Home decoration'),
  
  -- Books/Media (low impact choices)
  ('books_media', 2.0, 4.0, CURRENT_DATE - 28, 'Technical books'),
  ('books_media', 1.0, 1.5, CURRENT_DATE - 55, 'E-book purchases')
) AS activities(activity_type, value, co2_emitted, date, notes);

-- Waste management activities
INSERT INTO carbon_tracking (user_id, category, activity_type, value, co2_emitted, date, notes, created_at)
SELECT 
  user_id,
  'waste',
  activity_type,
  value,
  co2_emitted,
  date,
  notes,
  date
FROM user_data,
(VALUES
  -- Recycling (positive impact)
  ('recycling', 5.0, -2.0, CURRENT_DATE - 3, 'Weekly recycling'),
  ('recycling', 4.0, -1.6, CURRENT_DATE - 10, 'Paper and plastic'),
  ('recycling', 6.0, -2.4, CURRENT_DATE - 17, 'Glass and metal'),
  ('recycling', 5.5, -2.2, CURRENT_DATE - 24, 'Electronics recycling'),
  
  -- Composting
  ('composting', 2.0, -1.0, CURRENT_DATE - 5, 'Food waste composting'),
  ('composting', 1.8, -0.9, CURRENT_DATE - 12, 'Garden waste'),
  ('composting', 2.2, -1.1, CURRENT_DATE - 19, 'Kitchen scraps'),
  
  -- General waste
  ('general_waste', 8.0, 3.2, CURRENT_DATE - 8, 'Non-recyclable waste'),
  ('general_waste', 7.5, 3.0, CURRENT_DATE - 15, 'Mixed household waste'),
  ('general_waste', 9.0, 3.6, CURRENT_DATE - 22, 'Spring cleaning waste')
) AS activities(activity_type, value, co2_emitted, date, notes);

-- =====================================================
-- 3. AI RECOMMENDATIONS DATA
-- =====================================================

INSERT INTO ai_recommendations (user_id, recommendations, generated_at, feedback_given, created_at)
SELECT 
  user_id,
  recommendations,
  generated_at,
  feedback_given,
  generated_at
FROM user_data,
(VALUES
  ('{
    "recommendations": [
      {
        "id": "rec_001",
        "action": "Switch to public transportation 3 days per week",
        "description": "Replace car commutes with Berlin''s excellent public transit system. This could reduce your transportation emissions by 40%.",
        "impact_kg_co2": 170.0,
        "difficulty": "medium",
        "timeline": "2-4 weeks",
        "steps": [
          "Purchase a monthly BVG transport pass",
          "Plan optimal routes using the BVG app",
          "Start with 2 days per week, then increase",
          "Combine with cycling for short distances"
        ],
        "category": "transportation",
        "cost_estimate": "€86/month for transport pass",
        "savings_estimate": "€200/month in fuel and parking"
      },
      {
        "id": "rec_002", 
        "action": "Reduce meat consumption to 2-3 times per week",
        "description": "Your current meat consumption is above average. Reducing to 2-3 times per week could save significant emissions while improving health.",
        "impact_kg_co2": 85.0,
        "difficulty": "medium",
        "timeline": "4-6 weeks",
        "steps": [
          "Plan 2-3 meat-free days per week",
          "Explore plant-based protein sources",
          "Try German vegetarian restaurants",
          "Batch cook vegetarian meals"
        ],
        "category": "food",
        "cost_estimate": "Potential €50/month savings",
        "savings_estimate": "€600/year on groceries"
      },
      {
        "id": "rec_003",
        "action": "Optimize home energy usage with smart scheduling",
        "description": "Your energy usage is moderate but could be optimized. Smart scheduling of appliances and better insulation awareness can help.",
        "impact_kg_co2": 45.0,
        "difficulty": "easy",
        "timeline": "1-2 weeks",
        "steps": [
          "Install smart power strips",
          "Schedule dishwasher and washing machine for off-peak hours",
          "Adjust thermostat by 1-2 degrees",
          "Use LED bulbs and efficient appliances"
        ],
        "category": "energy",
        "cost_estimate": "€150 initial investment",
        "savings_estimate": "€300/year on electricity bills"
      }
    ],
    "insights": "Your transportation emissions are the largest contributor at 50% of your carbon footprint. The good news is that Berlin has excellent infrastructure for sustainable transport. Your energy usage is reasonable for a 2-person household, and you''re already making some sustainable food choices. Focus on transportation first for maximum impact.",
    "monthly_progress": {
      "current_month": 847.5,
      "last_month": 892.3,
      "goal": 650.0,
      "improvement": 5.0
    }
  }'::jsonb, 
  CURRENT_DATE - 2, 
  'helpful'),
  
  ('{
    "recommendations": [
      {
        "id": "rec_004",
        "action": "Invest in a quality electric bike",
        "description": "An e-bike could replace most of your short car trips in Berlin. With bike-friendly infrastructure, this is a game-changer for urban mobility.",
        "impact_kg_co2": 120.0,
        "difficulty": "easy",
        "timeline": "1 week",
        "steps": [
          "Research e-bike models (consider German brands like Riese & Müller)",
          "Test ride different models at local shops",
          "Consider bike insurance and storage",
          "Plan safe cycling routes using Komoot"
        ],
        "category": "transportation",
        "cost_estimate": "€2000-3500 for quality e-bike",
        "savings_estimate": "€1200/year in reduced car costs"
      },
      {
        "id": "rec_005",
        "action": "Switch to renewable energy provider",
        "description": "Berlin has many green energy options. Switching to 100% renewable electricity is easy and makes a significant impact.",
        "impact_kg_co2": 95.0,
        "difficulty": "easy", 
        "timeline": "1-2 weeks",
        "steps": [
          "Compare providers like Naturstrom, Greenpeace Energy, or EWS",
          "Check your current contract termination notice",
          "Sign up online (usually takes 2-3 weeks to switch)",
          "Monitor your first green energy bill"
        ],
        "category": "energy",
        "cost_estimate": "€10-20/month additional",
        "savings_estimate": "Significant environmental impact"
      }
    ],
    "insights": "Great progress on reducing car usage last week! Your cycling days show zero transportation emissions. Consider making this a regular pattern. Your energy usage is stable, making this a good time to switch to renewable sources.",
    "weekly_summary": {
      "best_day": "Tuesday - full cycling day",
      "improvement_area": "Weekend car trips", 
      "positive_trend": "Increased public transport usage"
    }
  }'::jsonb,
  CURRENT_DATE - 15,
  'helpful'),
  
  ('{
    "recommendations": [
      {
        "id": "rec_006",
        "action": "Join a local food co-op or CSA program",
        "description": "Berlin has excellent community-supported agriculture options. This reduces food transportation emissions and supports local farmers.",
        "impact_kg_co2": 35.0,
        "difficulty": "easy",
        "timeline": "2-3 weeks",
        "steps": [
          "Research local CSA programs like SoLaWi Berlin",
          "Visit farmers markets in your area",
          "Sign up for a weekly vegetable box delivery",
          "Plan meals around seasonal produce"
        ],
        "category": "food",
        "cost_estimate": "€60-80/month for vegetable box",
        "savings_estimate": "Fresher food, potential grocery savings"
      }
    ],
    "insights": "Your flight last month significantly impacted your carbon footprint. Consider offsetting through verified programs, and for future business travel, explore train alternatives for European destinations.",
    "flight_impact_notice": "Single flight contributed 22% of monthly emissions. Consider Deutsche Bahn for trips to Amsterdam (4.5 hours) or other European cities."
  }'::jsonb,
  CURRENT_DATE - 45,
  'not_helpful')
) AS recs(recommendations, generated_at, feedback_given);

-- =====================================================
-- 4. SATELLITE DATA POINTS (Berlin area)
-- =====================================================

INSERT INTO satellite_data_points (lat, lng, data_type, metrics, ai_insights, risk_level, created_at)
VALUES
-- Central Berlin
(52.5200, 13.4050, 'air_quality', 
 '{
   "vegetation_index": 0.35,
   "air_quality_index": 42,
   "surface_temperature": 18.5,
   "deforestation_risk": 5,
   "water_quality": 78,
   "pollution_levels": {
     "no2": 25.4,
     "pm25": 18.2,
     "ozone": 68.3
   }
 }'::jsonb,
 '{
   "environmental_score": 72,
   "risk_level": "medium",
   "summary": "Urban center with moderate air quality. Green spaces help maintain environmental balance.",
   "detailed_analysis": "Berlin city center shows typical urban environmental patterns. Air quality is within EU standards but could be improved. The presence of parks like Tiergarten helps maintain vegetation levels for an urban area.",
   "recommendations": [
     "Use public transportation to reduce local emissions",
     "Support urban green space initiatives", 
     "Monitor air quality on high pollution days"
   ],
   "trends": "Air quality has improved 15% over the past 5 years due to reduced car traffic and increased cycling infrastructure."
 }'::jsonb,
 'medium',
 CURRENT_DATE - 1),

-- Tiergarten area (greener)
(52.5144, 13.3501, 'vegetation',
 '{
   "vegetation_index": 0.78,
   "air_quality_index": 35,
   "surface_temperature": 16.8,
   "deforestation_risk": 2,
   "water_quality": 85,
   "biodiversity_index": 68
 }'::jsonb,
 '{
   "environmental_score": 88,
   "risk_level": "low", 
   "summary": "Excellent urban green space with high biodiversity and clean air.",
   "detailed_analysis": "Tiergarten represents Berlin''s commitment to urban green spaces. High vegetation index and excellent air quality demonstrate the environmental benefits of preserved urban forests.",
   "recommendations": [
     "Enjoy outdoor activities in this clean air zone",
     "Support continued protection of urban forests",
     "Use this area for exercise instead of indoor gyms"
   ],
   "trends": "Vegetation health has remained stable with slight improvements due to recent tree planting initiatives."
 }'::jsonb,
 'low',
 CURRENT_DATE - 3),

-- Kreuzberg (urban residential)
(52.4987, 13.4180, 'mixed',
 '{
   "vegetation_index": 0.45,
   "air_quality_index": 38,
   "surface_temperature": 19.2,
   "deforestation_risk": 8,
   "water_quality": 75,
   "noise_pollution": 65
 }'::jsonb,
 '{
   "environmental_score": 76,
   "risk_level": "medium",
   "summary": "Dense residential area with improving environmental conditions due to cycling infrastructure.",
   "detailed_analysis": "Kreuzberg shows positive environmental trends as Berlin invests in cycling infrastructure and green building initiatives. Air quality benefits from reduced car traffic.",
   "recommendations": [
     "Take advantage of excellent cycling infrastructure",
     "Support local environmental initiatives",
     "Consider rooftop gardens or balcony plants"
   ],
   "trends": "Environmental quality improving due to car-free zones and increased bicycle usage."
 }'::jsonb,
 'medium',
 CURRENT_DATE - 7),

-- Berlin outskirts (suburban)
(52.4567, 13.2987, 'suburban',
 '{
   "vegetation_index": 0.65,
   "air_quality_index": 28,
   "surface_temperature": 17.1,
   "deforestation_risk": 12,
   "water_quality": 82,
   "urban_sprawl_risk": 25
 }'::jsonb,
 '{
   "environmental_score": 85,
   "risk_level": "low",
   "summary": "Suburban area with excellent air quality and moderate vegetation. Some concern about urban sprawl.",
   "detailed_analysis": "Berlin''s suburban areas maintain good environmental quality with clean air and moderate green cover. Urban planning should focus on preventing excessive sprawl.",
   "recommendations": [
     "Support sustainable development practices",
     "Use public transport connections to city center",
     "Maintain garden spaces and local tree cover"
   ],
   "trends": "Stable environmental conditions with careful urban planning maintaining green-suburban balance."
 }'::jsonb,
 'low',
 CURRENT_DATE - 14);

-- =====================================================
-- 5. USER GOALS AND ACHIEVEMENTS
-- =====================================================

INSERT INTO user_goals (user_id, goal_type, target_value, current_value, target_date, status, created_at)
SELECT 
  user_id,
  goal_type,
  target_value,
  current_value,
  target_date,
  status,
  created_at
FROM user_data,
(VALUES
  ('monthly_carbon', 650.0, 847.5, CURRENT_DATE + INTERVAL '3 months', 'in_progress', CURRENT_DATE - INTERVAL '3 months'),
  ('transportation_reduction', 300.0, 425.0, CURRENT_DATE + INTERVAL '2 months', 'in_progress', CURRENT_DATE - INTERVAL '1 month'),
  ('meat_reduction', 4.0, 6.5, CURRENT_DATE + INTERVAL '1 month', 'in_progress', CURRENT_DATE - INTERVAL '2 weeks'),
  ('renewable_energy', 100.0, 0.0, CURRENT_DATE + INTERVAL '1 month', 'pending', CURRENT_DATE - INTERVAL '1 week')
) AS goals(goal_type, target_value, current_value, target_date, status, created_at);

-- =====================================================
-- 6. USER PREFERENCES AND SETTINGS
-- =====================================================

INSERT INTO user_preferences (user_id, preferences, notification_settings, privacy_settings, created_at)
SELECT 
  user_id,
  '{
    "units": "metric",
    "language": "en",
    "currency": "EUR",
    "location_sharing": true,
    "ai_insights": true,
    "community_comparison": true,
    "gamification": true,
    "preferred_transport": ["bicycle", "public_transport", "walking"],
    "dietary_preferences": ["flexitarian"],
    "interests": ["renewable_energy", "sustainable_transport", "urban_gardening"],
    "experience_level": "intermediate"
  }'::jsonb,
  '{
    "weekly_summary": true,
    "goal_reminders": true,
    "ai_recommendations": true,
    "environmental_alerts": false,
    "social_achievements": true,
    "email_frequency": "weekly",
    "push_notifications": true
  }'::jsonb,
  '{
    "data_sharing": "anonymized_only",
    "location_precision": "city_level",
    "profile_visibility": "community",
    "activity_sharing": "summary_only"
  }'::jsonb,
  CURRENT_DATE - INTERVAL '3 months'
FROM user_data;

-- =====================================================
-- 7. RECENT ACTIVITY SUMMARY
-- =====================================================

-- This would typically be generated by a view or function
-- Creating a materialized view for Fabian's recent activity summary

CREATE OR REPLACE VIEW fabian_activity_summary AS
WITH user_data AS (
  SELECT id as user_id FROM user_profiles WHERE email = 'fabian@inuaake.com'
),
recent_emissions AS (
  SELECT 
    category,
    SUM(co2_emitted) as total_co2,
    COUNT(*) as activity_count,
    AVG(co2_emitted) as avg_per_activity
  FROM carbon_tracking ct
  INNER JOIN user_data ud ON ct.user_id = ud.user_id
  WHERE ct.date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY category
),
monthly_totals AS (
  SELECT 
    DATE_TRUNC('month', date) as month,
    SUM(co2_emitted) as monthly_total
  FROM carbon_tracking ct
  INNER JOIN user_data ud ON ct.user_id = ud.user_id
  WHERE ct.date >= CURRENT_DATE - INTERVAL '3 months'
  GROUP BY DATE_TRUNC('month', date)
  ORDER BY month
)
SELECT 
  'fabian@inuaake.com' as user_email,
  (SELECT SUM(total_co2) FROM recent_emissions) as total_monthly_co2,
  (SELECT goal.carbon_goal FROM user_profiles goal WHERE goal.email = 'fabian@inuaake.com') as carbon_goal,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'category', category,
        'co2_emissions', total_co2,
        'percentage', ROUND((total_co2 * 100.0 / (SELECT SUM(total_co2) FROM recent_emissions))::numeric, 1)
      )
    )
    FROM recent_emissions
  ) as category_breakdown,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'month', month,
        'total', monthly_total
      )
      ORDER BY month
    )
    FROM monthly_totals
  ) as monthly_trend;

-- =====================================================
-- 8. SAMPLE COMMUNITY DATA FOR COMPARISON
-- =====================================================

-- Insert some anonymized community data for benchmarking
INSERT INTO community_stats (stat_type, value, period, location, created_at)
VALUES
  ('avg_monthly_co2', 892.5, 'monthly', 'Berlin', CURRENT_DATE),
  ('avg_monthly_co2', 915.2, 'monthly', 'Germany', CURRENT_DATE),
  ('transport_modal_split_bike', 23.5, 'monthly', 'Berlin', CURRENT_DATE),
  ('transport_modal_split_public', 41.2, 'monthly', 'Berlin', CURRENT_DATE),
  ('transport_modal_split_car', 28.8, 'monthly', 'Berlin', CURRENT_DATE),
  ('renewable_energy_adoption', 67.3, 'monthly', 'Berlin', CURRENT_DATE),
  ('local_food_consumption', 34.8, 'monthly', 'Berlin', CURRENT_DATE);

-- =====================================================
-- SUMMARY STATISTICS FOR FABIAN
-- =====================================================

-- View Fabian's current status
SELECT 
  up.full_name,
  up.email,
  up.carbon_goal,
  ROUND(
    (SELECT SUM(co2_emitted) 
     FROM carbon_tracking ct 
     WHERE ct.user_id = up.id 
     AND ct.date >= DATE_TRUNC('month', CURRENT_DATE))::numeric, 1
  ) as current_monthly_co2,
  ROUND(
    ((SELECT SUM(co2_emitted) 
      FROM carbon_tracking ct 
      WHERE ct.user_id = up.id 
      AND ct.date >= DATE_TRUNC('month', CURRENT_DATE)) * 100.0 / up.carbon_goal)::numeric, 1
  ) as goal_progress_percent,
  (SELECT COUNT(*) 
   FROM ai_recommendations ar 
   WHERE ar.user_id = up.id 
   AND ar.feedback_given = 'helpful'
  ) as helpful_recommendations
FROM user_profiles up
WHERE up.email = 'fabian@inuaake.com';

-- =====================================================
-- NOTES FOR USING THIS DATA
-- =====================================================

/*
This dummy data creates a realistic user profile for Fabian that shows:

1. REALISTIC CARBON FOOTPRINT:
   - Total monthly CO2: ~850 kg (above his 650 kg goal)
   - Transportation: 50% of emissions (mainly car usage)
   - Energy: 30% of emissions (reasonable for Berlin)
   - Food: 15% of emissions (mixed diet, reducing meat)
   - Other consumption: 5% of emissions

2. PROGRESSIVE BEHAVIOR:
   - Increasing bicycle usage
   - Experimenting with plant-based foods
   - Some sustainable shopping choices
   - Active recycling and composting

3. AI RECOMMENDATIONS:
   - Context-aware (mentions Berlin infrastructure)
   - Specific and actionable
   - Quantified impact estimates
   - Mixed feedback (mostly helpful)

4. LOCATION-SPECIFIC DATA:
   - Berlin-area satellite data points
   - German/European context in recommendations
   - Local environmental conditions

5. GROWTH TRAJECTORY:
   - Shows improvement over time
   - Realistic challenges (business travel impact)
   - Goal-oriented behavior

To use this data:
1. Ensure all schema tables exist first
2. Run this script in your Supabase SQL editor
3. The user can log in with fabian@inuaake.com
4. All features will have realistic data to demonstrate

This creates a comprehensive test environment that showcases
all platform features with realistic, relatable data.
*/
