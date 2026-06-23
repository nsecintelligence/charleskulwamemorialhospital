/*
# Add top bar content and history image

1. New Table
- `top_bar` — stores editable top bar content and marquee announcements

2. Alter Table
- `about_us` — add `history_image` text

3. Security
- Enable RLS on top_bar
- Add policies for authenticated users
*/

ALTER TABLE about_us ADD COLUMN IF NOT EXISTS history_image text;

CREATE TABLE IF NOT EXISTS top_bar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_phone text NOT NULL DEFAULT '+1 (555) 911-0000',
  working_hours text NOT NULL DEFAULT 'Mon-Sun: 24/7',
  announcements text[] DEFAULT ARRAY[]::text[],
  marquee_speed int DEFAULT 30,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE top_bar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_top_bar" ON top_bar;
CREATE POLICY "select_top_bar" ON top_bar FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "update_top_bar" ON top_bar;
CREATE POLICY "update_top_bar" ON top_bar FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "insert_top_bar" ON top_bar;
CREATE POLICY "insert_top_bar" ON top_bar FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_top_bar" ON top_bar;
CREATE POLICY "delete_top_bar" ON top_bar FOR DELETE
  TO authenticated USING (true);

-- Insert default row if none exists
INSERT INTO top_bar (emergency_phone, working_hours, announcements, is_active)
SELECT '+1 (555) 911-0000', 'Mon-Sun: 24/7', ARRAY[]::text[], true
WHERE NOT EXISTS (SELECT 1 FROM top_bar);
