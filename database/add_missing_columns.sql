-- Migration script to add missing columns to existing tables
-- Run this if you already have tables but are missing the co2_kg column

-- Check if carbon_tracking table exists and what columns it has
SELECT 'Current carbon_tracking structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'carbon_tracking' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing co2_kg column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_tracking' 
      AND column_name = 'co2_kg'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE carbon_tracking ADD COLUMN co2_kg DECIMAL(10,2);
    RAISE NOTICE 'Added co2_kg column to carbon_tracking table';
  ELSE
    RAISE NOTICE 'co2_kg column already exists in carbon_tracking table';
  END IF;
END $$;

-- Add missing unit column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_tracking' 
      AND column_name = 'unit'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE carbon_tracking ADD COLUMN unit VARCHAR(50) DEFAULT 'kg';
    RAISE NOTICE 'Added unit column to carbon_tracking table';
  ELSE
    RAISE NOTICE 'unit column already exists in carbon_tracking table';
  END IF;
END $$;

-- Add missing date_recorded column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_tracking' 
      AND column_name = 'date_recorded'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE carbon_tracking ADD COLUMN date_recorded DATE;
    RAISE NOTICE 'Added date_recorded column to carbon_tracking table';
  ELSE
    RAISE NOTICE 'date_recorded column already exists in carbon_tracking table';
  END IF;
END $$;

-- Update existing records to populate co2_kg with co2_emitted values
UPDATE carbon_tracking 
SET co2_kg = co2_emitted 
WHERE co2_kg IS NULL;

-- Update existing records to populate date_recorded with date values
UPDATE carbon_tracking 
SET date_recorded = date 
WHERE date_recorded IS NULL;

-- Verify the updated structure
SELECT 'Updated carbon_tracking structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'carbon_tracking' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test that both columns work
SELECT 'Testing all columns:' as test;
SELECT 
  category, 
  activity_type, 
  co2_emitted, 
  co2_kg, 
  unit,
  date,
  date_recorded
FROM carbon_tracking 
LIMIT 5;

SELECT 'Migration completed successfully!' as status;
