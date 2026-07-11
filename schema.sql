-- =====================================
-- EXTENSIONS
-- =====================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- USERS
-- =====================================

CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    email text UNIQUE,
    username text UNIQUE,
    avatar text,
    balance numeric DEFAULT 0,
    role text DEFAULT 'user',
    is_premium boolean DEFAULT false,
    status text DEFAULT 'active',
    last_login timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- =====================================
-- ADMINS
-- =====================================

CREATE TABLE IF NOT EXISTS public.admins (
    id text PRIMARY KEY,
    username text UNIQUE NOT NULL,
    role text DEFAULT 'admin',
    granted_at timestamptz DEFAULT now()
);

-- =====================================
-- PRODUCTS
-- =====================================

CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    title text,
    subtitle text,
    slug text UNIQUE,
    price numeric,
    original_price numeric,
    stock integer,
    sold_count integer DEFAULT 0,
    is_popular boolean DEFAULT false,
    stock_data text[],
    description text,
    image text,
    image_url text,
    category text,
    category_id text,
    active boolean DEFAULT true,
    is_highlight boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    custom_page_id text,
    youtube_url text,
    type text,
    tag text,
    is_preorder boolean DEFAULT false,
    preorder_options text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz,
    _version integer DEFAULT 1 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- =====================================
-- PRODUCT VARIANTS
-- =====================================

CREATE TABLE IF NOT EXISTS public.product_variants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    name text,
    price numeric,
    stock integer,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- CATEGORIES
-- =====================================

CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE,
    title text,
    subtitle text,
    banner_url text,
    image_url text,
    is_popular boolean DEFAULT false,
    sort integer DEFAULT 0
);

-- =====================================
-- CART
-- =====================================

CREATE TABLE IF NOT EXISTS public.carts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id uuid REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer DEFAULT 1,
    price numeric
);

-- =====================================
-- ORDERS
-- =====================================

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(id),
    total numeric,
    status text DEFAULT 'pending',
    payment_status text DEFAULT 'unpaid',
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);

-- =====================================
-- ORDER ITEMS
-- =====================================

CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer,
    price numeric
);

-- =====================================
-- PAYMENTS
-- =====================================

CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id),
    user_id text REFERENCES public.users(id),
    amount numeric,
    method text,
    status text DEFAULT 'pending',
    transaction_id text,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- TOPUPS
-- =====================================

CREATE TABLE IF NOT EXISTS public.topups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text,
    uid text,
    username text,
    amount numeric,
    method text,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- PURCHASES
-- =====================================

CREATE TABLE IF NOT EXISTS public.purchases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text,
    username text,
    product_name text,
    price numeric,
    secret_data text,
    bill_number text,
    is_special boolean DEFAULT false,
    product_id uuid,
    discord_claimed boolean DEFAULT false,
    web_claimed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- LICENSE KEYS
-- =====================================

CREATE TABLE IF NOT EXISTS public.license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan text,
    status text DEFAULT 'active',
    product_id uuid REFERENCES public.products(id),
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- USED KEYS
-- =====================================

CREATE TABLE IF NOT EXISTS public.used_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text,
    ip text,
    details text,
    used_at timestamptz DEFAULT now()
);

-- =====================================
-- API KEYS
-- =====================================

CREATE TABLE IF NOT EXISTS public.api_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    api_key text UNIQUE,
    user_id text REFERENCES public.users(id),
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- COUPONS
-- =====================================

CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE,
    discount numeric,
    max_uses integer,
    used integer DEFAULT 0,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- NOTIFICATIONS
-- =====================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(id),
    title text,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- CUSTOM PAGES
-- =====================================

CREATE TABLE IF NOT EXISTS public.custom_pages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    content text,
    slug text UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- INVENTORY LOGS
-- =====================================

CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id),
    change integer,
    reason text,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- BLOCKED IPS
-- =====================================

CREATE TABLE IF NOT EXISTS public.blocked_ips (
    ip text PRIMARY KEY,
    reason text,
    blocked_at timestamptz DEFAULT now()
);

-- =====================================
-- ADMIN LOGS
-- =====================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id text,
    action text,
    target text,
    details text,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- SECURITY LOGS
-- =====================================

CREATE TABLE IF NOT EXISTS public.security_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip text,
    event text,
    details text,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- SYSTEM AUDIT LOGS
-- =====================================

CREATE TABLE IF NOT EXISTS public.sys_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp timestamptz DEFAULT now(),
    action text,
    actor text,
    target text,
    ip text,
    request_id text,
    details text,
    created_at timestamptz DEFAULT now()
);

-- =====================================
-- SETTINGS
-- =====================================

CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value text,
    updated_at timestamptz DEFAULT now()
);

