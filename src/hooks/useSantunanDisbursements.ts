import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SantunanDisbursement {
  id: string;
  recipient_name: string;
  amount: number;
  date: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisbursementInput {
  recipient_name: string;
  amount: number;
  date: string;
  description?: string | null;
  image_url?: string | null;
}

export function useSantunanDisbursements() {
  const queryClient = useQueryClient();
  const { hasAnyRole, isLoading: authLoading } = useAuth();
  const canViewDetails = hasAnyRole(["admin", "bendahara", "penyaluran"]);

  const { data, isLoading } = useQuery({
    queryKey: ["santunan_disbursements", canViewDetails],
    enabled: !authLoading,
    queryFn: async () => {
      if (canViewDetails) {
        const { data, error } = await supabase
          .from("santunan_disbursements" as any)
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        const items = (data || []) as unknown as SantunanDisbursement[];
        return { items, total: items.reduce((sum, item) => sum + item.amount, 0), count: items.length };
      }
      const { data, error } = await (supabase as any).rpc("get_public_santunan_summary");
      if (error) throw error;
      return { items: [], total: Number(data?.total_disbursed ?? 0), count: Number(data?.distribution_count ?? 0) };
    },
  });

  const addMutation = useMutation({
    mutationFn: async (input: DisbursementInput) => {
      const { error } = await supabase.from("santunan_disbursements" as any).insert(input as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["santunan_disbursements"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DisbursementInput> & { id: string }) => {
      const { error } = await supabase
        .from("santunan_disbursements" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["santunan_disbursements"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("santunan_disbursements" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["santunan_disbursements"] }),
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `disbursement-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("santunan-gallery").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("santunan-gallery").getPublicUrl(path);
    return data.publicUrl;
  };

  const disbursements = data?.items ?? [];
  const totalDisbursed = data?.total ?? 0;
  const distributionCount = data?.count ?? 0;

  return {
    disbursements,
    isLoading,
    totalDisbursed,
    distributionCount,
    canViewDetails,
    addDisbursement: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateDisbursement: updateMutation.mutateAsync,
    deleteDisbursement: deleteMutation.mutateAsync,
    uploadImage,
  };
}
