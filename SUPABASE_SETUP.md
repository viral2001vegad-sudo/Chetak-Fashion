# Supabase Database Setup & Migration Guide

This document contains the complete SQL query scripts to set up a **Fresh Client Account** or **Update an Existing Database** for **Chetak Fashion**.

---

## 📋 How to Run SQL in Client's Supabase Account

1. Log in to the client's **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select the client project.
3. Click on the **SQL Editor** (`>_` icon) in the left sidebar menu.
4. Click **+ New Query**.
5. Copy one of the SQL scripts below, paste it into the query box, and click **RUN** (or `Ctrl + Enter`).

---

## ⚡ OPTION 1: Update Existing Client Database (Keep All Data)

If the client already has a running database and you just want to add the new columns (`custom_fields`, `youtube_url`, `pdf_url`, `tutorial_videos` table, etc.) without deleting any existing data, run this query:

```sql
-- 1. ADD NEW COLUMNS TO PRODUCTS TABLE
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS volume TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS top_fabric TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bottom_fabric TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS dupatta_fabric TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;

-- 2. CREATE TUTORIAL VIDEOS TABLE (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.tutorial_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'Manage Catalog',
  action_text TEXT,
  action_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE RLS & POLICIES FOR TUTORIAL VIDEOS
ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read tutorial_videos" ON public.tutorial_videos;
DROP POLICY IF EXISTS "Allow admin full manage tutorial_videos" ON public.tutorial_videos;
CREATE POLICY "Allow public read tutorial_videos" ON public.tutorial_videos FOR SELECT USING (true);
CREATE POLICY "Allow admin full manage tutorial_videos" ON public.tutorial_videos FOR ALL USING (true);
```

---

## 🚀 OPTION 2: Complete Fresh Database Setup (For New Client Account)

Use this script when setting up a brand-new Supabase project for a client from scratch (creates all tables, RLS policies, default admin credentials, and default settings).

```sql
-- =========================================================
-- CHETAK FASHION COMPLETE FRESH DATABASE SETUP SQL
-- Copy & Paste this ENTIRE script into Supabase SQL Editor
-- =========================================================

-- 0. DROP ALL EXISTING TABLES & POLICIES (CLEAN RESET)
DROP TABLE IF EXISTS public.tutorial_videos CASCADE;
DROP TABLE IF EXISTS public.admin_device_lock CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.enquiries CASCADE;
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

-- 1. CATEGORIES TABLE
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (Includes YouTube Video, PDF Catalog & Dynamic Custom Fields)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  volume TEXT,
  brand_name TEXT,
  top_fabric TEXT,
  bottom_fabric TEXT,
  dupatta_fabric TEXT,
  description TEXT,
  price NUMERIC,
  price_visible BOOLEAN DEFAULT TRUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  in_stock BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  preview_image TEXT,
  youtube_url TEXT,
  pdf_url TEXT,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  view_count INT DEFAULT 0,
  enquiry_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BANNERS TABLE
CREATE TABLE public.banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORE SETTINGS TABLE
CREATE TABLE public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMIN USERS TABLE
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  business_name TEXT DEFAULT 'Chetak Fashion',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAGE VIEWS ANALYTICS TABLE
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENQUIRIES ANALYTICS TABLE
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_ids UUID[] NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN DEVICE LOCK TABLE FOR SINGLE-DEVICE AUTH
CREATE TABLE public.admin_device_lock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TUTORIAL VIDEOS TABLE
CREATE TABLE public.tutorial_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'Manage Catalog',
  action_text TEXT,
  action_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 11. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_device_lock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;

-- 12. CREATE RLS POLICIES
CREATE POLICY "Allow public read tutorial_videos" ON public.tutorial_videos FOR SELECT USING (true);
CREATE POLICY "Allow admin full manage tutorial_videos" ON public.tutorial_videos FOR ALL USING (true);

CREATE POLICY "Allow public read active categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin full manage categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow public read visible products" ON public.products FOR SELECT USING (is_hidden = false);
CREATE POLICY "Allow admin full access to products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to banners" ON public.banners FOR ALL USING (true);

CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to store_settings" ON public.store_settings FOR ALL USING (true);

CREATE POLICY "Allow admin full manage admin_users" ON public.admin_users FOR ALL USING (true);

CREATE POLICY "Allow public insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role full manage admin_device_lock" ON public.admin_device_lock FOR ALL USING (true);

-- 13. SEED DEFAULT ADMIN LOGIN CREDENTIALS
-- Email: admin@chetakfashion.com
-- Password: admin123
INSERT INTO public.admin_users (id, email, password_hash, business_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@chetakfashion.com',
  '$2a$10$SIB3rwV48dmQeruyj7JUUekv3jbZPox3IBR6tKO71klDQFgiDZOF6',
  'Chetak Fashion'
)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 14. SEED DEFAULT STORE SETTINGS
INSERT INTO public.store_settings (id, config)
VALUES (
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
    "logoPath": "/logo.png",
    "colors": {
      "primary": "#98161E",
      "primaryDark": "#7C151B",
      "accent": "#D4AF37",
      "background": "#FAFAFA"
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
```

---

## 🔑 Default Credentials After Fresh Setup:
- **Admin Login Email**: `admin@chetakfashion.com`
- **Admin Login Password**: `admin123`
