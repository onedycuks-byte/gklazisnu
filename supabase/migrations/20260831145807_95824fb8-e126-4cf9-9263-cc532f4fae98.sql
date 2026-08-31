CREATE TABLE public.fundraiser_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  nik text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.fundraiser_accounts TO authenticated;
GRANT ALL ON public.fundraiser_accounts TO service_role;

ALTER TABLE public.fundraiser_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Penggalang lihat akun sendiri" ON public.fundraiser_accounts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_staff_role(auth.uid()));

CREATE POLICY "Penggalang daftar akun sendiri" ON public.fundraiser_accounts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Staff kelola akun penggalang" ON public.fundraiser_accounts
  FOR UPDATE TO authenticated
  USING (public.has_staff_role(auth.uid()))
  WITH CHECK (public.has_staff_role(auth.uid()));

CREATE TRIGGER update_fundraiser_accounts_updated_at
  BEFORE UPDATE ON public.fundraiser_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fundraising_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id uuid NOT NULL REFERENCES public.fundraiser_accounts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'sosial',
  beneficiary text,
  target_amount bigint NOT NULL DEFAULT 0,
  collected_amount bigint NOT NULL DEFAULT 0,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fundraising_proposals_fundraiser ON public.fundraising_proposals(fundraiser_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fundraising_proposals TO authenticated;
GRANT SELECT ON public.fundraising_proposals TO anon;
GRANT ALL ON public.fundraising_proposals TO service_role;

ALTER TABLE public.fundraising_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publik lihat pengajuan disetujui" ON public.fundraising_proposals
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Penggalang lihat pengajuan sendiri" ON public.fundraising_proposals
  FOR SELECT TO authenticated
  USING (
    public.has_staff_role(auth.uid())
    OR fundraiser_id IN (SELECT id FROM public.fundraiser_accounts WHERE user_id = auth.uid())
  );

CREATE POLICY "Penggalang buat pengajuan" ON public.fundraising_proposals
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending'
    AND fundraiser_id IN (
      SELECT id FROM public.fundraiser_accounts
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Penggalang ubah pengajuan menunggu" ON public.fundraising_proposals
  FOR UPDATE TO authenticated
  USING (
    status = 'pending'
    AND fundraiser_id IN (SELECT id FROM public.fundraiser_accounts WHERE user_id = auth.uid())
  )
  WITH CHECK (
    status = 'pending'
    AND fundraiser_id IN (SELECT id FROM public.fundraiser_accounts WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff kelola pengajuan" ON public.fundraising_proposals
  FOR ALL TO authenticated
  USING (public.has_staff_role(auth.uid()))
  WITH CHECK (public.has_staff_role(auth.uid()));

CREATE TRIGGER update_fundraising_proposals_updated_at
  BEFORE UPDATE ON public.fundraising_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();