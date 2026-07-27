CREATE TABLE public.santunan_disbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.santunan_disbursements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.santunan_disbursements TO authenticated;
GRANT ALL ON public.santunan_disbursements TO service_role;

ALTER TABLE public.santunan_disbursements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view santunan disbursements"
  ON public.santunan_disbursements FOR SELECT
  USING (true);

CREATE POLICY "Staff can insert santunan disbursements"
  ON public.santunan_disbursements FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'bendahara'::app_role)
    OR has_role(auth.uid(), 'sekretaris'::app_role)
    OR has_role(auth.uid(), 'penyaluran'::app_role)
  );

CREATE POLICY "Staff can update santunan disbursements"
  ON public.santunan_disbursements FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'bendahara'::app_role)
    OR has_role(auth.uid(), 'sekretaris'::app_role)
    OR has_role(auth.uid(), 'penyaluran'::app_role)
  );

CREATE POLICY "Staff can delete santunan disbursements"
  ON public.santunan_disbursements FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'bendahara'::app_role)
    OR has_role(auth.uid(), 'sekretaris'::app_role)
    OR has_role(auth.uid(), 'penyaluran'::app_role)
  );

CREATE TRIGGER update_santunan_disbursements_updated_at
  BEFORE UPDATE ON public.santunan_disbursements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();