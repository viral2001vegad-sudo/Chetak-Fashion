-- =========================================================
-- CHETAK FASHION CATALOGUE PWA - SUPABASE DATABASE SCHEMA
-- =========================================================

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2. PRODUCTS TABLE (WITH LOCK SUPPORT & HIDING)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  price_visible boolean default true,
  category_id uuid references public.categories(id) on delete set null,
  images text[] not null default '{}',
  in_stock boolean default true,
  is_hidden boolean default false,        -- hidden from public catalogue without deleting
  is_featured boolean default false,
  is_locked boolean default false,        -- password-protected item
  password_hash text,                     -- bcrypt hash, NULL if not locked
  preview_image text,                     -- non-sensitive teaser image shown on locked card
  view_count int default 0,
  enquiry_count int default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ADMIN USERS TABLE
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text default 'Chetak Fashion',
  created_at timestamptz default now()
);

-- 4. PAGE VIEWS ANALYTICS TABLE
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  visited_at timestamptz default now()
);

-- 5. ENQUIRIES ANALYTICS TABLE
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  product_ids uuid[] not null,
  sent_at timestamptz default now()
);

-- 6. SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public Access for Product Images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admin Upload Access for Product Images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');


-- INDEXES FOR FAST QUERYING
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_hidden_locked on public.products(is_hidden, is_locked);
create index if not exists idx_page_views_visited on public.page_views(visited_at);
create index if not exists idx_enquiries_sent on public.enquiries(sent_at);

-- ROW LEVEL SECURITY (RLS) POLICIES

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.page_views enable row level security;
alter table public.enquiries enable row level security;

-- CATEGORIES RLS POLICIES
create policy "Allow public read active categories" on public.categories
  for select using (true);

create policy "Allow admin full manage categories" on public.categories
  for all using (auth.role() = 'authenticated');

-- PRODUCTS RLS POLICIES
-- Public can select non-hidden products (Note: sensitive fields for locked items are stripped at API/View layer)
create policy "Allow public read visible products" on public.products
  for select using (is_hidden = false);

create policy "Allow admin full access to products" on public.products
  for all using (auth.role() = 'authenticated');

-- ADMIN USERS RLS POLICIES
create policy "Allow authenticated user to view own admin record" on public.admin_users
  for select using (auth.uid() = id);

-- PAGE VIEWS RLS POLICIES (Anon insert-only, Admin select)
create policy "Allow public insert page_views" on public.page_views
  for insert with check (true);

create policy "Allow admin read page_views" on public.page_views
  for select using (auth.role() = 'authenticated');

-- ENQUIRIES RLS POLICIES (Anon insert-only, Admin select)
create policy "Allow public insert enquiries" on public.enquiries
  for insert with check (true);

create policy "Allow admin read enquiries" on public.enquiries
  for select using (auth.role() = 'authenticated');
