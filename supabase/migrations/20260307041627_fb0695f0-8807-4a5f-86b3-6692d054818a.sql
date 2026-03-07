
-- Add balance column to orphan_registrations
ALTER TABLE public.orphan_registrations ADD COLUMN balance bigint NOT NULL DEFAULT 0;

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.orphan_registrations(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  type text NOT NULL DEFAULT 'topup',
  description text,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view transactions (needed for card holders to see their history)
CREATE POLICY "Anyone can view wallet transactions" ON public.wallet_transactions FOR SELECT USING (true);

-- Only admins can insert transactions
CREATE POLICY "Admins can insert wallet transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete transactions
CREATE POLICY "Admins can delete wallet transactions" ON public.wallet_transactions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for wallet_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
