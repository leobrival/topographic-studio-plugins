-- Supabase PL/pgSQL Functions Template
-- Common database functions and triggers

-- ============================================
-- Utility Functions
-- ============================================

-- Generate slug from text
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                unaccent(input_text),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate unique slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(
    input_text TEXT,
    table_name TEXT,
    slug_column TEXT DEFAULT 'slug'
)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INT := 0;
    slug_exists BOOLEAN;
BEGIN
    base_slug := public.generate_slug(input_text);
    new_slug := base_slug;

    LOOP
        EXECUTE format(
            'SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1)',
            table_name, slug_column
        ) INTO slug_exists USING new_slug;

        EXIT WHEN NOT slug_exists;

        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- User Functions
-- ============================================

-- Get current user with profile
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'role', u.role,
        'avatar_url', u.avatar_url,
        'profile', json_build_object(
            'bio', p.bio,
            'website', p.website,
            'location', p.location,
            'social_links', p.social_links
        )
    ) INTO result
    FROM public.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE u.id = auth.uid();

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update user profile
CREATE OR REPLACE FUNCTION public.update_profile(
    p_name TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_social_links JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    user_record public.users%ROWTYPE;
BEGIN
    -- Update users table
    UPDATE public.users
    SET
        name = COALESCE(p_name, name),
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        updated_at = NOW()
    WHERE id = auth.uid()
    RETURNING * INTO user_record;

    -- Update profiles table
    UPDATE public.profiles
    SET
        bio = COALESCE(p_bio, bio),
        website = COALESCE(p_website, website),
        location = COALESCE(p_location, location),
        social_links = COALESCE(p_social_links, social_links),
        updated_at = NOW()
    WHERE user_id = auth.uid();

    RETURN public.get_current_user();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Content Functions
-- ============================================

-- Get paginated posts
CREATE OR REPLACE FUNCTION public.get_posts(
    p_status post_status DEFAULT 'published',
    p_author_id UUID DEFAULT NULL,
    p_tag_slug TEXT DEFAULT NULL,
    p_page INT DEFAULT 1,
    p_limit INT DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
    offset_val INT;
    total_count INT;
    result JSON;
BEGIN
    offset_val := (p_page - 1) * p_limit;

    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM public.posts p
    LEFT JOIN public.post_tags pt ON p.id = pt.post_id
    LEFT JOIN public.tags t ON pt.tag_id = t.id
    WHERE p.status = p_status
      AND p.deleted_at IS NULL
      AND (p_author_id IS NULL OR p.author_id = p_author_id)
      AND (p_tag_slug IS NULL OR t.slug = p_tag_slug);

    -- Get posts with author
    SELECT json_build_object(
        'data', COALESCE(json_agg(post_data), '[]'::json),
        'meta', json_build_object(
            'total', total_count,
            'page', p_page,
            'limit', p_limit,
            'pages', CEIL(total_count::float / p_limit)
        )
    ) INTO result
    FROM (
        SELECT json_build_object(
            'id', p.id,
            'slug', p.slug,
            'title', p.title,
            'excerpt', p.excerpt,
            'status', p.status,
            'featured_image_url', p.featured_image_url,
            'view_count', p.view_count,
            'published_at', p.published_at,
            'created_at', p.created_at,
            'author', json_build_object(
                'id', u.id,
                'name', u.name,
                'avatar_url', u.avatar_url
            )
        ) as post_data
        FROM public.posts p
        LEFT JOIN public.users u ON p.author_id = u.id
        LEFT JOIN public.post_tags pt ON p.id = pt.post_id
        LEFT JOIN public.tags t ON pt.tag_id = t.id
        WHERE p.status = p_status
          AND p.deleted_at IS NULL
          AND (p_author_id IS NULL OR p.author_id = p_author_id)
          AND (p_tag_slug IS NULL OR t.slug = p_tag_slug)
        GROUP BY p.id, u.id
        ORDER BY p.published_at DESC NULLS LAST
        LIMIT p_limit
        OFFSET offset_val
    ) subq;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get single post with full details
CREATE OR REPLACE FUNCTION public.get_post_by_slug(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'slug', p.slug,
        'title', p.title,
        'content', p.content,
        'excerpt', p.excerpt,
        'status', p.status,
        'featured_image_url', p.featured_image_url,
        'view_count', p.view_count,
        'published_at', p.published_at,
        'created_at', p.created_at,
        'updated_at', p.updated_at,
        'author', json_build_object(
            'id', u.id,
            'name', u.name,
            'avatar_url', u.avatar_url,
            'bio', pr.bio
        ),
        'tags', COALESCE((
            SELECT json_agg(json_build_object(
                'id', t.id,
                'name', t.name,
                'slug', t.slug
            ))
            FROM public.post_tags pt
            JOIN public.tags t ON pt.tag_id = t.id
            WHERE pt.post_id = p.id
        ), '[]'::json)
    ) INTO result
    FROM public.posts p
    LEFT JOIN public.users u ON p.author_id = u.id
    LEFT JOIN public.profiles pr ON u.id = pr.user_id
    WHERE p.slug = p_slug
      AND p.deleted_at IS NULL;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.posts
    SET view_count = view_count + 1
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Search Functions
-- ============================================

-- Full-text search on posts
CREATE OR REPLACE FUNCTION public.search_posts(
    p_query TEXT,
    p_limit INT DEFAULT 20
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(result), '[]'::json)
        FROM (
            SELECT json_build_object(
                'id', p.id,
                'slug', p.slug,
                'title', p.title,
                'excerpt', p.excerpt,
                'published_at', p.published_at,
                'rank', ts_rank(
                    to_tsvector('english', p.title || ' ' || COALESCE(p.content, '')),
                    plainto_tsquery('english', p_query)
                )
            ) as result
            FROM public.posts p
            WHERE p.status = 'published'
              AND p.deleted_at IS NULL
              AND to_tsvector('english', p.title || ' ' || COALESCE(p.content, ''))
                  @@ plainto_tsquery('english', p_query)
            ORDER BY ts_rank(
                to_tsvector('english', p.title || ' ' || COALESCE(p.content, '')),
                plainto_tsquery('english', p_query)
            ) DESC
            LIMIT p_limit
        ) subq
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Organization Functions
-- ============================================

-- Create organization
CREATE OR REPLACE FUNCTION public.create_organization(
    p_name TEXT,
    p_slug TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    org_slug TEXT;
    org_id UUID;
BEGIN
    -- Generate slug if not provided
    IF p_slug IS NULL THEN
        org_slug := public.generate_unique_slug(p_name, 'organizations');
    ELSE
        org_slug := p_slug;
    END IF;

    -- Create organization
    INSERT INTO public.organizations (name, slug)
    VALUES (p_name, org_slug)
    RETURNING id INTO org_id;

    -- Add creator as owner
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id, auth.uid(), 'owner');

    RETURN json_build_object(
        'id', org_id,
        'name', p_name,
        'slug', org_slug
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Invite user to organization
CREATE OR REPLACE FUNCTION public.invite_to_organization(
    p_org_id UUID,
    p_email TEXT,
    p_role org_member_role DEFAULT 'member'
)
RETURNS JSON AS $$
DECLARE
    invited_user_id UUID;
    is_admin BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT public.user_is_org_admin(auth.uid(), p_org_id) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only admins can invite users';
    END IF;

    -- Find user by email
    SELECT id INTO invited_user_id
    FROM public.users
    WHERE email = p_email;

    IF invited_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Check if already member
    IF EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id
          AND user_id = invited_user_id
    ) THEN
        RAISE EXCEPTION 'User is already a member';
    END IF;

    -- Add member
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (p_org_id, invited_user_id, p_role);

    RETURN json_build_object(
        'success', true,
        'user_id', invited_user_id,
        'role', p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Statistics Functions
-- ============================================

-- Get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
BEGIN
    target_user_id := COALESCE(p_user_id, auth.uid());

    RETURN json_build_object(
        'posts', (
            SELECT json_build_object(
                'total', COUNT(*),
                'published', COUNT(*) FILTER (WHERE status = 'published'),
                'drafts', COUNT(*) FILTER (WHERE status = 'draft'),
                'total_views', COALESCE(SUM(view_count), 0)
            )
            FROM public.posts
            WHERE author_id = target_user_id
              AND deleted_at IS NULL
        ),
        'comments', (
            SELECT COUNT(*)
            FROM public.comments
            WHERE author_id = target_user_id
              AND deleted_at IS NULL
        ),
        'organizations', (
            SELECT COUNT(*)
            FROM public.organization_members
            WHERE user_id = target_user_id
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get trending posts
CREATE OR REPLACE FUNCTION public.get_trending_posts(
    p_days INT DEFAULT 7,
    p_limit INT DEFAULT 10
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(post_data), '[]'::json)
        FROM (
            SELECT json_build_object(
                'id', p.id,
                'slug', p.slug,
                'title', p.title,
                'excerpt', p.excerpt,
                'view_count', p.view_count,
                'published_at', p.published_at,
                'author', json_build_object(
                    'name', u.name,
                    'avatar_url', u.avatar_url
                )
            ) as post_data
            FROM public.posts p
            LEFT JOIN public.users u ON p.author_id = u.id
            WHERE p.status = 'published'
              AND p.deleted_at IS NULL
              AND p.published_at > NOW() - (p_days || ' days')::INTERVAL
            ORDER BY p.view_count DESC
            LIMIT p_limit
        ) subq
    );
END;
$$ LANGUAGE plpgsql STABLE;
