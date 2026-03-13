-- Update has_staff_role to include koordinator
CREATE OR REPLACE FUNCTION public.has_staff_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'bendahara', 'sekretaris', 'dokumentasi', 'koordinator')
  )
$$;

-- Allow koordinator to insert donations (pending only)
CREATE POLICY "Koordinator can insert pending donations"
ON public.donations
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'koordinator'::app_role) AND status = 'pending'
);

-- Allow koordinator to view their own submissions
CREATE POLICY "Koordinator can view own donations"
ON public.donations
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'koordinator'::app_role) AND submitted_by = auth.uid()
);