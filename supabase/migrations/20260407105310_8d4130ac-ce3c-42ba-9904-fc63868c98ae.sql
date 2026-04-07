
-- Create storage bucket for archives
INSERT INTO storage.buckets (id, name, public) VALUES ('archives', 'archives', true);

-- Create archives table
CREATE TABLE public.archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.archives ENABLE ROW LEVEL SECURITY;

-- Anyone can view/download archives
CREATE POLICY "Anyone can view archives" ON public.archives FOR SELECT TO public USING (true);

-- Admin and sekretaris can insert
CREATE POLICY "Staff can insert archives" ON public.archives FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role));

-- Admin and sekretaris can delete
CREATE POLICY "Staff can delete archives" ON public.archives FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role));

-- Storage policies for archives bucket
CREATE POLICY "Anyone can read archive files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'archives');
CREATE POLICY "Staff can upload archive files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'archives' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role)));
CREATE POLICY "Staff can delete archive files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'archives' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role)));
