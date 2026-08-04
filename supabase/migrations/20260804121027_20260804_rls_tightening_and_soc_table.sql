/*
# Tighten RLS Policies + Create SOC Events Table

## Summary
1. Replaces all admin content-table policies that used USING(true)/WITH CHECK(true)
   with proper admin-role-checking policies. Previously ANY signed-in user could
   modify ALL content. Now only users with role='admin' in user_roles can.
2. Creates the soc_events table for SOC attack monitoring across domains.

## Tables Modified (RLS policies tightened)
- about_us, appointments, contact_info, departments, faq, gallery,
  hero_slides, homepage_content, news, service_prices, services,
  specialist_doctors, top_bar, downloadable_forms, doctor_schedules

## New Tables
- soc_events: Stores security events/attacks with source domain, IP, severity,
  attack vector, geo info, and resolution tracking.

## Security
- soc_events: anon can INSERT (edge function writes), only admins can SELECT/UPDATE/DELETE
- All content tables: admin-only writes, public reads (unchanged)
*/

-- ============================================================
-- Tighten RLS policies on content tables
-- ============================================================

-- about_us
DROP POLICY IF EXISTS "admin_delete_about_us" ON about_us;
DROP POLICY IF EXISTS "admin_insert_about_us" ON about_us;
DROP POLICY IF EXISTS "admin_update_about_us" ON about_us;
CREATE POLICY "admin_delete_about_us" ON about_us FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_about_us" ON about_us FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_about_us" ON about_us FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- appointments
DROP POLICY IF EXISTS "admin_delete_appointments" ON appointments;
DROP POLICY IF EXISTS "admin_select_appointments" ON appointments;
DROP POLICY IF EXISTS "admin_update_appointments" ON appointments;
CREATE POLICY "admin_delete_appointments" ON appointments FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_select_appointments" ON appointments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_appointments" ON appointments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- contact_info
DROP POLICY IF EXISTS "admin_delete_contact_info" ON contact_info;
DROP POLICY IF EXISTS "admin_insert_contact_info" ON contact_info;
DROP POLICY IF EXISTS "admin_update_contact_info" ON contact_info;
CREATE POLICY "admin_delete_contact_info" ON contact_info FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_contact_info" ON contact_info FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_contact_info" ON contact_info FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- departments
DROP POLICY IF EXISTS "admin_delete_departments" ON departments;
DROP POLICY IF EXISTS "admin_insert_departments" ON departments;
DROP POLICY IF EXISTS "admin_update_departments" ON departments;
CREATE POLICY "admin_delete_departments" ON departments FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_departments" ON departments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_departments" ON departments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- faq
DROP POLICY IF EXISTS "admin_delete_faq" ON faq;
DROP POLICY IF EXISTS "admin_insert_faq" ON faq;
DROP POLICY IF EXISTS "admin_update_faq" ON faq;
CREATE POLICY "admin_delete_faq" ON faq FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_faq" ON faq FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_faq" ON faq FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- gallery
DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery;
DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery;
DROP POLICY IF EXISTS "admin_update_gallery" ON gallery;
CREATE POLICY "admin_delete_gallery" ON gallery FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_gallery" ON gallery FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_gallery" ON gallery FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- hero_slides
DROP POLICY IF EXISTS "admin_delete_hero_slides" ON hero_slides;
DROP POLICY IF EXISTS "admin_insert_hero_slides" ON hero_slides;
DROP POLICY IF EXISTS "admin_update_hero_slides" ON hero_slides;
CREATE POLICY "admin_delete_hero_slides" ON hero_slides FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_hero_slides" ON hero_slides FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_hero_slides" ON hero_slides FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- homepage_content
DROP POLICY IF EXISTS "admin_delete_homepage_content" ON homepage_content;
DROP POLICY IF EXISTS "admin_insert_homepage_content" ON homepage_content;
DROP POLICY IF EXISTS "admin_update_homepage_content" ON homepage_content;
CREATE POLICY "admin_delete_homepage_content" ON homepage_content FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_homepage_content" ON homepage_content FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_homepage_content" ON homepage_content FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- news
DROP POLICY IF EXISTS "admin_delete_news" ON news;
DROP POLICY IF EXISTS "admin_insert_news" ON news;
DROP POLICY IF EXISTS "admin_update_news" ON news;
CREATE POLICY "admin_delete_news" ON news FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_news" ON news FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_news" ON news FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- service_prices
DROP POLICY IF EXISTS "admin_delete_service_prices" ON service_prices;
DROP POLICY IF EXISTS "admin_insert_service_prices" ON service_prices;
DROP POLICY IF EXISTS "admin_update_service_prices" ON service_prices;
CREATE POLICY "admin_delete_service_prices" ON service_prices FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_service_prices" ON service_prices FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_service_prices" ON service_prices FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- services
DROP POLICY IF EXISTS "admin_delete_services" ON services;
DROP POLICY IF EXISTS "admin_insert_services" ON services;
DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_services" ON services FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_services" ON services FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- specialist_doctors
DROP POLICY IF EXISTS "admin_delete_specialist_doctors" ON specialist_doctors;
DROP POLICY IF EXISTS "admin_insert_specialist_doctors" ON specialist_doctors;
DROP POLICY IF EXISTS "admin_update_specialist_doctors" ON specialist_doctors;
CREATE POLICY "admin_delete_specialist_doctors" ON specialist_doctors FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_specialist_doctors" ON specialist_doctors FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_specialist_doctors" ON specialist_doctors FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- top_bar
DROP POLICY IF EXISTS "admin_delete_top_bar" ON top_bar;
DROP POLICY IF EXISTS "admin_insert_top_bar" ON top_bar;
DROP POLICY IF EXISTS "admin_update_top_bar" ON top_bar;
CREATE POLICY "admin_delete_top_bar" ON top_bar FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_top_bar" ON top_bar FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_top_bar" ON top_bar FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- downloadable_forms
DROP POLICY IF EXISTS "admin_delete_downloadable_forms" ON downloadable_forms;
DROP POLICY IF EXISTS "admin_insert_downloadable_forms" ON downloadable_forms;
DROP POLICY IF EXISTS "admin_update_downloadable_forms" ON downloadable_forms;
CREATE POLICY "admin_delete_downloadable_forms" ON downloadable_forms FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_downloadable_forms" ON downloadable_forms FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_downloadable_forms" ON downloadable_forms FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- doctor_schedules
DROP POLICY IF EXISTS "admin_delete_doctor_schedules" ON doctor_schedules;
DROP POLICY IF EXISTS "admin_insert_doctor_schedules" ON doctor_schedules;
DROP POLICY IF EXISTS "admin_update_doctor_schedules" ON doctor_schedules;
CREATE POLICY "admin_delete_doctor_schedules" ON doctor_schedules FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_insert_doctor_schedules" ON doctor_schedules FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "admin_update_doctor_schedules" ON doctor_schedules FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- ============================================================
-- NEW: SOC Events table for attack monitoring
-- ============================================================
CREATE TABLE IF NOT EXISTS public.soc_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_domain text NOT NULL DEFAULT 'ckmhospital.org',
  ip_address text,
  user_agent text,
  path text,
  method text,
  attack_vector text,
  payload_snippet text,
  country text,
  country_code text,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_soc_events_created_at ON public.soc_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soc_events_severity ON public.soc_events (severity);
CREATE INDEX IF NOT EXISTS idx_soc_events_event_type ON public.soc_events (event_type);
CREATE INDEX IF NOT EXISTS idx_soc_events_source_domain ON public.soc_events (source_domain);
CREATE INDEX IF NOT EXISTS idx_soc_events_ip_address ON public.soc_events (ip_address);
CREATE INDEX IF NOT EXISTS idx_soc_events_resolved ON public.soc_events (resolved);

ALTER TABLE public.soc_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_soc_events" ON public.soc_events;
CREATE POLICY "anon_insert_soc_events" ON public.soc_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_soc_events" ON public.soc_events;
CREATE POLICY "admin_select_soc_events" ON public.soc_events FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_soc_events" ON public.soc_events;
CREATE POLICY "admin_update_soc_events" ON public.soc_events FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_soc_events" ON public.soc_events;
CREATE POLICY "admin_delete_soc_events" ON public.soc_events FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.soc_events TO anon, authenticated;
