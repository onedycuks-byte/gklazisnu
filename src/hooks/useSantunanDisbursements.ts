import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: disbursements = [], isLoading } = useQuery({
    queryKey: ["santunan_disbursements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("santunan_disbursements" as any)
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SantunanDisbursement[];
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

  const totalDisbursed = disbursements.reduce((s, d) => s + d.amount, 0);

  return {
    disbursements,
    isLoading,
    totalDisbursed,
    addDisbursement: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateDisbursement: updateMutation.mutateAsync,
    deleteDisbursement: deleteMutation.mutateAsync,
    uploadImage,
  };
}
