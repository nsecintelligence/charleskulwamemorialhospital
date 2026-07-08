-- Specialist Doctors (Madaktari Bingwa) timetable table
CREATE TABLE IF NOT EXISTS specialist_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualification TEXT,
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- Doctor schedule table (for weekly timetable)
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  doctor_id UUID NOT NULL REFERENCES specialist_doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  notes TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(doctor_id, day_of_week)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_specialist_doctors_active ON specialist_doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_specialist_doctors_order ON specialist_doctors(display_order);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_day ON doctor_schedules(day_of_week);

-- Enable RLS
ALTER TABLE specialist_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for specialist_doctors (read-only for public, admin can manage)
CREATE POLICY "public_read_specialist_doctors" ON specialist_doctors FOR SELECT
  TO public USING (is_active = TRUE);

CREATE POLICY "authenticated_read_specialist_doctors" ON specialist_doctors FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_insert_specialist_doctors" ON specialist_doctors FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_update_specialist_doctors" ON specialist_doctors FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_delete_specialist_doctors" ON specialist_doctors FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies for doctor_schedules (read-only for public, admin can manage)
CREATE POLICY "authenticated_read_schedules" ON doctor_schedules FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "anon_read_schedules" ON doctor_schedules FOR SELECT
  TO anon USING (
    EXISTS (SELECT 1 FROM specialist_doctors WHERE id = doctor_id AND is_active = TRUE)
  );

CREATE POLICY "admin_insert_schedules" ON doctor_schedules FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_update_schedules" ON doctor_schedules FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_delete_schedules" ON doctor_schedules FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-update timestamps
DROP TRIGGER IF EXISTS update_specialist_doctors_timestamp ON specialist_doctors;
CREATE TRIGGER update_specialist_doctors_timestamp
  BEFORE UPDATE ON specialist_doctors
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_doctor_schedules_timestamp ON doctor_schedules;
CREATE TRIGGER update_doctor_schedules_timestamp
  BEFORE UPDATE ON doctor_schedules
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
