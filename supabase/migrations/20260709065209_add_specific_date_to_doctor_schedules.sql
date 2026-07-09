
-- Allow day_of_week to be nullable (for date-specific entries)
ALTER TABLE doctor_schedules ALTER COLUMN day_of_week DROP NOT NULL;

-- Add specific_date column: when set, schedule is for that exact date only
ALTER TABLE doctor_schedules ADD COLUMN IF NOT EXISTS specific_date date NULL;
