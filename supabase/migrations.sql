-- =========================================================================
-- POSAS DATABASE MIGRATIONS - SAAS COMPLIANCE
-- Run this script in the Supabase SQL Editor to prepare your database.
-- =========================================================================

-- 1. PROFILES TABLE (Extend existing profiles table if needed)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    store_name TEXT,
    role TEXT DEFAULT 'owner',
    plan TEXT DEFAULT 'free',
    tenant_id TEXT, -- References workspaces.id or generated legacy tn_*
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free',
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. WORKSPACE MEMBERS TABLE (RBAC)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- owner, admin, manager, cashier
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, user_id)
);

-- 4. WORKSPACE INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    UNIQUE(workspace_id, email)
);

-- 5. SUBSCRIPTIONS TABLE (Billing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status TEXT NOT NULL DEFAULT 'trialing',
    current_period_end TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. USAGE RECORDS TABLE (Feature Gating)
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    metric TEXT NOT NULL, -- 'products', 'transactions', 'members'
    quantity BIGINT NOT NULL DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. AUDIT LOGS TABLE (UU PDP Compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    target_table TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Ensure data tables exist and have RLS enabled
-- Note: Assuming products, customers, transactions, invoices, bookings tables already exist in your Supabase DB.
-- Alter them here to enable RLS if not already enabled.
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS POLICIES (Data Isolation)
-- =========================================================================

-- Helper function to check if current authenticated user is a member of the workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = $1
    AND workspace_members.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check member by string tenant_id (maps tenant_id to workspace ID or legacy owner id)
CREATE OR REPLACE FUNCTION public.is_tenant_member(tenant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user belongs to the workspace with matching ID or legacy tenant_id string
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members wm
    JOIN public.workspaces w ON wm.workspace_id = w.id
    WHERE (w.id::text = $1 OR w.slug = $1 OR w.owner_id::text = REPLACE($1, 'tn_', ''))
    AND wm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for profiles
CREATE POLICY "Users can view and edit their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

-- Policies for workspaces
CREATE POLICY "Members can view workspace details"
    ON public.workspaces FOR SELECT
    USING (public.is_workspace_member(id));

CREATE POLICY "Owners can manage workspace details"
    ON public.workspaces FOR ALL
    USING (auth.uid() = owner_id);

-- Policies for workspace members
CREATE POLICY "Members can view workspace member list"
    ON public.workspace_members FOR SELECT
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Owners and admins can manage workspace members"
    ON public.workspace_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspace_members.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- Policies for workspace invitations
CREATE POLICY "Members can view invitations"
    ON public.workspace_invitations FOR SELECT
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Owners and admins can manage invitations"
    ON public.workspace_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspace_invitations.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- Policies for subscriptions (Workspace members can read, only owners/system can write)
CREATE POLICY "Members can read subscriptions"
    ON public.subscriptions FOR SELECT
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Owners can modify subscriptions"
    ON public.subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspaces
            WHERE workspaces.id = subscriptions.workspace_id
            AND workspaces.owner_id = auth.uid()
        )
    );

-- Policies for usage records (Read-only for workspace members, write-only for system)
CREATE POLICY "Members can view usage records"
    ON public.usage_records FOR SELECT
    USING (public.is_workspace_member(workspace_id));

-- Policies for audit logs (Read-only for owners and managers)
CREATE POLICY "Owners and managers can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = audit_logs.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin', 'manager')
        )
    );

-- Example RLS policies for Data Tables (Products, Customers, Transactions, Invoices, Bookings)
-- Uncomment and adapt these when applying to existing tables:
/*
-- PRODUCTS
CREATE POLICY "Workspace members can read products"
    ON public.products FOR SELECT
    USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Workspace members except cashiers can manage products"
    ON public.products FOR ALL
    USING (
        public.is_tenant_member(tenant_id) AND
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            JOIN public.workspaces w ON wm.workspace_id = w.id
            WHERE (w.id::text = products.tenant_id OR w.slug = products.tenant_id)
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin', 'manager')
        )
    );

-- TRANSACTIONS / INVOICES / BOOKINGS
CREATE POLICY "Workspace members can view transactions"
    ON public.transactions FOR SELECT
    USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Workspace members can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (public.is_tenant_member(tenant_id));
*/

-- =========================================================================
-- DATABASE TRIGGERS
-- =========================================================================

-- Trigger to automatically create a profile and default workspace on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_workspace_id UUID;
    workspace_name TEXT;
    workspace_slug TEXT;
BEGIN
    -- Determine workspace name (use metadata or email)
    workspace_name := COALESCE(new.raw_user_meta_data->>'store_name', 'Toko Baru');
    workspace_slug := 'toko-' || substring(new.id::text from 1 for 8);

    -- 1. Create Profile
    INSERT INTO public.profiles (id, full_name, store_name, role, plan, tenant_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        workspace_name,
        'owner',
        'free',
        'tn_' || substring(new.id::text from 1 for 8)
    );

    -- 2. Create Workspace
    INSERT INTO public.workspaces (name, slug, plan, owner_id)
    VALUES (workspace_name, workspace_slug, 'free', new.id)
    RETURNING id INTO new_workspace_id;

    -- 3. Add user as Owner in Workspace Members
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, new.id, 'owner');

    -- 4. Update tenant_id in Profile to point to workspace UUID
    UPDATE public.profiles
    SET tenant_id = new_workspace_id::text
    WHERE id = new.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (check if trigger already exists first or replace)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
