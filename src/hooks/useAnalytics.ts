import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  let sid = sessionStorage.getItem("analytics_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("analytics_sid", sid);
  }
  return sid;
}

export function useTrackPageView(page: string) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    supabase.from("site_analytics" as any).insert({
      event_type: "page_view",
      page,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
    } as any).then(() => {});
  }, [page]);
}

export async function trackEvent(eventType: string, page?: string) {
  const { error } = await supabase.from("site_analytics" as any).insert({
    event_type: eventType,
    page: page || null,
    session_id: getSessionId(),
    user_agent: navigator.userAgent,
  } as any);
  if (error) console.warn("trackEvent failed", error.message);
}

export function useAnalyticsStats() {
  return useQuery({
    queryKey: ["analytics_stats"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Total page views
      const { count: totalViews } = await (supabase as any)
        .from("site_analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "page_view");

      // Today views
      const { count: todayViews } = await (supabase as any)
        .from("site_analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "page_view")
        .gte("created_at", todayStart);

      // Week views
      const { count: weekViews } = await (supabase as any)
        .from("site_analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "page_view")
        .gte("created_at", weekStart);

      // Month views
      const { count: monthViews } = await (supabase as any)
        .from("site_analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "page_view")
        .gte("created_at", monthStart);

      // Total installs
      const { count: totalInstalls } = await (supabase as any)
        .from("site_analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "pwa_install");

      // Today installs
      const { count: todayInstalls } = await (supabase as any)
        .from("site_analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "pwa_install")
        .gte("created_at", todayStart);

      // Unique sessions today
      const { data: uniqueToday } = await (supabase as any)
        .from("site_analytics")
        .select("session_id")
        .eq("event_type", "page_view")
        .gte("created_at", todayStart);
      const uniqueTodayCount = new Set((uniqueToday || []).map((r: any) => r.session_id)).size;

      // Unique sessions total
      const { data: uniqueAll } = await (supabase as any)
        .from("site_analytics")
        .select("session_id")
        .eq("event_type", "page_view");
      const uniqueAllCount = new Set((uniqueAll || []).map((r: any) => r.session_id)).size;

      // Recent 7 days daily views
      const { data: recentData } = await (supabase as any)
        .from("site_analytics")
        .select("created_at")
        .eq("event_type", "page_view")
        .gte("created_at", weekStart)
        .order("created_at", { ascending: true });

      const dailyMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        dailyMap[d.toISOString().split("T")[0]] = 0;
      }
      (recentData || []).forEach((r: any) => {
        const day = r.created_at.split("T")[0];
        if (dailyMap[day] !== undefined) dailyMap[day]++;
      });

      const dailyChart = Object.entries(dailyMap).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
        views: count,
      }));

      return {
        totalViews: totalViews || 0,
        todayViews: todayViews || 0,
        weekViews: weekViews || 0,
        monthViews: monthViews || 0,
        totalInstalls: totalInstalls || 0,
        todayInstalls: todayInstalls || 0,
        uniqueTodayCount,
        uniqueAllCount,
        dailyChart,
      };
    },
    refetchInterval: 30000, // Refresh every 30s for real-time feel
  });
}
