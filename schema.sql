-- Full SQL Schema for Supabase with Strong RLS
-- Run this in your Supabase SQL Editor

-- Disable public access entirely to functions
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM public;

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- 1. USERS TABLE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id uuid references auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    balance numeric DEFAULT 0,
    role text DEFAULT 'user',
    isPremium boolean DEFAULT false,
    updatedAt timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
ON public.users FOR ALL 
USING (
  exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  )
);

-- Trigger to create a user entry on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    price numeric,
    stock integer,
    stockData text[],
    description text,
    image text,
    category text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify products" 
ON public.products FOR ALL 
USING (
  exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  )
);

-------------------------------------------------------------------------------
-- 3. PURCHASES TABLE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    userId uuid references auth.users(id),
    username text,
    productName text,
    price numeric,
    date timestamptz DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
ON public.purchases FOR SELECT
USING (auth.uid() = userId);

CREATE POLICY "Admins can view all purchases"
ON public.purchases FOR ALL
USING (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-------------------------------------------------------------------------------
-- 4. TOPUPS TABLE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    userId uuid references auth.users(id),
    username text,
    amount numeric,
    date timestamptz DEFAULT now()
);

ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own topups"
ON public.topups FOR SELECT
USING (auth.uid() = userId);

CREATE POLICY "Admins can manage all topups"
ON public.topups FOR ALL
USING (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-------------------------------------------------------------------------------
-- 5. CATEGORIES TABLE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE,
    sort integer
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify categories"
ON public.categories FOR ALL
USING (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-------------------------------------------------------------------------------
-- 6. CUSTOM PAGES
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_pages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    content text,
    slug text UNIQUE,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pages"
ON public.custom_pages FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify pages"
ON public.custom_pages FOR ALL
USING (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-------------------------------------------------------------------------------
-- 7. LICENSE KEYS / KEYS (Sensitive!)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Deny access by default (Client cannot read keys)
-- Only admins can view/edit keys
CREATE POLICY "Admins can manage license keys"
ON public.license_keys FOR ALL
USING (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-------------------------------------------------------------------------------
-- 8. USED KEYS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.used_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    ip text NOT NULL,
    details text,
    userId uuid references auth.users(id),
    used_at timestamptz DEFAULT now()
);

ALTER TABLE public.used_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own used keys"
ON public.used_keys FOR SELECT
USING (auth.uid() = userId);

CREATE POLICY "Admins manage all used keys"
ON public.used_keys FOR ALL
USING (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-------------------------------------------------------------------------------
-- 9. CONFIG OR SETTINGS (Anti-Leak)
-------------------------------------------------------------------------------
-- Example for site settings where truewallet_phone or line id might live
CREATE TABLE IF NOT EXISTS public.site_config (
    id text PRIMARY KEY,
    key_name text NOT NULL UNIQUE,
    value text,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- If it requires public read (like Line ID for chat), make sure only public keys are readable
CREATE POLICY "Public Config is readable by anyone"
ON public.site_config FOR SELECT
USING (key_name IN ('line_id', 'discord_url', 'site_name', 'popup_link'));

-- Sensitve things like truewallet_phone or private api endpoints ONLY Admin
CREATE POLICY "Private Config readable by admin only"
ON public.site_config FOR SELECT
USING (
  key_name NOT IN ('line_id', 'discord_url', 'site_name', 'popup_link') AND
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

CREATE POLICY "Admins can modify config"
ON public.site_config FOR ALL
USING (
  exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

