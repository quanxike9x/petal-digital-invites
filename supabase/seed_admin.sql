-- ==========================================
-- Supabase Development Admin Account Seed Script
-- ==========================================

-- 1. Create admin profile entry in public.users if not exists
INSERT INTO public.users (id, email, full_name, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@',
  'Quản Trị Viên (Admin)',
  'admin',
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Instructions for Supabase Auth Dashboard:
-- In Supabase Dashboard -> Auth -> Users:
-- 1. Create a user with email: admin@
-- 2. Set password (e.g. Admin123!@#)
-- 3. In User Metadata (raw_user_meta_data), set: { "role": "admin", "full_name": "Quản Trị Viên (Admin)" }
