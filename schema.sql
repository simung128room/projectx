-- Full SQL Schema for Supabase
-- Run this in your Supabase SQL Editor

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

CREATE TABLE IF NOT EXISTS public.purchases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    userId text,
    username text,
    productName text,
    price numeric,
    date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.topups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    userId text,
    username text,
    amount numeric,
    date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE,
    sort integer
);

CREATE TABLE IF NOT EXISTS public.custom_pages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    content text,
    slug text UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Existing tables:
CREATE TABLE IF NOT EXISTS public.license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.used_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    ip text NOT NULL,
    details text,
    used_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blocked_ips (
    ip text PRIMARY KEY,
    reason text,
    blocked_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admins (
    id text PRIMARY KEY,
    username text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'admin',
    granted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    email text,
    username text,
    balance numeric DEFAULT 0,
    role text DEFAULT 'user',
    isPremium boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updatedAt timestamptz DEFAULT now()
);
