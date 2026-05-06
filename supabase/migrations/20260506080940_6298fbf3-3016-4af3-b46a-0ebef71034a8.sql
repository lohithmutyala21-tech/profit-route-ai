
-- Restrict SECURITY DEFINER functions
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.get_user_company(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.tg_set_updated_at() from public, anon, authenticated;
-- has_role and get_user_company are still callable inside RLS policy expressions (run as definer), so this is safe.
