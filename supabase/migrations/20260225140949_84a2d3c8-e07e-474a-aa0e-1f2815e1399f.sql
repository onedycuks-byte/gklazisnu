
-- Make region_id nullable on donations (income can be non-region based)
ALTER TABLE public.donations ALTER COLUMN region_id DROP NOT NULL;

-- Add category to donations for income categorization
ALTER TABLE public.donations ADD COLUMN category text NOT NULL DEFAULT 'Infaq Kaleng Koin';

-- Add category and receipt_url to expenses
ALTER TABLE public.expenses ADD COLUMN category text NOT NULL DEFAULT 'Operasional';
ALTER TABLE public.expenses ADD COLUMN receipt_url text;

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('expense-receipts', 'expense-receipts', true);

-- Storage policies for expense receipts
CREATE POLICY "Anyone can view expense receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-receipts');

CREATE POLICY "Admins can upload expense receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-receipts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expense receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-receipts' AND public.has_role(auth.uid(), 'admin'));
