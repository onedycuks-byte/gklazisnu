import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings" as any)
        .select("*")
        .order("key");
      if (error) throw error;
      return (data || []) as unknown as SiteSetting[];
    },
  });

  const getSetting = (key: string) =>
    settings.find((s) => s.key === key)?.value || "";

  const getSettingsMap = () => {
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return map;
  };

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await (supabase as any)
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });

  return { settings, isLoading, getSetting, getSettingsMap, updateSetting };
}
