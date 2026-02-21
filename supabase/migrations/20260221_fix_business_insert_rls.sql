-- Fix RLS policy for businesses table to allow INSERT

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own business" ON businesses;

-- Create separate policies for different operations
-- SELECT, UPDATE, DELETE - user must own the business
CREATE POLICY "Users can view own business" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- INSERT - user can only insert with their own user_id
CREATE POLICY "Users can insert own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
