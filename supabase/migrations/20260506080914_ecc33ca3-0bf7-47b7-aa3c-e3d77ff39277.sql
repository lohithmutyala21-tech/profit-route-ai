
-- Roles enum
create type public.app_role as enum ('admin', 'member');

-- Companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  industry text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.companies enable row level security;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- User roles (separate table, no recursion risk)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (user_id, company_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer helpers
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.get_user_company(_user_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = _user_id
$$;

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  external_id text,
  location text not null,
  distance numeric not null default 0,
  order_value numeric not null default 0,
  payment_type text not null default 'Prepaid',
  customer_reliability numeric not null default 0.5,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create index orders_company_idx on public.orders(company_id);

-- Learning weights (one row per company)
create table public.learning_weights (
  company_id uuid primary key references public.companies(id) on delete cascade,
  success_weight numeric not null default 0.5,
  value_weight numeric not null default 0.3,
  distance_weight numeric not null default 0.2,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.learning_weights enable row level security;

-- Delivery outcomes
create table public.delivery_outcomes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  delivered boolean not null,
  actual_revenue numeric not null default 0,
  lost_revenue numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.delivery_outcomes enable row level security;
create index outcomes_company_idx on public.delivery_outcomes(company_id);

-- RLS policies: companies
create policy "view own company" on public.companies for select to authenticated
  using (id = public.get_user_company(auth.uid()));
create policy "admin update company" on public.companies for update to authenticated
  using (id = public.get_user_company(auth.uid()) and public.has_role(auth.uid(), 'admin'));
create policy "any auth insert company" on public.companies for insert to authenticated
  with check (true);

-- profiles
create policy "view profiles in company" on public.profiles for select to authenticated
  using (company_id = public.get_user_company(auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid());
create policy "insert own profile" on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- user_roles
create policy "view roles in company" on public.user_roles for select to authenticated
  using (company_id = public.get_user_company(auth.uid()));
create policy "admin manage roles" on public.user_roles for all to authenticated
  using (company_id = public.get_user_company(auth.uid()) and public.has_role(auth.uid(), 'admin'))
  with check (company_id = public.get_user_company(auth.uid()) and public.has_role(auth.uid(), 'admin'));
create policy "self insert role on signup" on public.user_roles for insert to authenticated
  with check (user_id = auth.uid());

-- orders
create policy "company orders select" on public.orders for select to authenticated
  using (company_id = public.get_user_company(auth.uid()));
create policy "company orders insert" on public.orders for insert to authenticated
  with check (company_id = public.get_user_company(auth.uid()));
create policy "company orders update" on public.orders for update to authenticated
  using (company_id = public.get_user_company(auth.uid()));
create policy "company orders delete" on public.orders for delete to authenticated
  using (company_id = public.get_user_company(auth.uid()));

-- learning weights
create policy "company weights select" on public.learning_weights for select to authenticated
  using (company_id = public.get_user_company(auth.uid()));
create policy "company weights upsert" on public.learning_weights for insert to authenticated
  with check (company_id = public.get_user_company(auth.uid()));
create policy "company weights update" on public.learning_weights for update to authenticated
  using (company_id = public.get_user_company(auth.uid()));

-- outcomes
create policy "company outcomes select" on public.delivery_outcomes for select to authenticated
  using (company_id = public.get_user_company(auth.uid()));
create policy "company outcomes insert" on public.delivery_outcomes for insert to authenticated
  with check (company_id = public.get_user_company(auth.uid()));

-- Trigger for updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger companies_updated before update on public.companies
  for each row execute function public.tg_set_updated_at();
create trigger profiles_updated before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- Auto-create profile on signup; company creation handled in client after signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
