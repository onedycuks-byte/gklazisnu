
-- Add admin reply column
ALTER TABLE public.discussions ADD COLUMN admin_reply text;
ALTER TABLE public.discussions ADD COLUMN replied_at timestamp with time zone;

-- Drop old restrictive SELECT policies
DROP POLICY IF EXISTS "Anyone can view approved discussions" ON public.discussions;
DROP POLICY IF EXISTS "Admins can view all discussions" ON public.discussions;

-- New: anyone can view ALL discussions (no approval needed)
CREATE POLICY "Anyone can view all discussions"
ON public.discussions
FOR SELECT
USING (true);
