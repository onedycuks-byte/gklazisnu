
CREATE TABLE public.orphan_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_code text NOT NULL UNIQUE,
  child_name text NOT NULL,
  birth_date date NOT NULL,
  guardian_name text NOT NULL,
  guardian_phone text NOT NULL,
  address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone
);

ALTER TABLE public.orphan_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orphan registrations" ON public.orphan_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view approved registrations" ON public.orphan_registrations
  FOR SELECT USING (true);

CREATE POLICY "Admins can update orphan registrations" ON public.orphan_registrations
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete orphan registrations" ON public.orphan_registrations
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
