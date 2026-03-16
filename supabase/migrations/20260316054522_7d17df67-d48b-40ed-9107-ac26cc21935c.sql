
-- Update santunan_gallery policies to include penyaluran role
DROP POLICY IF EXISTS "Staff can insert santunan gallery" ON public.santunan_gallery;
CREATE POLICY "Staff can insert santunan gallery" ON public.santunan_gallery FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role) OR has_role(auth.uid(), 'penyaluran'::app_role));

DROP POLICY IF EXISTS "Staff can update santunan gallery" ON public.santunan_gallery;
CREATE POLICY "Staff can update santunan gallery" ON public.santunan_gallery FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role) OR has_role(auth.uid(), 'penyaluran'::app_role));

DROP POLICY IF EXISTS "Staff can delete santunan gallery" ON public.santunan_gallery;
CREATE POLICY "Staff can delete santunan gallery" ON public.santunan_gallery FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role) OR has_role(auth.uid(), 'penyaluran'::app_role));

-- Update orphan_registrations policies to include penyaluran role
DROP POLICY IF EXISTS "Staff can update orphan registrations" ON public.orphan_registrations;
CREATE POLICY "Staff can update orphan registrations" ON public.orphan_registrations FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'bendahara'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role) OR has_role(auth.uid(), 'penyaluran'::app_role));

DROP POLICY IF EXISTS "Staff can delete orphan registrations" ON public.orphan_registrations;
CREATE POLICY "Staff can delete orphan registrations" ON public.orphan_registrations FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role) OR has_role(auth.uid(), 'penyaluran'::app_role));

-- Update has_staff_role function to include penyaluran
CREATE OR REPLACE FUNCTION public.has_staff_role(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'bendahara', 'sekretaris', 'dokumentasi', 'koordinator', 'ketua', 'penyaluran')
  )
$$;
