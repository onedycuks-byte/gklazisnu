-- Add status column to donations (existing = confirmed)
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmed';

-- Add submitted_by column to track who submitted
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id);