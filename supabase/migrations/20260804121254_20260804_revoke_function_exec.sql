/*
# Explicitly revoke EXECUTE on assign_admin_to_first_user from anon and authenticated

The previous migration revoked from PUBLIC, but anon and authenticated roles
still had explicit grants. This removes those grants so only service_role
can call the function.
*/

REVOKE EXECUTE ON FUNCTION public.assign_admin_to_first_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_admin_to_first_user() FROM authenticated;
