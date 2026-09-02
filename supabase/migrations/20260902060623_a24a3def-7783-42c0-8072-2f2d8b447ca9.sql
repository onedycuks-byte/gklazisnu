GRANT SELECT, INSERT, UPDATE ON public.fundraiser_accounts TO authenticated;
GRANT ALL ON public.fundraiser_accounts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fundraising_proposals TO authenticated;
GRANT SELECT ON public.fundraising_proposals TO anon;
GRANT ALL ON public.fundraising_proposals TO service_role;