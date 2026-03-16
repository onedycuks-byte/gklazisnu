
-- Create santunan_gallery table
CREATE TABLE public.santunan_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.santunan_gallery ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery images
CREATE POLICY "Anyone can view santunan gallery"
  ON public.santunan_gallery FOR SELECT
  TO public
  USING (true);

-- Staff can insert gallery images
CREATE POLICY "Staff can insert santunan gallery"
  ON public.santunan_gallery FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role));

-- Staff can update gallery images
CREATE POLICY "Staff can update santunan gallery"
  ON public.santunan_gallery FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role));

-- Staff can delete gallery images
CREATE POLICY "Staff can delete santunan gallery"
  ON public.santunan_gallery FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sekretaris'::app_role));

-- Create storage bucket for santunan gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('santunan-gallery', 'santunan-gallery', true);

-- Storage policies for santunan-gallery bucket
CREATE POLICY "Anyone can view santunan gallery images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'santunan-gallery');

CREATE POLICY "Staff can upload santunan gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'santunan-gallery');

CREATE POLICY "Staff can delete santunan gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'santunan-gallery');
