import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrphanRegistration {
  id: string;
  unique_code: string;
  child_name: string;
  birth_date: string;
  gender: string;
  education: string;
  school_name: string;
  father_name: string;
  mother_name: string;
  cause_of_orphan: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relation: string;
  address: string;
  ktp_url: string | null;
  status: string;
  admin_notes: string | null;
  balance: number;
  created_at: string;
  approved_at: string | null;
}

function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const prefix = "SYP";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

export function useOrphanRegistrations(adminMode = false) {
  const queryClient = useQueryClient();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["orphan_registrations", adminMode],
    queryFn: async () => {
      let query = supabase
        .from("orphan_registrations" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!adminMode) {
        query = query.eq("status", "approved");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as OrphanRegistration[];
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: {
      child_name: string;
      birth_date: string;
      gender: string;
      education: string;
      school_name: string;
      father_name: string;
      mother_name: string;
      cause_of_orphan: string;
      guardian_name: string;
      guardian_phone: string;
      guardian_relation: string;
      address: string;
      ktp_url?: string;
    }) => {
      const unique_code = generateUniqueCode();
      const { error } = await supabase
        .from("orphan_registrations" as any)
        .insert({ ...input, unique_code } as any);
      if (error) throw error;
      return { unique_code };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orphan_registrations"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const updates: any = { status };
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      if (status === "approved") updates.approved_at = new Date().toISOString();
      
      const { error } = await supabase
        .from("orphan_registrations" as any)
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orphan_registrations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("orphan_registrations" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orphan_registrations"] });
    },
  });

  return {
    registrations,
    isLoading,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteRegistration: deleteMutation.mutateAsync,
  };
}
