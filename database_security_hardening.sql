-- Project X security hardening migration
-- Run this in Supabase SQL editor (or psql) after backing up production data.

BEGIN;

-- Atomic duplicate protection for TrueMoney vouchers and bank slips.
CREATE TABLE IF NOT EXISTS public.vouchers (
  id text PRIMARY KEY,
  voucher_hash text UNIQUE NOT NULL,
  uid text REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  amount numeric,
  used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.slips (
  id text PRIMARY KEY,
  trans_ref text UNIQUE NOT NULL,
  uid text REFERENCES public.users(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Columns used by atomic Discord/license and API-key hardening.
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS date timestamptz;
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS date timestamptz;
ALTER TABLE public.used_keys ADD COLUMN IF NOT EXISTS used_at timestamptz;
ALTER TABLE public.license_keys ADD COLUMN IF NOT EXISTS used_at timestamptz;
ALTER TABLE public.license_keys ADD COLUMN IF NOT EXISTS key_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_license_keys_key ON public.license_keys(key);
CREATE INDEX IF NOT EXISTS idx_license_keys_status ON public.license_keys(status);

ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS key_hash text;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS key_prefix text;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS last_used timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON public.api_keys(status);

-- Helpful indexes for user-owned history APIs.
CREATE INDEX IF NOT EXISTS idx_purchases_user_id_date ON public.purchases(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_topups_uid_date ON public.topups(uid, date DESC);
CREATE INDEX IF NOT EXISTS idx_used_keys_uid_used_at ON public.used_keys(uid, used_at DESC);

-- Enable row-level security for tables that may be exposed by Supabase REST.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slips ENABLE ROW LEVEL SECURITY;

-- Public read-only catalog policies. Backend service-role still bypasses RLS.
DROP POLICY IF EXISTS products_public_read_active ON public.products;
CREATE POLICY products_public_read_active ON public.products
  FOR SELECT TO anon, authenticated
  USING (coalesce(active, true) = true);

DROP POLICY IF EXISTS categories_public_read ON public.categories;
CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS custom_pages_public_read_non_virtual ON public.custom_pages;
CREATE POLICY custom_pages_public_read_non_virtual ON public.custom_pages
  FOR SELECT TO anon, authenticated
  USING (slug IS NULL OR (slug NOT LIKE 'v:%' AND slug NOT LIKE '_sys_virtual_db_col_::%'));

-- User-owned data policies.
DROP POLICY IF EXISTS users_read_self ON public.users;
CREATE POLICY users_read_self ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id);

DROP POLICY IF EXISTS users_update_self_limited ON public.users;
CREATE POLICY users_update_self_limited ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS purchases_read_self ON public.purchases;
CREATE POLICY purchases_read_self ON public.purchases
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS topups_read_self ON public.topups;
CREATE POLICY topups_read_self ON public.topups
  FOR SELECT TO authenticated
  USING (auth.uid()::text = uid OR auth.uid()::text = user_id);

DROP POLICY IF EXISTS used_keys_read_self ON public.used_keys;
CREATE POLICY used_keys_read_self ON public.used_keys
  FOR SELECT TO authenticated
  USING (auth.uid()::text = uid);

-- Never expose secrets or payment replay tables to client roles by default.
DROP POLICY IF EXISTS license_keys_no_client_access ON public.license_keys;
CREATE POLICY license_keys_no_client_access ON public.license_keys
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS api_keys_no_client_access ON public.api_keys;
CREATE POLICY api_keys_no_client_access ON public.api_keys
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS vouchers_no_client_access ON public.vouchers;
CREATE POLICY vouchers_no_client_access ON public.vouchers
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS slips_no_client_access ON public.slips;
CREATE POLICY slips_no_client_access ON public.slips
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMIT;
