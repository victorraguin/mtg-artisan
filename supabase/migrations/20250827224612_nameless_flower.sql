/*
  # Add category support to services table

  1. Changes
    - Add `category_id` column to `services` table
    - Add foreign key constraint to `categories` table
    - Update existing services to have null category (optional)

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add category_id column to services table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE services ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;
END $$;