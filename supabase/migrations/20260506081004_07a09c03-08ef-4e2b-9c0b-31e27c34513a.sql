
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Tighten: only allow inserting a company you'll own (we then assign yourself in the same transaction client-side).
-- Restrict so only authenticated users without an existing company can create one.
drop policy if exists "any auth insert company" on public.companies;
create policy "create company when none" on public.companies for insert to authenticated
  with check (public.get_user_company(auth.uid()) is null);
