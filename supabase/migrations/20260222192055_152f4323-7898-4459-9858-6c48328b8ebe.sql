
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_amount BIGINT NOT NULL DEFAULT 0,
  collected_amount BIGINT NOT NULL DEFAULT 0,
  qris_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Admins can insert programs" ON public.programs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update programs" ON public.programs FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete programs" ON public.programs FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
