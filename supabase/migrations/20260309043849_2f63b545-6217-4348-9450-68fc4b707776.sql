
-- Add new columns to orphan_registrations
ALTER TABLE public.orphan_registrations 
  ADD COLUMN IF NOT EXISTS gender text DEFAULT 'laki-laki',
  ADD COLUMN IF NOT EXISTS education text DEFAULT '',
  ADD COLUMN IF NOT EXISTS school_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS father_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS mother_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cause_of_orphan text DEFAULT '',
  ADD COLUMN IF NOT EXISTS guardian_relation text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ktp_url text DEFAULT NULL;

-- Create storage bucket for KTP uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('ktp-uploads', 'ktp-uploads', true) ON CONFLICT DO NOTHING;

-- Allow anyone to upload to ktp-uploads
CREATE POLICY "Anyone can upload KTP" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ktp-uploads');
CREATE POLICY "Anyone can view KTP" ON storage.objects FOR SELECT USING (bucket_id = 'ktp-uploads');
CREATE POLICY "Admins can delete KTP" ON storage.objects FOR DELETE USING (bucket_id = 'ktp-uploads' AND public.has_role(auth.uid(), 'admin'));
