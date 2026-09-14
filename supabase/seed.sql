-- =========================================================
-- CHETAK FASHION SUPABASE COMPLETE DATABASE SETUP & SEED SQL
-- Paste this ENTIRE script into Supabase SQL Editor and click RUN
-- =========================================================

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  price_visible boolean default true,
  category_id uuid references public.categories(id) on delete set null,
  images text[] not null default '{}',
  in_stock boolean default true,
  is_hidden boolean default false,
  is_featured boolean default false,
  is_locked boolean default false,
  password_hash text,
  preview_image text,
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

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.page_views enable row level security;
alter table public.enquiries enable row level security;

-- DROP OLD POLICIES IF RE-RUNNING
drop policy if exists "Allow public read active categories" on public.categories;
drop policy if exists "Allow admin full manage categories" on public.categories;
drop policy if exists "Allow public read visible products" on public.products;
drop policy if exists "Allow admin full access to products" on public.products;
drop policy if exists "Allow public insert page_views" on public.page_views;
drop policy if exists "Allow public insert enquiries" on public.enquiries;

-- CREATE FRESH POLICIES
create policy "Allow public read active categories" on public.categories for select using (true);
create policy "Allow admin full manage categories" on public.categories for all using (true);

create policy "Allow public read visible products" on public.products for select using (is_hidden = false);
create policy "Allow admin full access to products" on public.products for all using (true);

create policy "Allow public insert page_views" on public.page_views for insert with check (true);
create policy "Allow public insert enquiries" on public.enquiries for insert with check (true);

-- 7. INSERT DEFAULT CATEGORIES
insert into public.categories (id, name, sort_order)
values 
  ('11111111-1111-1111-1111-111111111111', 'Fancy Printed Suits', 1),
  ('22222222-2222-2222-2222-222222222222', 'Cotton Suit Collections', 2)
on conflict (id) do update set name = excluded.name;

-- 8. INSERT THE 2 CHETAK FASHION PRODUCTS
insert into public.products (
  id,
  name,
  description,
  price,
  price_visible,
  category_id,
  images,
  in_stock,
  is_hidden,
  is_featured,
  is_locked,
  sort_order
)
values (
  '33333333-3333-3333-3333-333333333333',
  '👉 GHOOMAR 👈 Vol 07 Rayon Cotton Suit Material',
  '👚 Top: RAYON COTTON PRINT Kat Dana , Dhagatikali combo WORK (2.50MTR)
👖 Bottom: RAYON COTTON (2.50MTR)
🧣 Dupatta: RAYON COTTON PRINT (2.25 MTR)
📦 Packing: 8 Pcs Photo + Pauch + Bag (Billing Plus GST)

CHETAK FASHION SURAT
(Mfg. of Exclusive Cotton Dress Material Fabric)',
  535,
  true,
  '11111111-1111-1111-1111-111111111111',
  array['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
  true,
  false,
  true,
  false,
  1
),
(
  '44444444-4444-4444-4444-444444444444',
  'Chetak Soft Cotton Swarovski Diamond 💎 Suit Set',
  '👗 Top: Print Soft Cotton Best Quality Swarovski Diamond 💎 & Plain (2.50MTR)
👖 Bottom: Soft Cotton (2.50MTR)
🧣 Dupatta: Cotton Print (2.00 MTR)
📦 Packing: 08 Pcs Pauch + Bag + Catalog (Billing Plus GST)

CHETAK FASHION SURAT
(Mfg. of Exclusive Cotton Dress Material Fabric)',
  275,
  true,
  '22222222-2222-2222-2222-222222222222',
  array['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80'],
  true,
  false,
  true,
  false,
  2
)
on conflict (id) do update set 
  name = excluded.name,
  description = excluded.description,
  price = excluded.price;
