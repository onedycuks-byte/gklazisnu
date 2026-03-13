
-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'bendahara';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sekretaris';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dokumentasi';
