create or replace function public.get_content_stats()
returns table(page text, views bigint, shares bigint)
language sql
stable
security definer
set search_path = public
as $$
  select a.page,
         count(*) filter (where a.event_type = 'page_view')::bigint as views,
         count(*) filter (where a.event_type = 'share')::bigint as shares
  from public.site_analytics a
  where a.page like '/berita/%' or a.page like '/program/%'
  group by a.page
$$;

grant execute on function public.get_content_stats() to anon, authenticated;