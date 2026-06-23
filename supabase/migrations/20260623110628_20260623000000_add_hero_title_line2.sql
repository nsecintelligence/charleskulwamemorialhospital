/*
# Add hero title second line to homepage_content

1. Alter Table
- `homepage_content` — add `welcome_title_line2` (text) for the second line of the hero title

2. Data
- Populate default for existing rows
*/

ALTER TABLE homepage_content
ADD COLUMN IF NOT EXISTS welcome_title_line2 text;

UPDATE homepage_content
SET welcome_title_line2 = 'Hospital'
WHERE welcome_title_line2 IS NULL;
