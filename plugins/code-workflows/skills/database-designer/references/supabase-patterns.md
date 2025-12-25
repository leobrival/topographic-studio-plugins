# Supabase Design Patterns

Common patterns for Supabase database design.

## Authentication Integration

### User Table Sync

```sql
-- Sync with auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Profile Updates

```sql
-- Update profile with metadata sync
CREATE OR REPLACE FUNCTION public.update_profile(
    p_name TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    updated_user public.users%ROWTYPE;
BEGIN
    UPDATE public.users
    SET
        name = COALESCE(p_name, name),
        avatar_url = COALESCE(p_avatar_url, avatar_url)
    WHERE id = auth.uid()
    RETURNING * INTO updated_user;

    -- Also update auth metadata
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data ||
        jsonb_build_object(
            'name', updated_user.name,
            'avatar_url', updated_user.avatar_url
        )
    WHERE id = auth.uid();

    RETURN row_to_json(updated_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Row Level Security Patterns

### Owner Access

```sql
-- Users can only access their own data
CREATE POLICY "Users can access own data"
    ON public.profiles FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### Organization Access

```sql
-- Helper function
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS UUID[] AS $$
    SELECT ARRAY_AGG(organization_id)
    FROM public.organization_members
    WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policy using helper
CREATE POLICY "Org members can access"
    ON public.projects FOR SELECT
    TO authenticated
    USING (organization_id = ANY(public.get_user_org_ids()));
```

### Role-Based Access

```sql
-- Admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Admin-only policy
CREATE POLICY "Admins can manage"
    ON public.settings FOR ALL
    TO authenticated
    USING (public.is_admin());
```

### Content Visibility

```sql
-- Public + owner access
CREATE POLICY "Published or owner"
    ON public.posts FOR SELECT
    USING (
        status = 'published' OR
        author_id = auth.uid()
    );
```

## Realtime Patterns

### Enable Realtime

```sql
-- Enable for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Disable for sensitive tables
ALTER PUBLICATION supabase_realtime DROP TABLE public.users;
```

### Realtime with RLS

```typescript
// Client subscription with filters
const channel = supabase
  .channel("room-messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room_id=eq.${roomId}`,
    },
    (payload) => {
      console.log("New message:", payload.new);
    }
  )
  .subscribe();
```

### Presence

```typescript
// Track user presence
const channel = supabase.channel("room:123");

channel
  .on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();
    console.log("Online users:", Object.keys(state));
  })
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

## Storage Patterns

### File Upload with Metadata

```sql
-- Track uploads in database
CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    size_bytes BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage policy
CREATE POLICY "Users can upload own files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'user-files' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
```

### Image Processing

```typescript
// Upload with transformation
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: "3600",
    upsert: true,
  });

// Get transformed URL
const { data: url } = supabase.storage
  .from("avatars")
  .getPublicUrl(`${userId}/avatar.png`, {
    transform: {
      width: 200,
      height: 200,
      resize: "cover",
    },
  });
```

## Edge Functions Patterns

### Database Trigger + Edge Function

```sql
-- Trigger to call edge function
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/new-order',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' ||
                   current_setting('supabase.service_role_key') || '"}'::jsonb,
        body := jsonb_build_object('order_id', NEW.id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_order
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();
```

### Scheduled Jobs

```typescript
// Edge function for scheduled tasks (via cron)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Clean up expired sessions
  const { error } = await supabase
    .from("sessions")
    .delete()
    .lt("expires_at", new Date().toISOString());

  return new Response(JSON.stringify({ success: !error }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## Query Patterns

### Pagination

```typescript
// Cursor-based pagination
const { data, error } = await supabase
  .from("posts")
  .select("*")
  .order("created_at", { ascending: false })
  .lt("created_at", cursor)
  .limit(20);
```

### Full-Text Search

```sql
-- Add search column
ALTER TABLE posts ADD COLUMN fts tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B')
    ) STORED;

CREATE INDEX posts_fts ON posts USING gin(fts);
```

```typescript
// Search query
const { data } = await supabase
  .from("posts")
  .select("*")
  .textSearch("fts", "database & design");
```

### Joins

```typescript
// Related data
const { data } = await supabase
  .from("posts")
  .select(`
    *,
    author:users(id, name, avatar_url),
    comments(id, content, author:users(name))
  `)
  .eq("id", postId)
  .single();
```

### RPC Functions

```sql
-- Complex query as function
CREATE OR REPLACE FUNCTION public.get_trending_posts(p_days INT DEFAULT 7)
RETURNS SETOF posts AS $$
    SELECT *
    FROM posts
    WHERE status = 'published'
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
    ORDER BY view_count DESC
    LIMIT 10;
$$ LANGUAGE sql STABLE;
```

```typescript
// Call from client
const { data } = await supabase.rpc("get_trending_posts", { p_days: 7 });
```

## Multi-Tenancy

### Organization-Based

```sql
-- All resources have org_id
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    name TEXT NOT NULL
);

-- RLS for tenant isolation
CREATE POLICY "Org isolation"
    ON public.projects FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );
```

### Schema-Based

```sql
-- Create tenant schema dynamically
CREATE OR REPLACE FUNCTION public.create_tenant(tenant_slug TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', 'tenant_' || tenant_slug);
    -- Create tables in new schema
    EXECUTE format('CREATE TABLE %I.projects (...)', 'tenant_' || tenant_slug);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Audit & Compliance

### Audit Trigger

```sql
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_log (
        table_name, record_id, action, old_data, new_data, user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
```

## Best Practices

1. **Always use RLS**: Enable on all user-facing tables
2. **Use helper functions**: Centralize permission logic
3. **Index RLS conditions**: Ensure policies are performant
4. **Test policies**: Use `SET LOCAL role` for testing
5. **Minimize realtime tables**: Only enable where needed
6. **Use service role carefully**: Only in edge functions
7. **Cache auth checks**: Use `SECURITY DEFINER` functions
8. **Document policies**: Comment complex RLS rules
