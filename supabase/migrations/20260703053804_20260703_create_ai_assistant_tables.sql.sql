/*
# Create tables for AI Health Assistant features

1. New Tables
- `appointments` - Patient appointment bookings
  - id, patient_name, patient_phone, patient_email, department, service, preferred_date, preferred_time, message, status, created_at
- `downloadable_forms` - Hospital forms for patients
  - id, name, description, file_url, category, sort_order, is_active, created_at
- `service_prices` - Service pricing information
  - id, service_name, category, price, currency, description, is_active, created_at

2. Security
- Enable RLS on all tables.
- Public read for forms and prices (anon + authenticated).
- Anyone can create appointments (anon + authenticated).
*/

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  patient_email text,
  department text,
  service text,
  preferred_date date NOT NULL,
  preferred_time text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Downloadable forms table
CREATE TABLE IF NOT EXISTS downloadable_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Service prices table
CREATE TABLE IF NOT EXISTS service_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  category text,
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'TZS',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloadable_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

-- Public policies for downloadable_forms
DROP POLICY IF EXISTS "public_select_forms" ON downloadable_forms;
CREATE POLICY "public_select_forms" ON downloadable_forms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_forms" ON downloadable_forms;
CREATE POLICY "admin_insert_forms" ON downloadable_forms FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_forms" ON downloadable_forms;
CREATE POLICY "admin_update_forms" ON downloadable_forms FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_forms" ON downloadable_forms;
CREATE POLICY "admin_delete_forms" ON downloadable_forms FOR DELETE
  TO authenticated USING (true);

-- Public policies for service_prices
DROP POLICY IF EXISTS "public_select_prices" ON service_prices;
CREATE POLICY "public_select_prices" ON service_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_prices" ON service_prices;
CREATE POLICY "admin_insert_prices" ON service_prices FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_prices" ON service_prices;
CREATE POLICY "admin_update_prices" ON service_prices FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_prices" ON service_prices;
CREATE POLICY "admin_delete_prices" ON service_prices FOR DELETE
  TO authenticated USING (true);

-- Public policies for appointments (anyone can book)
DROP POLICY IF EXISTS "public_insert_appointments" ON appointments;
CREATE POLICY "public_insert_appointments" ON appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_appointments" ON appointments;
CREATE POLICY "admin_select_appointments" ON appointments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_appointments" ON appointments;
CREATE POLICY "admin_update_appointments" ON appointments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_appointments" ON appointments;
CREATE POLICY "admin_delete_appointments" ON appointments FOR DELETE
  TO authenticated USING (true);