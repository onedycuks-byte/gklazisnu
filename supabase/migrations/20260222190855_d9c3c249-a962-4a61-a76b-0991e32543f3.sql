
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount bigint NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Admins can insert expenses" ON public.expenses FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update expenses" ON public.expenses FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