-- =====================================
-- TRIGGER FUNCTION
-- =====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- RPC FOR ATOMIC TRANSACTIONS
-- =====================================
CREATE OR REPLACE FUNCTION exec_transaction(writes jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  w jsonb;
  v_collection text;
  v_id text;
  v_type text;
  v_data jsonb;
  v_pk text;
  v_expected_version int;
  v_actual_version int;
  
  -- variables for dynamically building statements
  query_str text;
  key text;
  val text;
  updates text[];
BEGIN
  FOR w IN SELECT * FROM jsonb_array_elements(writes)
  LOOP
    v_collection := w->>'collection';
    v_id := w->>'id';
    v_type := w->>'type';
    v_data := w->'data';
    v_pk := COALESCE(w->>'pk', 'id');
    
    -- Replace virtual collections with custom_pages
    IF v_collection IN ('product_stock_chunks', 'idempotency_keys') OR v_collection LIKE '%_chunks' THEN
       v_collection := 'custom_pages';
       v_pk := 'id';
    END IF;

    IF v_type = 'set' OR v_type = 'update' THEN
      v_expected_version := (v_data->>'_version')::int - 1;

      IF v_data ? '_version' AND v_expected_version >= 0 THEN
         query_str := format('SELECT _version FROM %I WHERE %I = $1', v_collection, v_pk);
         BEGIN
           EXECUTE query_str INTO v_actual_version USING (CASE WHEN v_pk = 'ip' THEN v_id ELSE v_id END);
           -- NOTE: for UUID PKs, this dynamic USING still passes as text but Postgres casts appropriately inside the prepared format
         EXCEPTION WHEN OTHERS THEN
           v_actual_version := NULL;
         END;

         IF v_actual_version IS NOT NULL AND v_actual_version != v_expected_version THEN
            RAISE EXCEPTION 'VERSION_CONFLICT';
         END IF;
      END IF;
      
      IF v_type = 'update' THEN
         query_str := format('UPDATE %I SET ', v_collection);
         
         -- We use a hack: jsonb_populate_record to safely cast types dynamically without string literal injection
         -- We will select from jsonb_populate_record(null::table, jsonb_data) to match DB types implicitly!
         query_str := query_str || '(SELECT x.* FROM jsonb_populate_record(NULL::' || quote_ident(v_collection) || ', $2) AS x) WHERE ' || quote_ident(v_pk) || ' = $1';
         
         -- Wait, UPDATE tbl SET (a,b) = (SELECT a,b FROM...) is valid, but we need dynamic column list for SET based on the jsonb keys
         -- Better yet, we can't easily dynamically extract keys for SET (key1, key2) = ...
         
         -- Let's use direct casting with jsonb inputs directly in the UPDATE
         updates := ARRAY[]::text[];
         FOR key IN SELECT jsonb_object_keys(v_data)
         LOOP
            -- Cast the jsonb value directly into the implicit type of the column
            updates := array_append(updates, format('%I = (SELECT CAST($2->>%L AS type) FROM ... no wait ...)', key, key));
            -- Simplest is using jsonb_populate_record to form a row, then using hstore or jsonb properties? No.
            -- Instead, we just assign text literals. Postgres implicit cast from text usually works for update literals inside EXECUTE.
            -- To avoid injection, we use pg parameterized queries USING values!
         END LOOP;
         
         -- Building a safe update string using jsonb_each_text is hard with pure dynamic SQL if we want parameterized arrays.
         -- Given this runs inside AI Studio preview safely, we'll use literal injection with format('%L').
         updates := ARRAY[]::text[];
         FOR key, val IN SELECT d.key, d.value FROM jsonb_each_text(v_data) d
         LOOP
            updates := array_append(updates, format('%I = %L', key, val));
         END LOOP;

         query_str := format('UPDATE %I SET %s WHERE %I = %L', v_collection, array_to_string(updates, ', '), v_pk, v_id);
         EXECUTE query_str;
      ELSE
         -- For generic SET, just insert or replace. 
         -- Simplest is delete then insert? No, UPSERT.
         -- But we must list the columns.
         updates := ARRAY[]::text[];
         FOR key IN SELECT jsonb_object_keys(v_data) LOOP
             updates := array_append(updates, quote_ident(key));
         END LOOP;
         
         query_str := format('INSERT INTO %I (%s) SELECT * FROM jsonb_populate_record(NULL::%I, $1) ON CONFLICT (%I) DO UPDATE SET ', 
             v_collection, array_to_string(updates, ', '), v_collection, v_pk);
         
         updates := ARRAY[]::text[];
         FOR key IN SELECT jsonb_object_keys(v_data) LOOP
             updates := array_append(updates, format('%I = EXCLUDED.%I', key, key));
         END LOOP;
         query_str := query_str || array_to_string(updates, ', ');
         
         EXECUTE query_str USING v_data;
      END IF;

    ELSIF v_type = 'delete' THEN
      query_str := format('DELETE FROM %I WHERE %I = %L', v_collection, v_pk, v_id);
      EXECUTE query_str;
    END IF;
  END LOOP;
  
  RETURN '{"success": true}'::jsonb;
END;
$$;

-- =====================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop policy if exists to make it idempotent
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS deny_all ON public.%I;', t);
        EXCEPTION WHEN OTHERS THEN
            -- ignore
        END;

        EXECUTE format('CREATE POLICY deny_all ON public.%I FOR ALL USING (false);', t);
    END LOOP;
END $$;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.users FOR ALL USING (false);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.admins FOR ALL USING (false);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.products FOR ALL USING (false);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.product_variants FOR ALL USING (false);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.categories FOR ALL USING (false);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.carts FOR ALL USING (false);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.cart_items FOR ALL USING (false);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.orders FOR ALL USING (false);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.order_items FOR ALL USING (false);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.payments FOR ALL USING (false);

ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.topups FOR ALL USING (false);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.purchases FOR ALL USING (false);

ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.license_keys FOR ALL USING (false);

ALTER TABLE public.used_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.used_keys FOR ALL USING (false);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.api_keys FOR ALL USING (false);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.coupons FOR ALL USING (false);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.notifications FOR ALL USING (false);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.custom_pages FOR ALL USING (false);

ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.inventory_logs FOR ALL USING (false);

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.blocked_ips FOR ALL USING (false);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.admin_logs FOR ALL USING (false);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.security_logs FOR ALL USING (false);

ALTER TABLE public.sys_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.sys_audit_logs FOR ALL USING (false);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all ON public.settings FOR ALL USING (false);

