/*
# Fix infinite recursion in user_roles RLS policies

## Problem
The `admin_read_all_roles` SELECT policy on `user_roles` used a self-referencing subquery:
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
This causes infinite recursion because evaluating that policy itself requires checking
the SELECT policy on `user_roles`, which again runs the same subquery, endlessly.

When any other table's policy (e.g. homepage_content) checks `EXISTS (SELECT 1 FROM user_roles ...)`,
it triggers this same recursive loop, breaking all admin write operations across the app.

## Fix
1. Replace the self-referencing `admin_read_all_roles` SELECT policy with a simple
   `auth.uid() = user_id` check. This is the same as `users_read_own_roles`, so we
   drop the redundant policy and keep only `users_read_own_roles`.
2. The INSERT and DELETE policies also self-reference `user_roles`. We replace them
   with a SECURITY DEFINER function `is_current_user_admin()` that checks the role
   without triggering RLS (since SECURITY DEFINER functions run with the owner's
   privileges and bypass RLS by default).
3. Update all other tables' policies that reference `user_roles` to use the new
   `is_current_user_admin()` function instead of inline subqueries.

## Security
- The `is_current_user_admin()` function is SECURITY DEFINER, owned by the postgres
  superuser, so it bypasses RLS and reads the user_roles table without recursion.
- Only authenticated users can call it (via the policies that reference it).
- The function returns a boolean and does not expose any data.
*/

-- Create a SECURITY DEFINER function to check admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Drop the recursive admin_read_all_roles policy (users_read_own_roles covers it)
DROP POLICY IF EXISTS "admin_read_all_roles" ON user_roles;

-- Replace the recursive INSERT policy
DROP POLICY IF EXISTS "admin_insert_roles" ON user_roles;
CREATE POLICY "admin_insert_roles" ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

-- Replace the recursive DELETE policy
DROP POLICY IF EXISTS "admin_delete_roles" ON user_roles;
CREATE POLICY "admin_delete_roles" ON user_roles FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

-- Update homepage_content policies to use the new function
DROP POLICY IF EXISTS "admin_update_homepage_content" ON homepage_content;
CREATE POLICY "admin_update_homepage_content" ON homepage_content FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "admin_insert_homepage_content" ON homepage_content;
CREATE POLICY "admin_insert_homepage_content" ON homepage_content FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "admin_delete_homepage_content" ON homepage_content;
CREATE POLICY "admin_delete_homepage_content" ON homepage_content FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());
