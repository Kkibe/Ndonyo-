/*
# Fix infinite recursion in profiles SELECT policy (corrected)

## Root cause
The select_own_profile policy referenced profiles inside its own policy,
causing infinite recursion.

## Fix
1. Drop the recursive policy.
2. Create a SECURITY DEFINER helper function is_admin(uid) that checks
   the profiles table OUTSIDE of RLS (bypasses it), avoiding recursion.
3. Recreate the policy using the helper function.
*/

DROP POLICY IF EXISTS select_own_profile ON public.profiles;

CREATE OR REPLACE FUNCTION public.is_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_uid AND is_admin = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;

CREATE POLICY select_own_profile ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR public.is_admin(auth.uid())
  );
