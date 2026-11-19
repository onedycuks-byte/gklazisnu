-- Privacy hardening: public visitors receive aggregates, not transaction-level or beneficiary records.
-- Staff access remains role-based through the existing SECURITY DEFINER helper.

-- Financial ledgers: public access is replaced by the aggregate RPC below.
DROP POLICY IF EXISTS "Anyone can view donations" ON public.donations;
CREATE POLICY "Finance staff can view donations"
  ON public.donations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'ketua'::public.app_role) OR public.has_role(auth.uid(), 'bendahara'::public.app_role));

DROP POLICY IF EXISTS "Anyone can view expenses" ON public.expenses;
CREATE POLICY "Staff can view expenses"
  ON public.expenses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'ketua'::public.app_role) OR public.has_role(auth.uid(), 'bendahara'::public.app_role));

-- Orphan registrations contain data about minors, guardians, addresses and identity documents.
DROP POLICY IF EXISTS "Anyone can view approved registrations" ON public.orphan_registrations;
CREATE POLICY "Santunan staff can view orphan registrations"
  ON public.orphan_registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'penyaluran'::public.app_role));

-- Wallet histories can reveal beneficiary activity.
DROP POLICY IF EXISTS "Anyone can view wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Finance staff can view wallet transactions"
  ON public.wallet_transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'bendahara'::public.app_role) OR public.has_role(auth.uid(), 'penyaluran'::public.app_role));

-- Restore moderation: only approved public discussions are visible to visitors.
DROP POLICY IF EXISTS "Anyone can view all discussions" ON public.discussions;
DROP POLICY IF EXISTS "Anyone can view approved discussions" ON public.discussions;
DROP POLICY IF EXISTS "Admins can view all discussions" ON public.discussions;
CREATE POLICY "Public can view approved discussions"
  ON public.discussions FOR SELECT TO anon, authenticated
  USING (is_approved = true);
CREATE POLICY "Discussion staff can view all discussions"
  ON public.discussions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'sekretaris'::public.app_role));

-- Beneficiary names and descriptions in disbursement ledgers are staff-only.
DROP POLICY IF EXISTS "Anyone can view santunan disbursements" ON public.santunan_disbursements;
CREATE POLICY "Santunan staff can view disbursements"
  ON public.santunan_disbursements FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'bendahara'::public.app_role) OR public.has_role(auth.uid(), 'penyaluran'::public.app_role));

DROP POLICY IF EXISTS "Anyone can view program disbursements" ON public.program_disbursements;
CREATE POLICY "Program staff can view disbursements"
  ON public.program_disbursements FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'bendahara'::public.app_role) OR public.has_role(auth.uid(), 'sekretaris'::public.app_role) OR public.has_role(auth.uid(), 'penyaluran'::public.app_role));

-- Archive metadata and files may contain internal documents.
DROP POLICY IF EXISTS "Anyone can view archives" ON public.archives;
CREATE POLICY "Archive staff can view archives"
  ON public.archives FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'sekretaris'::public.app_role));

UPDATE storage.buckets SET public = false WHERE id IN ('ktp-uploads', 'expense-receipts', 'archives');
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'ktp-uploads';

DROP POLICY IF EXISTS "Anyone can view KTP" ON storage.objects;
CREATE POLICY "Staff can view KTP"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ktp-uploads' AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'penyaluran'::public.app_role)));

DROP POLICY IF EXISTS "Anyone can view expense receipts" ON storage.objects;
CREATE POLICY "Staff can view expense receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'expense-receipts' AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'bendahara'::public.app_role)));

DROP POLICY IF EXISTS "Anyone can read archive files" ON storage.objects;
CREATE POLICY "Staff can read archive files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'archives' AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'sekretaris'::public.app_role)));

-- Aggregate-only public financial report. No names, notes, descriptions, receipt URLs or row IDs.
CREATE OR REPLACE FUNCTION public.get_public_financial_summary()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH income_by_month AS (
    SELECT date_trunc('month', date)::date AS month, sum(amount)::bigint AS amount
    FROM public.donations
    WHERE status = 'confirmed'
    GROUP BY 1
  ),
  expenses_by_month AS (
    SELECT date_trunc('month', date)::date AS month, sum(amount)::bigint AS amount
    FROM public.expenses
    GROUP BY 1
  ),
  monthly AS (
    SELECT
      coalesce(i.month, e.month) AS month,
      coalesce(i.amount, 0)::bigint AS income,
      coalesce(e.amount, 0)::bigint AS expenses
    FROM income_by_month i
    FULL OUTER JOIN expenses_by_month e ON e.month = i.month
  ),
  region_totals AS (
    SELECT r.name AS region, sum(d.amount)::bigint AS total, count(*)::bigint AS transactions
    FROM public.donations d
    JOIN public.regions r ON r.id = d.region_id
    WHERE d.status = 'confirmed'
    GROUP BY r.name
  )
  SELECT jsonb_build_object(
    'total_income', coalesce((SELECT sum(amount) FROM public.donations WHERE status = 'confirmed'), 0),
    'total_expenses', coalesce((SELECT sum(amount) FROM public.expenses), 0),
    'balance',
      coalesce((SELECT sum(amount) FROM public.donations WHERE status = 'confirmed'), 0)
      - coalesce((SELECT sum(amount) FROM public.expenses), 0),
    'total_transactions',
      (SELECT count(*) FROM public.donations WHERE status = 'confirmed')
      + (SELECT count(*) FROM public.expenses),
    'monthly', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'month', to_char(month, 'YYYY-MM'),
          'income', income,
          'expenses', expenses,
          'balance', income - expenses
        ) ORDER BY month DESC
      ) FROM monthly
    ), '[]'::jsonb),
    'regions', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object('region', region, 'total', total, 'transactions', transactions)
        ORDER BY region
      ) FROM region_totals
    ), '[]'::jsonb)
  );
$$;

REVOKE ALL ON FUNCTION public.get_public_financial_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_financial_summary() TO anon, authenticated;

-- Public santunan page may show totals only, never recipient-level details.
CREATE OR REPLACE FUNCTION public.get_public_santunan_summary()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_disbursed', coalesce(sum(amount), 0),
    'distribution_count', count(*)::bigint
  )
  FROM public.santunan_disbursements;
$$;

REVOKE ALL ON FUNCTION public.get_public_santunan_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_santunan_summary() TO anon, authenticated;

-- Public program pages can show aggregate disbursement progress without exposing recipients.
CREATE OR REPLACE FUNCTION public.get_public_program_disbursement_totals()
RETURNS TABLE(program_id uuid, total_disbursed bigint, distribution_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.program_id, sum(d.amount)::bigint, count(*)::bigint
  FROM public.program_disbursements d
  GROUP BY d.program_id;
$$;

REVOKE ALL ON FUNCTION public.get_public_program_disbursement_totals() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_program_disbursement_totals() TO anon, authenticated;
