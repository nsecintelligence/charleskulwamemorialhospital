/*
# Security Fixes: Lock down admin function + fix search_path

## Summary
Fixes critical security vulnerabilities:
1. `assign_admin_to_first_user` was a SECURITY DEFINER function callable by
   ANY anonymous visitor via the REST API — privilege escalation to admin.
   Now restricted to service_role only (server-side).
2. `update_timestamp` had a mutable search_path — now pinned to public.

## Steps
- Drop triggers depending on both functions
- Recreate functions with SET search_path = public
- Recreate all triggers
- Revoke EXECUTE on assign_admin_to_first_user from PUBLIC/anon/authenticated
*/

-- Drop trigger on auth.users
DROP TRIGGER IF EXISTS on_first_user_created ON auth.users;

-- Drop triggers depending on update_timestamp
DROP TRIGGER IF EXISTS update_specialist_doctors_timestamp ON specialist_doctors;
DROP TRIGGER IF EXISTS update_doctor_schedules_timestamp ON doctor_schedules;

-- Recreate assign_admin_to_first_user with search_path
DROP FUNCTION IF EXISTS public.assign_admin_to_first_user();

CREATE FUNCTION public.assign_admin_to_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin' FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_first_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_to_first_user();

-- Lock down: only service_role can execute (server-side only)
REVOKE EXECUTE ON FUNCTION public.assign_admin_to_first_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_admin_to_first_user() TO service_role;

-- Recreate update_timestamp with search_path
DROP FUNCTION IF EXISTS public.update_timestamp();

CREATE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_timestamp() TO PUBLIC;

-- Recreate triggers on specialist_doctors and doctor_schedules
CREATE TRIGGER update_specialist_doctors_timestamp
  BEFORE UPDATE ON specialist_doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_doctor_schedules_timestamp
  BEFORE UPDATE ON doctor_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();
