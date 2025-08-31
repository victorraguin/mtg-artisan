/*
  # Fix profiles RLS policies

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create simple, safe policies for profiles table
    - Ensure no circular references in policy definitions

  2. New Policies
    - Users can read their own profile using simple uid() = id check
    - Users can update their own profile
    - Remove admin policy that was causing recursion
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create simple, safe policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);