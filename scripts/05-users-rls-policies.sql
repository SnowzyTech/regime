-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own record
-- This allows a user to create their profile when they sign up
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- Policy: Allow users to read their own record
CREATE POLICY "Users can read their own record" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

-- Policy: Allow users to update their own record
CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Policy: Allow service role to do anything (for admin operations)
CREATE POLICY "Service role has full access" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow public to read users (for displaying user info in reviews, etc.)
CREATE POLICY "Public can read basic user info" ON users
  FOR SELECT
  TO anon
  USING (true);
