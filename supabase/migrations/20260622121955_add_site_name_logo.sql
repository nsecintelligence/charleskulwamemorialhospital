/*
# Add site_name and site_logo_url to homepage_content

1. Modified Tables
- `homepage_content`
  - Added `site_name` (text) — the hospital name displayed in navbar, footer, and admin
  - Added `site_logo_url` (text) — optional logo image URL

2. Important Notes
- These fields are used globally across all pages via the navbar and footer.
*/

ALTER TABLE homepage_content
ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'City Hospital';

ALTER TABLE homepage_content
ADD COLUMN IF NOT EXISTS site_logo_url text;

UPDATE homepage_content
SET site_name = 'City Hospital', site_logo_url = NULL;
