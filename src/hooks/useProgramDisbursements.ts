import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProgramDisbursement {
  id: string;
  program_id: string;
  recipient_name: string;
  amount: number;
  date: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramDisbursementInput {
  program_id: string;
  recipient_name: string;
  amount: number;
  date: string;
  description?: string | null;
  image_url?: string | null;
}

export function useProgramDisbursements(programId?: string) {
  const queryClient = useQueryClient();

  const { data: disbursements = [], isLoading } = useQuery({
    queryKey: ["program_disbursements", programId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("program_disbursements" as any).select("*").order("date", { ascending: false });
      if (programId) q = q.eq("program_id", programId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as ProgramDisbursement[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["program_disbursements"] });

  const addMutation = useMutation({
    mutationFn: async (input: ProgramDisbursementInput) => {
      const { error } = await supabase.from("program_disbursements" as any).insert(input as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProgramDisbursementInput> & { id: string }) => {
      const { error } = await supabase.from("program_disbursements" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("program_disbursements" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `program-disbursements/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("program-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("program-images").getPublicUrl(path);
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
