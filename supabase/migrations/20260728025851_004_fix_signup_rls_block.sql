/*
# Fix signup: profile insert blocked by RLS during trigger

## Root cause
The `handle_new_user()` trigger fires AFTER INSERT on auth.users, but the new
auth user does not yet have the `authenticated` role at that moment. The only
INSERT policy on `profiles` was scoped `TO authenticated`, so the trigger's
INSERT was rejected by RLS — producing "Database error saving new user".

## Fix
1. Recreate handle_new_user() as SECURITY DEFINER owned by postgres so it
   bypasses RLS entirely when inserting the profile row.
2. Re-grant the necessary table privileges so the function can write.
3. Add a defensive `ON CONFLICT DO NOTHING` so a duplicate profile row never
   breaks a re-run.
*/

-- Ensure privileges on profiles for the migrator/postgres role
GRANT ALL ON public.profiles TO postgres, authenticated, anon;

-- Recreate the trigger function, bypassing RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;

-- Make sure the trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
