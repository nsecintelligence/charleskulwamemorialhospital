/*
# Add Executive Director's Statement fields to homepage_content

1. Modified Tables
- `homepage_content` — adds four new columns for the Executive Director's Statement section:
  - `director_name` (text) — the director's full name
  - `director_title` (text) — the director's title/role (e.g. "Executive Director")
  - `director_statement` (text) — the director's welcome statement/message
  - `director_photo_url` (text) — URL to the director's uploaded photo in storage
2. Security
- No RLS policy changes — `homepage_content` already has existing policies.
- The new columns are editable through the admin panel which uses the same authenticated policies.
3. Notes
- All columns are nullable so existing rows remain valid without backfilling.
- The admin Homepage editor will manage these fields alongside the existing homepage content.
*/

ALTER TABLE homepage_content
  ADD COLUMN IF NOT EXISTS director_name text,
  ADD COLUMN IF NOT EXISTS director_title text,
  ADD COLUMN IF NOT EXISTS director_statement text,
  ADD COLUMN IF NOT EXISTS director_photo_url text;
