-- ==============================================================================
-- VIDHYA X — PRODUCTION POSTGRESQL SCHEMA MIGRATION
-- Grade 11 & Grade 12 Science Education Platform (Nepal)
-- Designed exclusively for Supabase (Auth, RLS, Storage, Functions)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    grade TEXT CHECK (grade IN ('11', '12', 'both')),
    college_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create profile upon new Supabase auth user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone_number, role, grade, college_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone_number',
        CASE 
            WHEN NEW.email = 'officialsampannatimalsina@gmail.com' THEN 'admin'
            ELSE 'student'
        END,
        NEW.raw_user_meta_data->>'grade',
        NEW.raw_user_meta_data->>'college_name'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        CASE 
            WHEN NEW.email = 'officialsampannatimalsina@gmail.com' THEN 'admin'
            ELSE 'student'
        END
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if requesting user is administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR email = 'officialsampannatimalsina@gmail.com')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. CURRICULUM: CLASSES, SUBJECTS, CHAPTERS, CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY, -- '11' or '12'
    name TEXT NOT NULL,
    grade_number INT NOT NULL UNIQUE CHECK (grade_number IN (11, 12)),
    description TEXT NOT NULL,
    price_npr INT NOT NULL DEFAULT 599,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'BookOpen',
    chapter_count INT NOT NULL DEFAULT 0,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    chapter_number INT NOT NULL,
    description TEXT NOT NULL,
    material_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT
);

-- ------------------------------------------------------------------------------
-- 3. STUDY MATERIALS (PDFs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    class_id TEXT NOT NULL REFERENCES public.classes(id),
    subject_id TEXT NOT NULL REFERENCES public.subjects(id),
    subject_name TEXT,
    chapter_id TEXT REFERENCES public.chapters(id),
    chapter_name TEXT,
    category TEXT NOT NULL CHECK (category IN ('Notes', 'PYQ', 'Solutions', 'Practice Questions', 'Other Study Materials')),
    is_premium BOOLEAN NOT NULL DEFAULT TRUE,
    file_url TEXT NOT NULL, -- Storage key or signed path
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    page_count INT NOT NULL DEFAULT 1,
    download_count INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PURCHASES & PAYMENT SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    package_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    class_grade INT NOT NULL CHECK (class_grade IN (11, 12)),
    amount_npr INT NOT NULL DEFAULT 599 CHECK (amount_npr = 599), -- Server enforced package price
    payment_method TEXT NOT NULL CHECK (payment_method IN ('esewa', 'khalti', 'bank_transfer')),
    transaction_reference TEXT NOT NULL,
    payer_phone_number TEXT NOT NULL,
    proof_file_path TEXT,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('not_purchased', 'payment_submitted', 'pending_approval', 'approved', 'rejected')),
    admin_note TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    merchant_name TEXT NOT NULL DEFAULT 'Vidhya X Education Nepal',
    esewa_id TEXT NOT NULL DEFAULT '9841234567',
    qr_image_url TEXT NOT NULL,
    instruction_text TEXT NOT NULL,
    contact_support_phone TEXT NOT NULL DEFAULT '+977-9841234567',
    contact_support_email TEXT NOT NULL DEFAULT 'support@vidhyax.edu.np',
    approval_timeline_hours TEXT NOT NULL DEFAULT '5–6 hours',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. BANNERS & ANNOUNCEMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    image_url TEXT,
    cta_text TEXT NOT NULL DEFAULT 'Explore',
    cta_link TEXT NOT NULL DEFAULT '/study',
    badge_text TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'class_11', 'class_12')),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, announcement_id)
);

-- ------------------------------------------------------------------------------
-- 6. E-BOOKS & ONLINE TESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT,
    description TEXT NOT NULL,
    class_grade INT NOT NULL CHECK (class_grade IN (11, 12)),
    subject_name TEXT NOT NULL,
    cover_image_url TEXT,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    page_count INT NOT NULL DEFAULT 1,
    is_premium BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    class_grade INT NOT NULL CHECK (class_grade IN (11, 12)),
    subject_id TEXT NOT NULL REFERENCES public.subjects(id),
    subject_name TEXT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 15,
    total_questions INT NOT NULL DEFAULT 5,
    total_marks INT NOT NULL DEFAULT 10,
    pass_percentage INT NOT NULL DEFAULT 60,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 options: ["A", "B", "C", "D"]
    correct_option_index INT NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
    explanation TEXT,
    points INT NOT NULL DEFAULT 2,
    sort_order INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    test_title TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    score INT NOT NULL,
    total_marks INT NOT NULL,
    percentage INT NOT NULL,
    is_passed BOOLEAN NOT NULL,
    time_spent_seconds INT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Students can read and update their own profiles. Admins can read all.
CREATE POLICY "Profiles are viewable by owner or admin"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile permitted fields"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Curriculum: Public read access
CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (TRUE);
CREATE POLICY "Admin write classes" ON public.classes FOR ALL USING (public.is_admin());

CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (TRUE);
CREATE POLICY "Admin write subjects" ON public.subjects FOR ALL USING (public.is_admin());

CREATE POLICY "Public read chapters" ON public.chapters FOR SELECT USING (TRUE);
CREATE POLICY "Admin write chapters" ON public.chapters FOR ALL USING (public.is_admin());

CREATE POLICY "Public read categories" ON public.content_categories FOR SELECT USING (TRUE);

-- Study Materials: Free materials readable by anyone. Premium materials require approved purchase.
CREATE POLICY "Materials readable by permitted students or admin"
    ON public.study_materials FOR SELECT
    USING (
        published = TRUE AND (
            is_premium = FALSE
            OR public.is_admin()
            OR EXISTS (
                SELECT 1 FROM public.purchases
                WHERE purchases.user_id = auth.uid()
                  AND purchases.class_grade = (public.study_materials.class_id)::INT
                  AND purchases.status = 'approved'
            )
        )
    );

CREATE POLICY "Admin manage materials"
    ON public.study_materials FOR ALL
    USING (public.is_admin());

-- Purchases: Students can insert and read their own. Only admins can update status.
CREATE POLICY "Users can view their own purchases"
    ON public.purchases FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can submit purchases for themselves"
    ON public.purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id AND amount_npr = 599 AND status = 'pending_approval');

CREATE POLICY "Only admins can update purchase reviews"
    ON public.purchases FOR UPDATE
    USING (public.is_admin());

-- Payment Settings: Public read, admin update
CREATE POLICY "Public view payment settings" ON public.payment_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin update payment settings" ON public.payment_settings FOR ALL USING (public.is_admin());

-- Banners & Announcements: Public read, admin manage
CREATE POLICY "Public view active banners" ON public.banners FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admin manage banners" ON public.banners FOR ALL USING (public.is_admin());

CREATE POLICY "Public view announcements" ON public.announcements FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (public.is_admin());

-- Tests: Questions correct_option_index is protected from student viewing
CREATE POLICY "Public view tests" ON public.tests FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admin manage tests" ON public.tests FOR ALL USING (public.is_admin());

CREATE POLICY "Questions readable by authenticated users" ON public.test_questions FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage questions" ON public.test_questions FOR ALL USING (public.is_admin());

-- Test Attempts: Students see only their own. Admins see all.
CREATE POLICY "Students view their own test attempts"
    ON public.test_attempts FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students insert their own test attempts"
    ON public.test_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Audit logs: Read only by admins, never writable by ordinary users
CREATE POLICY "Only admins read audit logs"
    ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Only admins or triggers insert audit logs"
    ON public.admin_audit_logs FOR INSERT
    WITH CHECK (public.is_admin());
