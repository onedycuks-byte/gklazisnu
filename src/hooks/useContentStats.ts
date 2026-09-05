import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/hooks/useAnalytics";

export interface ContentStat {
  views: number;
  shares: number;
}

type StatsMap = Record<string, ContentStat>;

export function useContentStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["content_stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_content_stats");
      if (error) throw error;
      const map: StatsMap = {};
      (data || []).forEach((r: any) => {
        map[r.page] = { views: Number(r.views) || 0, shares: Number(r.shares) || 0 };
      });
      return map;
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const stats = data || {};
  const getStat = (path: string): ContentStat => stats[path] || { views: 0, shares: 0 };

  return {
    stats,
    isLoading,
    newsStat: (id: string) => getStat(`/berita/${id}`),
    programStat: (id: string) => getStat(`/program/${id}`),
  };
}

export function trackNewsView(id: string) {
  return trackEvent("page_view", `/berita/${id}`);
}

export function trackNewsShare(id: string) {
  return trackEvent("share", `/berita/${id}`);
}

export function trackProgramView(id: string) {
  return trackEvent("page_view", `/program/${id}`);
}

export function trackProgramShare(id: string) {
  return trackEvent("share", `/program/${id}`);
}
