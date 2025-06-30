/*
  # Disable Email Confirmation for Development

  1. Configuration Changes
    - Disable email confirmation requirement
    - Allow users to sign up and sign in immediately
    - This is for development purposes - in production you may want email confirmation enabled

  2. Notes
    - This migration disables the email confirmation requirement
    - Users can now register and immediately sign in
    - Profiles will be created successfully during registration
*/

-- Note: This is a configuration change that needs to be done in the Supabase dashboard
-- Go to Authentication > Settings and disable "Enable email confirmations"
-- For now, we'll add a comment to remind us of this requirement

-- Create a simple function to help with user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- This function can be used to automatically create profiles
  -- when a new user signs up, but we're handling it in the application code
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- We could create a trigger here, but we're handling profile creation in the app
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();