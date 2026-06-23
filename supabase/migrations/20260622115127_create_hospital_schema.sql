/*
# Hospital Website Database Schema

1. New Tables
- `services` — Hospital services with name, description, image, details
- `departments` — Hospital departments with name, description, image
- `about_us` — Single-row table for hospital history, mission, vision, values, management, achievements
- `gallery` — Photo gallery with image URL, caption, category
- `news` — News articles with title, image, content, publication date
- `faq` — FAQ questions and answers
- `contact_info` — Single-row table for contact details and map location
- `homepage_content` — Single-row table for hero banners, welcome text, featured services, announcements

2. Security
- Enable RLS on all tables.
- Public read access for website visitors (anon + authenticated).
- Admin write access for authenticated users (CMS operations).
*/

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text,
  details text,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- About Us / Hospital Info (single row)
CREATE TABLE IF NOT EXISTS about_us (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  history text NOT NULL DEFAULT '',
  mission text NOT NULL DEFAULT '',
  vision text NOT NULL DEFAULT '',
  core_values text NOT NULL DEFAULT '',
  management text NOT NULL DEFAULT '',
  achievements text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  category text NOT NULL DEFAULT 'general',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- News / Updates table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  featured_image text,
  content text NOT NULL,
  published_at timestamptz DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FAQ table
CREATE TABLE IF NOT EXISTS faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Contact Info (single row)
CREATE TABLE IF NOT EXISTS contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  emergency_phone text NOT NULL DEFAULT '',
  map_embed_url text,
  social_facebook text,
  social_twitter text,
  social_instagram text,
  social_linkedin text,
  updated_at timestamptz DEFAULT now()
);

-- Homepage Content (single row)
CREATE TABLE IF NOT EXISTS homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  welcome_title text NOT NULL DEFAULT '',
  welcome_text text NOT NULL DEFAULT '',
  hero_image_url text,
  hero_cta_text text NOT NULL DEFAULT '',
  hero_cta_link text NOT NULL DEFAULT '',
  announcement_title text,
  announcement_text text,
  announcement_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon + authenticated)
DROP POLICY IF EXISTS "public_select_services" ON services;
CREATE POLICY "public_select_services" ON services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_departments" ON departments;
CREATE POLICY "public_select_departments" ON departments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_about_us" ON about_us;
CREATE POLICY "public_select_about_us" ON about_us FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_gallery" ON gallery;
CREATE POLICY "public_select_gallery" ON gallery FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_news" ON news;
CREATE POLICY "public_select_news" ON news FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_faq" ON faq;
CREATE POLICY "public_select_faq" ON faq FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_contact_info" ON contact_info;
CREATE POLICY "public_select_contact_info" ON contact_info FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_homepage_content" ON homepage_content;
CREATE POLICY "public_select_homepage_content" ON homepage_content FOR SELECT TO anon, authenticated USING (true);

-- Admin write policies (authenticated only)
DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_departments" ON departments;
CREATE POLICY "admin_insert_departments" ON departments FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_departments" ON departments;
CREATE POLICY "admin_update_departments" ON departments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_departments" ON departments;
CREATE POLICY "admin_delete_departments" ON departments FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_about_us" ON about_us;
CREATE POLICY "admin_insert_about_us" ON about_us FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_about_us" ON about_us;
CREATE POLICY "admin_update_about_us" ON about_us FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_about_us" ON about_us;
CREATE POLICY "admin_delete_about_us" ON about_us FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery;
CREATE POLICY "admin_insert_gallery" ON gallery FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_gallery" ON gallery;
CREATE POLICY "admin_update_gallery" ON gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery;
CREATE POLICY "admin_delete_gallery" ON gallery FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_news" ON news;
CREATE POLICY "admin_insert_news" ON news FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_news" ON news;
CREATE POLICY "admin_update_news" ON news FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_news" ON news;
CREATE POLICY "admin_delete_news" ON news FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_faq" ON faq;
CREATE POLICY "admin_insert_faq" ON faq FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_faq" ON faq;
CREATE POLICY "admin_update_faq" ON faq FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_faq" ON faq;
CREATE POLICY "admin_delete_faq" ON faq FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_contact_info" ON contact_info;
CREATE POLICY "admin_insert_contact_info" ON contact_info FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_contact_info" ON contact_info;
CREATE POLICY "admin_update_contact_info" ON contact_info FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_contact_info" ON contact_info;
CREATE POLICY "admin_delete_contact_info" ON contact_info FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_homepage_content" ON homepage_content;
CREATE POLICY "admin_insert_homepage_content" ON homepage_content FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_homepage_content" ON homepage_content;
CREATE POLICY "admin_update_homepage_content" ON homepage_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_homepage_content" ON homepage_content;
CREATE POLICY "admin_delete_homepage_content" ON homepage_content FOR DELETE TO authenticated USING (true);
