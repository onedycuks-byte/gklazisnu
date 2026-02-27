
-- Create site_settings table for editable contact & organization info
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert site settings"
ON public.site_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default contact data
INSERT INTO public.site_settings (key, value) VALUES
  ('org_name', 'LAZISNU Ranting Gendongkulon'),
  ('org_leader', 'Ahmad Nur Siam'),
  ('org_title', 'Ketua LAZISNU Ranting Gendongkulon'),
  ('phone', '0897-6315-251'),
  ('whatsapp', '0897-6315-251'),
  ('email', 'lazisnu.gendongkulon@gmail.com'),
  ('address', 'Masjid Jami Al-Huda, Desa Gendongkulon, Kecamatan Babat, Kabupaten Lamongan, Jawa Timur, Indonesia'),
  ('hours_weekday', '08:00 - 16:00'),
  ('hours_saturday', '08:00 - 12:00'),
  ('hours_sunday', 'Tutup'),
  ('facebook', 'LAZISNU Gendongkulon'),
  ('website', 'lazisnu-gendongkulon.org'),
  ('services', 'Donasi Zakat,Infaq & Sedekah,Program Sosial & Kemanusiaan');
