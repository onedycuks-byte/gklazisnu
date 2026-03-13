
-- Create a helper function to check if user has any staff role (admin, bendahara, sekretaris, dokumentasi)
CREATE OR REPLACE FUNCTION public.has_staff_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'bendahara', 'sekretaris', 'dokumentasi')
  )
$$;

-- Bendahara needs: donations (CRUD), expenses (CRUD), wallet_transactions (INSERT), orphan_registrations (UPDATE for balance)
-- Update donations policies to include bendahara
DROP POLICY IF EXISTS "Admins can insert donations" ON public.donations;
CREATE POLICY "Staff can insert donations" ON public.donations FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
CREATE POLICY "Staff can update donations" ON public.donations FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

DROP POLICY IF EXISTS "Admins can delete donations" ON public.donations;
CREATE POLICY "Staff can delete donations" ON public.donations FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

-- Update expenses policies to include bendahara
DROP POLICY IF EXISTS "Admins can insert expenses" ON public.expenses;
CREATE POLICY "Staff can insert expenses" ON public.expenses FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

DROP POLICY IF EXISTS "Admins can update expenses" ON public.expenses;
CREATE POLICY "Staff can update expenses" ON public.expenses FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

DROP POLICY IF EXISTS "Admins can delete expenses" ON public.expenses;
CREATE POLICY "Staff can delete expenses" ON public.expenses FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

-- Update wallet_transactions insert to include bendahara
DROP POLICY IF EXISTS "Admins can insert wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Staff can insert wallet transactions" ON public.wallet_transactions FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

DROP POLICY IF EXISTS "Admins can delete wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Staff can delete wallet transactions" ON public.wallet_transactions FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara'));

-- Update orphan_registrations update policy to include bendahara (for balance) and sekretaris (for status)
DROP POLICY IF EXISTS "Admins can update orphan registrations" ON public.orphan_registrations;
CREATE POLICY "Staff can update orphan registrations" ON public.orphan_registrations FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'bendahara') OR has_role(auth.uid(), 'sekretaris'));

DROP POLICY IF EXISTS "Admins can delete orphan registrations" ON public.orphan_registrations;
CREATE POLICY "Staff can delete orphan registrations" ON public.orphan_registrations FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

-- Sekretaris needs: regions (CRUD), site_settings (CRUD), discussions (UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can insert regions" ON public.regions;
CREATE POLICY "Staff can insert regions" ON public.regions FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

DROP POLICY IF EXISTS "Admins can update regions" ON public.regions;
CREATE POLICY "Staff can update regions" ON public.regions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

DROP POLICY IF EXISTS "Admins can delete regions" ON public.regions;
CREATE POLICY "Staff can delete regions" ON public.regions FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

-- Site settings
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
CREATE POLICY "Staff can insert site settings" ON public.site_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Staff can update site settings" ON public.site_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
CREATE POLICY "Staff can delete site settings" ON public.site_settings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

-- Discussions
DROP POLICY IF EXISTS "Admins can update discussions" ON public.discussions;
CREATE POLICY "Staff can update discussions" ON public.discussions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

DROP POLICY IF EXISTS "Admins can delete discussions" ON public.discussions;
CREATE POLICY "Staff can delete discussions" ON public.discussions FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sekretaris'));

-- Dokumentasi needs: news (CRUD), programs (CRUD)
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
CREATE POLICY "Staff can insert news" ON public.news FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dokumentasi'));

DROP POLICY IF EXISTS "Admins can update news" ON public.news;
CREATE POLICY "Staff can update news" ON public.news FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dokumentasi'));

DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
CREATE POLICY "Staff can delete news" ON public.news FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dokumentasi'));

DROP POLICY IF EXISTS "Admins can insert programs" ON public.programs;
CREATE POLICY "Staff can insert programs" ON public.programs FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dokumentasi'));

DROP POLICY IF EXISTS "Admins can update programs" ON public.programs;
CREATE POLICY "Staff can update programs" ON public.programs FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dokumentasi'));

DROP POLICY IF EXISTS "Admins can delete programs" ON public.programs;
CREATE POLICY "Staff can delete programs" ON public.programs FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dokumentasi'));

-- Analytics: allow all staff roles to view
DROP POLICY IF EXISTS "Admins can view analytics" ON public.site_analytics;
CREATE POLICY "Staff can view analytics" ON public.site_analytics FOR SELECT TO authenticated
USING (public.has_staff_role(auth.uid()));
