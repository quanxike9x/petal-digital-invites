-- ==========================================
-- Online Wedding Invitation Platform (ChungĐôi Skeleton)
-- Database Schema for Supabase (PostgreSQL)
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., 'Modern', 'Traditional', 'Minimalist', 'Luxury'
    thumbnail_url TEXT,
    preview_url TEXT,
    config JSONB DEFAULT '{}'::jsonb, -- Store default typography, color palette, layout blocks
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL, -- e.g., "Thiệp cưới Phong & Hoa"
    slug VARCHAR(255) UNIQUE NOT NULL, -- e.g., "phong-hoa-2026"
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    plan_type VARCHAR(50) DEFAULT 'trial' CHECK (plan_type IN ('trial', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INVITATION_DATA TABLE
CREATE TABLE IF NOT EXISTS public.invitation_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID UNIQUE NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    groom_name VARCHAR(255),
    groom_father VARCHAR(255),
    groom_mother VARCHAR(255),
    bride_name VARCHAR(255),
    bride_father VARCHAR(255),
    bride_mother VARCHAR(255),
    wedding_date TIMESTAMP WITH TIME ZONE,
    story TEXT,
    ceremony_location VARCHAR(255),
    ceremony_address TEXT,
    ceremony_map_url TEXT,
    ceremony_time TIMESTAMP WITH TIME ZONE,
    party_location VARCHAR(255),
    party_address TEXT,
    party_map_url TEXT,
    party_time TIMESTAMP WITH TIME ZONE,
    bank_groom_qr TEXT,
    bank_groom_account VARCHAR(100),
    bank_groom_name VARCHAR(255),
    bank_bride_qr TEXT,
    bank_bride_account VARCHAR(100),
    bank_bride_name VARCHAR(255),
    music_url TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_image_url TEXT,
    custom_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. GUESTS TABLE
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    token VARCHAR(100) UNIQUE,
    group_name VARCHAR(100), -- e.g., "Bạn Cấp 3", "Đồng Nghiệp", "Họ Hàng"
    rsvp_status VARCHAR(50) DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
    guest_count INT DEFAULT 1,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. WISHES TABLE (Guestbook)
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID UNIQUE NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) UNIQUE NOT NULL, -- e.g., "cuoiphongvahoa.com"
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed')),
    ssl_active BOOLEAN DEFAULT false,
    dns_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50), -- e.g., 'vnpay', 'momo', 'bank_transfer'
    transaction_ref VARCHAR(255) UNIQUE,
    plan_name VARCHAR(100), -- e.g., 'Gói VIP 1 năm'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON public.guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_gallery_invitation_id ON public.gallery(invitation_id);
CREATE INDEX IF NOT EXISTS idx_wishes_invitation_id ON public.wishes(invitation_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
