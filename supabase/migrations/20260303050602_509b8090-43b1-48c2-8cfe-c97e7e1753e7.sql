
-- Create discussions table
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved discussions
CREATE POLICY "Anyone can view approved discussions"
ON public.discussions FOR SELECT
USING (is_approved = true);

-- Anyone can insert discussions
CREATE POLICY "Anyone can insert discussions"
ON public.discussions FOR INSERT
WITH CHECK (true);

-- Admins can view all discussions
CREATE POLICY "Admins can view all discussions"
ON public.discussions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update discussions
CREATE POLICY "Admins can update discussions"
ON public.discussions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete discussions
CREATE POLICY "Admins can delete discussions"
ON public.discussions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
