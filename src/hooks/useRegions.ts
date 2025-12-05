import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Region {
  id: string;
  name: string;
  coordinator: string;
  phone: string;
}

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegions = async () => {
    const { data, error } = await supabase
      .from("regions")
      .select("*")
      .order("name");
    
    if (!error && data) {
      setRegions(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRegions();

    const channel = supabase
      .channel("regions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "regions" },
        () => fetchRegions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateRegion = async (id: string, updates: Partial<Region>) => {
    const { error } = await supabase
      .from("regions")
      .update(updates)
      .eq("id", id);
    
    return { error };
  };

  const addRegion = async (region: Omit<Region, "id">) => {
    const { error } = await supabase
      .from("regions")
      .insert(region);
    
    return { error };
  };

  const deleteRegion = async (id: string) => {
    const { error } = await supabase
      .from("regions")
      .delete()
      .eq("id", id);
    
    return { error };
  };

  return {
    regions,
    isLoading,
    updateRegion,
    addRegion,
    deleteRegion,
    refetch: fetchRegions,
  };
}
