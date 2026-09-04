ALTER TABLE public.fundraiser_accounts ADD COLUMN IF NOT EXISTS ktp_url text;

DROP POLICY IF EXISTS "Staff can delete fundraiser accounts" ON public.fundraiser_accounts;
CREATE POLICY "Staff can delete fundraiser accounts"
ON public.fundraiser_accounts FOR DELETE TO authenticated
USING (public.has_staff_role(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete proposals" ON public.fundraising_proposals;
CREATE POLICY "Staff can delete proposals"
ON public.fundraising_proposals FOR DELETE TO authenticated
USING (public.has_staff_role(auth.uid()));
