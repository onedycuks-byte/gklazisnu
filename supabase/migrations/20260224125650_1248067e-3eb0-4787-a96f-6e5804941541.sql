
-- Create storage bucket for program images
INSERT INTO storage.buckets (id, name, public) VALUES ('program-images', 'program-images', true);

-- Allow anyone to view program images
CREATE POLICY "Anyone can view program images"
ON storage.objects FOR SELECT
USING (bucket_id = 'program-images');

-- Allow admins to upload program images
CREATE POLICY "Admins can upload program images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'program-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update program images
CREATE POLICY "Admins can update program images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'program-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete program images
CREATE POLICY "Admins can delete program images"
ON storage.objects FOR DELETE
USING (bucket_id = 'program-images' AND public.has_role(auth.uid(), 'admin'));

-- Add image_url column to programs table
ALTER TABLE public.programs ADD COLUMN image_url text;
