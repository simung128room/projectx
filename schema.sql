-- SQL Schema for Supabase
-- Run this in your Supabase SQL Editor

-- 1. Table for license keys
CREATE TABLE IF NOT EXISTS public.license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan text NOT NULL, -- e.g., 'Starter', 'Pro', 'Enterprise'
    status text NOT NULL DEFAULT 'active', -- 'active', 'used', 'expired'
    created_at timestamptz DEFAULT now()
);

-- 2. Table for used keys history
CREATE TABLE IF NOT EXISTS public.used_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    ip text NOT NULL,
    details text,
    used_at timestamptz DEFAULT now()
);

-- 3. Table for blocked IPs
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    ip text PRIMARY KEY,
    reason text,
    blocked_at timestamptz DEFAULT now()
);

-- 4. Table for admins
CREATE TABLE IF NOT EXISTS public.admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'admin',
    granted_at timestamptz DEFAULT now()
);

-- Enable RLS (Optional, but recommended. For simple dev, you might keep it disabled)
-- ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.used_keys ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
