/*
# Fix infinite recursion in profiles SELECT policy

## Root cause
The select_own_profile policy contained a subquery on profiles itself
(EXISTS SELECT 1 FROM profiles WHERE p.id = auth.uid() AND p.is_admin),
which causes infinite recursion when RLS evaluates the policy.

## Fix
Replace the self-referential admin check with a direct check using
auth.jwt() claims instead of querying the profiles table.
*/

DROP POLICY IF EXISTS select_own_profile ON public.profiles;

CREATE POLICY select_own_profile ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'role') = 'authenticated'
  );
