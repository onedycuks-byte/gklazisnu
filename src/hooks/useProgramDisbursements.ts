import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  distribution_count?: number;
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
  const { hasAnyRole, isLoading: authLoading } = useAuth();
  const canViewDetails = hasAnyRole(["admin", "ketua", "bendahara", "sekretaris", "dokumentasi", "koordinator", "penyaluran"]);

  const { data: disbursements = [], isLoading } = useQuery({
    queryKey: ["program_disbursements", programId ?? "all", canViewDetails],
    enabled: !authLoading,
    queryFn: async () => {
      if (canViewDetails) {
        let q = supabase.from("program_disbursements" as any).select("*").order("date", { ascending: false });
        if (programId) q = q.eq("program_id", programId);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []) as unknown as ProgramDisbursement[];
      }
      const { data, error } = await (supabase as any).rpc("get_public_program_disbursement_totals");
      if (error) throw error;
      return ((data || []) as Array<{ program_id: string; total_disbursed: number; distribution_count: number }>)
        .filter((row) => !programId || row.program_id === programId)
        .map((row) => ({
          id: `summary-${row.program_id}`, program_id: row.program_id, recipient_name: "",
          amount: Number(row.total_disbursed), date: "", description: null, image_url: null,
          created_at: "", updated_at: "", distribution_count: Number(row.distribution_count),
        }));
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
    canViewDetails,
    addDisbursement: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateDisbursement: updateMutation.mutateAsync,
    deleteDisbursement: deleteMutation.mutateAsync,
    uploadImage,
  };
}
