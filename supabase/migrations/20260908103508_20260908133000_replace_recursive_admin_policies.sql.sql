/*
# Replace remaining recursive admin policy checks

## Purpose
Remove every remaining row-level security policy that directly queries `user_roles`.
Those inline queries can trigger recursive policy evaluation and prevent authenticated
users from entering the Hospital Management System or editing protected content.

## Modified database objects
- Existing policies on public content, security, scheduling, and monitoring tables.
- No tables, columns, or stored data are created, deleted, renamed, or changed.

## Security changes
- Admin policy checks now call `public.is_current_user_admin()`.
- The function reads `public.user_roles` with SECURITY DEFINER privileges, avoiding
  recursive evaluation of the `user_roles` policies.
- Function execution is denied to the public and anonymous roles and granted only to
  authenticated users through policy evaluation.

## Important notes
1. SELECT and DELETE policies receive an admin check in USING.
2. INSERT policies receive an admin check in WITH CHECK.
3. UPDATE policies receive the admin check in both USING and WITH CHECK.
4. Existing policy names and table access intent are preserved.
*/

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

DO $$
DECLARE
  policy_record record;
  policy_table text;
  policy_name text;
BEGIN
  FOR policy_record IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      p.polname AS policy_name,
      p.polcmd AS policy_command,
      pg_get_expr(p.polqual, p.polrelid) AS using_expression,
      pg_get_expr(p.polwithcheck, p.polrelid) AS check_expression
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname <> 'user_roles'
      AND (
        pg_get_expr(p.polqual, p.polrelid) ILIKE '%user_roles%'
        OR pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%user_roles%'
      )
  LOOP
    policy_table := format('%I.%I', policy_record.schema_name, policy_record.table_name);
    policy_name := format('%I', policy_record.policy_name);

    IF policy_record.policy_command IN ('r', 'd') THEN
      EXECUTE format(
        'ALTER POLICY %s ON %s USING (public.is_current_user_admin())',
        policy_name,
        policy_table
      );
    ELSIF policy_record.policy_command = 'a' THEN
      EXECUTE format(
        'ALTER POLICY %s ON %s WITH CHECK (public.is_current_user_admin())',
        policy_name,
        policy_table
      );
    ELSIF policy_record.policy_command = 'w' THEN
      EXECUTE format(
        'ALTER POLICY %s ON %s USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin())',
        policy_name,
        policy_table
      );
    END IF;
  END LOOP;
END $$;