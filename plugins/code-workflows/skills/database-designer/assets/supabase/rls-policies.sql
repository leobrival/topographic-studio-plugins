-- Supabase Row Level Security (RLS) Policy Templates
-- Common patterns for secure data access

-- ============================================
-- Basic Patterns
-- ============================================

-- 1. Public read access
CREATE POLICY "Anyone can read"
    ON public.table_name FOR SELECT
    USING (TRUE);

-- 2. Authenticated read access
CREATE POLICY "Authenticated users can read"
    ON public.table_name FOR SELECT
    TO authenticated
    USING (TRUE);

-- 3. Owner-only access
CREATE POLICY "Users can access own data"
    ON public.table_name FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Soft-delete filter
CREATE POLICY "Exclude deleted records"
    ON public.table_name FOR SELECT
    USING (deleted_at IS NULL);

-- ============================================
-- Role-Based Access Control (RBAC)
-- ============================================

-- Helper function: Get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Admin-only access
CREATE POLICY "Admins only"
    ON public.table_name FOR ALL
    TO authenticated
    USING (public.get_user_role() = 'admin');

-- Multiple roles
CREATE POLICY "Admins and members"
    ON public.table_name FOR SELECT
    TO authenticated
    USING (public.get_user_role() IN ('admin', 'member'));

-- Role-based field access (using RLS + views)
CREATE VIEW public.users_public AS
SELECT id, name, avatar_url
FROM public.users
WHERE deleted_at IS NULL;

CREATE VIEW public.users_admin AS
SELECT *
FROM public.users;

-- ============================================
-- Organization-Based Access
-- ============================================

-- Helper: Check org membership
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE user_id = auth.uid()
          AND organization_id = org_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check org admin status
CREATE OR REPLACE FUNCTION public.user_is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE user_id = auth.uid()
          AND organization_id = org_id
          AND role IN ('owner', 'admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Org members can read
CREATE POLICY "Org members can read"
    ON public.org_resources FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_org(organization_id));

-- Only org admins can modify
CREATE POLICY "Org admins can modify"
    ON public.org_resources FOR UPDATE
    TO authenticated
    USING (public.user_is_org_admin(organization_id))
    WITH CHECK (public.user_is_org_admin(organization_id));

-- Org owners can delete
CREATE POLICY "Org owners can delete"
    ON public.org_resources FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE user_id = auth.uid()
              AND organization_id = org_resources.organization_id
              AND role = 'owner'
        )
    );

-- ============================================
-- Content-Based Access
-- ============================================

-- Published content is public
CREATE POLICY "Published content is public"
    ON public.posts FOR SELECT
    USING (status = 'published' AND deleted_at IS NULL);

-- Drafts only visible to author
CREATE POLICY "Authors can view own drafts"
    ON public.posts FOR SELECT
    TO authenticated
    USING (
        author_id = auth.uid() OR
        status = 'published'
    );

-- ============================================
-- Hierarchical Access
-- ============================================

-- Comments inherit post access
CREATE POLICY "Comments follow post visibility"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = comments.post_id
              AND (status = 'published' OR author_id = auth.uid())
        )
    );

-- Child resources inherit parent access
CREATE POLICY "Children inherit parent access"
    ON public.child_resources FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.parent_resources
            WHERE id = child_resources.parent_id
              AND (
                  public.user_belongs_to_org(organization_id) OR
                  is_public = TRUE
              )
        )
    );

-- ============================================
-- Time-Based Access
-- ============================================

-- Scheduled content
CREATE POLICY "Show only published and past scheduled"
    ON public.posts FOR SELECT
    USING (
        status = 'published' AND
        (published_at IS NULL OR published_at <= NOW())
    );

-- Expired access
CREATE POLICY "Check expiration"
    ON public.access_tokens FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() AND
        expires_at > NOW()
    );

-- ============================================
-- Multi-Tenant Patterns
-- ============================================

-- Tenant isolation
CREATE POLICY "Tenant isolation"
    ON public.tenant_data FOR ALL
    TO authenticated
    USING (
        tenant_id = (
            SELECT current_tenant_id
            FROM public.user_sessions
            WHERE user_id = auth.uid()
              AND is_active = TRUE
            LIMIT 1
        )
    );

-- Cross-tenant admin access
CREATE POLICY "Super admin cross-tenant"
    ON public.tenant_data FOR SELECT
    TO authenticated
    USING (
        public.get_user_role() = 'super_admin' OR
        tenant_id = public.get_current_tenant()
    );

-- ============================================
-- Sharing & Collaboration
-- ============================================

-- Shared resources
CREATE TABLE public.resource_shares (
    resource_id UUID NOT NULL,
    resource_type TEXT NOT NULL,
    shared_with UUID REFERENCES public.users(id),
    shared_with_org UUID REFERENCES public.organizations(id),
    permission TEXT NOT NULL, -- 'view', 'edit', 'admin'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_share CHECK (
        (shared_with IS NOT NULL AND shared_with_org IS NULL) OR
        (shared_with IS NULL AND shared_with_org IS NOT NULL)
    )
);

-- Check share access
CREATE OR REPLACE FUNCTION public.has_resource_access(
    p_resource_id UUID,
    p_resource_type TEXT,
    p_min_permission TEXT DEFAULT 'view'
)
RETURNS BOOLEAN AS $$
DECLARE
    permission_levels TEXT[] := ARRAY['view', 'edit', 'admin'];
    min_level INT;
BEGIN
    min_level := array_position(permission_levels, p_min_permission);

    RETURN EXISTS (
        SELECT 1 FROM public.resource_shares rs
        WHERE rs.resource_id = p_resource_id
          AND rs.resource_type = p_resource_type
          AND (
              rs.shared_with = auth.uid() OR
              rs.shared_with_org IN (
                  SELECT organization_id
                  FROM public.organization_members
                  WHERE user_id = auth.uid()
              )
          )
          AND array_position(permission_levels, rs.permission) >= min_level
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Policy using share function
CREATE POLICY "Shared resource access"
    ON public.documents FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid() OR
        public.has_resource_access(id, 'document', 'view')
    );

-- ============================================
-- Audit & Compliance
-- ============================================

-- Audit log (bypass RLS for inserts)
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- ============================================
-- Testing RLS Policies
-- ============================================

/*
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Check policies
SELECT * FROM public.posts;

-- Reset
RESET ROLE;
*/
