-- Disable Row Level Security on assets table
-- This allows the application to read/write without authentication
ALTER TABLE "assets" DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled but allow all operations,
-- uncomment these policies instead:
--
-- CREATE POLICY "Allow all operations on assets" ON "assets"
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);
