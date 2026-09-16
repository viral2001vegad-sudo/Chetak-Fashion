# Supabase Database Setup & Reset Guide

This guide contains the complete SQL query script to set up or clean reset your Supabase Database for the **Chetak Fashion** application.

---

## 📋 Instructions for Supabase SQL Editor

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project (`shafiioaxfvtjfahumvv`).
3. Click on the **SQL Editor** (`>_` icon) in the left sidebar.
4. Click **+ New Query**.
5. Copy the SQL script below, paste it into the query editor, and click **RUN**.

---

## 💻 Clean Database Reset SQL Query (0 Products)

```sql
-- =========================================================
-- CHETAK FASHION SUPABASE COMPLETE FRESH DATABASE RESET SQL
-- Copy & Paste this ENTIRE script into Supabase SQL Editor and click RUN
-- =========================================================

-- 0. DROP ALL EXISTING TABLES & POLICIES (CLEAN RESET)
drop table if exists public.admin_device_lock cascade;
drop table if exists public.admin_users cascade;
drop table if exists public.enquiries cascade;
drop table if exists public.page_views cascade;
drop table if exists public.banners cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.store_settings cascade;

-- 1. CATEGORIES TABLE (Empty)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2. PRODUCTS TABLE (Empty)
create table public.products (
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

-- 3. BANNERS TABLE (Empty)
create table public.banners (
  id text primary key,
  title text not null,
  subtitle text,
  badge text,
  image_url text,
  link_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 4. STORE SETTINGS TABLE
create table public.store_settings (
  id text primary key default 'main',
  config jsonb not null,
  updated_at timestamptz default now()
);

-- 5. ADMIN USERS TABLE
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  business_name text default 'Chetak Fashion',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. PAGE VIEWS ANALYTICS TABLE
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  visited_at timestamptz default now()
);

-- 7. ENQUIRIES ANALYTICS TABLE
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  product_ids uuid[] not null,
  sent_at timestamptz default now()
);

-- 8. ADMIN DEVICE LOCK TABLE FOR SINGLE-DEVICE AUTH
create table public.admin_device_lock (
  id uuid primary key default gen_random_uuid(),
  admin_user_id text not null unique,
  device_id text not null,
  is_active boolean not null default true,
  registered_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.store_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.page_views enable row level security;
alter table public.enquiries enable row level security;
alter table public.admin_device_lock enable row level security;

-- 11. CREATE POLICIES
create policy "Allow public read active categories" on public.categories for select using (true);
create policy "Allow admin full manage categories" on public.categories for all using (true);

create policy "Allow public read visible products" on public.products for select using (is_hidden = false);
create policy "Allow admin full access to products" on public.products for all using (true);

create policy "Allow public read banners" on public.banners for select using (true);
create policy "Allow admin full access to banners" on public.banners for all using (true);

create policy "Allow public read store_settings" on public.store_settings for select using (true);
create policy "Allow admin full access to store_settings" on public.store_settings for all using (true);

create policy "Allow admin full manage admin_users" on public.admin_users for all using (true);

create policy "Allow public insert page_views" on public.page_views for insert with check (true);
create policy "Allow public insert enquiries" on public.enquiries for insert with check (true);

create policy "Allow service role full manage admin_device_lock" on public.admin_device_lock for all using (true);

-- 12. SEED DEFAULT ADMIN LOGIN CREDENTIALS ONLY
-- Email: admin@chetakfashion.com
-- Password: admin123
insert into public.admin_users (id, email, password_hash, business_name)
values (
  '00000000-0000-0000-0000-000000000001',
  'admin@chetakfashion.com',
  '$2a$10$SIB3rwV48dmQeruyj7JUUekv3jbZPox3IBR6tKO71klDQFgiDZOF6',
  'Chetak Fashion'
)
on conflict (email) do update set password_hash = excluded.password_hash;

-- 13. SEED DEFAULT STORE SETTINGS
insert into public.store_settings (id, config)
values (
  'main',
  '{
    "name": "Chetak Fashion",
    "type": "Textile / Saree / Dress Material Store",
    "tagline": "Manufacturer of Exclusive Dress Material Collection",
    "contactPerson": "Pratap Singh",
    "phone": "+91 9724660535",
    "rawPhone": "9724660535",
    "whatsapp": "919724660535",
    "address": "A-1001 To 1003 & 1034 To 1036, 1st Floor, Radha Raman Textile Mkt. (RRTM-1) Saroli, Surat-395010, Gujarat",
    "gstin": "24FLAPS3668L1ZK",
    "instagram": "https://instagram.com/chetakfashion",
    "googleMapsUrl": "https://maps.google.com/?q=Radha+Raman+Textile+Market+Saroli+Surat",
    "logoPath": "/logo.svg",
    "colors": {
      "primary": "#98161E",
      "primaryDark": "#7C151B",
      "accent": "#D4AF37",
      "background": "#FAFAFA"
    }
  }'::jsonb
)
on conflict (id) do nothing;
```

---

## 🔑 Default Credentials After Setup:
- **Admin Email**: `admin@chetakfashion.com`
- **Admin Password**: `admin123`
