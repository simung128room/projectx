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
    password_hash text,
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
