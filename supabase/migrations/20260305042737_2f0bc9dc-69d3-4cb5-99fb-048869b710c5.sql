
CREATE TABLE public.site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'page_view',
  page text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text,
  user_agent text
);

ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events
CREATE POLICY "Anyone can insert analytics" ON public.site_analytics
FOR INSERT WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics" ON public.site_analytics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_analytics;
