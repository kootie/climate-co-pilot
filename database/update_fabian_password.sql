-- =====================================================
-- UPDATE FABIAN'S PASSWORD
-- Set password to Letmein@999 for fabian@inuaake.com
-- =====================================================

-- Note: This updates the password in Supabase Auth
-- You need to run this in the Supabase dashboard SQL editor
-- or use the Supabase Auth API

-- Method 1: Using Supabase Auth API (recommended)
-- Go to Supabase Dashboard > Authentication > Users
-- Find fabian@inuaake.com and click "Reset Password"
-- Or use the following in your app:

-- Method 2: Direct SQL update (if you have access)
-- WARNING: This bypasses Supabase Auth security measures
-- Only use if you have direct database access

-- Check if user exists
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'fabian@inuaake.com';

-- Note: Password hashing and updates should be done through Supabase Auth API
-- The auth.users table is managed by Supabase and direct password updates
-- are not recommended as they bypass security measures.

-- =====================================================
-- RECOMMENDED APPROACH: Use Supabase Dashboard
-- =====================================================

/*
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Find the user with email: fabian@inuaake.com
4. Click on the user row
5. Click "Reset Password" or "Send Magic Link"
6. Or manually update the password in the user details

Alternatively, you can create the user with the desired password:
*/

-- =====================================================
-- CREATE USER WITH SPECIFIC PASSWORD (if user doesn't exist)
-- =====================================================

-- This would be done through the Supabase Auth signup API
-- Example using JavaScript/TypeScript:

/*
import { supabase } from './supabase'

const { data, error } = await supabase.auth.signUp({
  email: 'fabian@inuaake.com',
  password: 'Letmein@999',
  options: {
    data: {
      full_name: 'Fabian Muller'
    }
  }
})
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if user profile exists
SELECT 
  id,
  email,
  full_name,
  carbon_goal,
  location,
  created_at
FROM user_profiles 
WHERE email = 'fabian@inuaake.com';

-- Check user's carbon tracking data
SELECT 
  COUNT(*) as activity_count,
  SUM(co2_emitted) as total_co2,
  MIN(date) as first_activity,
  MAX(date) as last_activity
FROM carbon_tracking ct
JOIN user_profiles up ON ct.user_id = up.id
WHERE up.email = 'fabian@inuaake.com';

-- =====================================================
-- NOTES
-- =====================================================

/*
IMPORTANT: Password management in Supabase

1. Supabase Auth handles password hashing and security
2. Passwords are stored securely and cannot be viewed in plain text
3. Direct manipulation of auth.users table is not recommended
4. Use Supabase Auth API or Dashboard for password management

To set the password to "Letmein@999":

Option A - Supabase Dashboard:
1. Go to Authentication > Users
2. Find fabian@inuaake.com
3. Edit user and set new password

Option B - Auth API:
1. Use supabase.auth.signUp() for new users
2. Use supabase.auth.resetPasswordForEmail() for existing users
3. Use admin API if you have service role key

Option C - Manual user creation in your app:
1. Add signup form
2. Use the credentials: fabian@inuaake.com / Letmein@999
3. This will create the auth user and trigger profile creation
*/
