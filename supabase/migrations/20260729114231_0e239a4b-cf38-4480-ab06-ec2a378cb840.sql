CREATE TABLE public.program_disbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  recipient_name text NOT NULL,
  amount bigint NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.program_disbursements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_disbursements TO authenticated;
GRANT ALL ON public.program_disbursements TO service_role;

ALTER TABLE public.program_disbursements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view program disbursements"
  ON public.program_disbursements FOR SELECT USING (true);

CREATE POLICY "Staff can insert program disbursements"
  ON public.program_disbursements FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'bendahara'::app_role) OR
    has_role(auth.uid(), 'sekretaris'::app_role) OR
    has_role(auth.uid(), 'penyaluran'::app_role)
  );

CREATE POLICY "Staff can update program disbursements"
  ON public.program_disbursements FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'bendahara'::app_role) OR
    has_role(auth.uid(), 'sekretaris'::app_role) OR
    has_role(auth.uid(), 'penyaluran'::app_role)
  );

CREATE POLICY "Staff can delete program disbursements"
  ON public.program_disbursements FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'bendahara'::app_role) OR
    has_role(auth.uid(), 'sekretaris'::app_role) OR
    has_role(auth.uid(), 'penyaluran'::app_role)
  );

CREATE INDEX idx_program_disbursements_program ON public.program_disbursements(program_id);

CREATE TRIGGER update_program_disbursements_updated_at
  BEFORE UPDATE ON public.program_disbursements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();