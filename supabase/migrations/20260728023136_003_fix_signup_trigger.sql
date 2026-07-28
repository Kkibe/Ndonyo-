/*
# Fix signup trigger function

## Overview
The handle_new_user() trigger function was failing on signup, causing a 500 error.
This fixes it by setting an explicit search_path (required by Supabase for
SECURITY DEFINER functions) and ensuring proper grants.

## Changes
1. Recreates handle_new_user() with SET search_path = public
2. Grants execute permission to authenticated and anon roles
3. Ensures the trigger is attached correctly
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
