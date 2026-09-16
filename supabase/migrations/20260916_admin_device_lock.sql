-- =========================================================
-- ADMIN DEVICE LOCK TABLE MIGRATION FOR SUPABASE
-- Run this script in your Supabase SQL Editor
-- =========================================================

create table if not exists public.admin_device_lock (
  id uuid primary key default gen_random_uuid(),
  admin_user_id text not null unique,
  device_id text not null,
  is_active boolean not null default true,
  registered_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.admin_device_lock enable row level security;

-- Policy: Drop if exists to avoid conflicts when re-running
drop policy if exists "Allow service role full manage admin_device_lock" on public.admin_device_lock;
drop policy if exists "Service role manage admin_device_lock" on public.admin_device_lock;

-- Policy: Allow service role full access for server-side verification
create policy "Allow service role full manage admin_device_lock" 
  on public.admin_device_lock 
  for all 
  using (true);

-- Index for fast lookup
create index if not exists idx_admin_device_lock_user 
  on public.admin_device_lock (admin_user_id);
