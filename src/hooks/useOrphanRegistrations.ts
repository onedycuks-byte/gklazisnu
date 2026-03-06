import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrphanRegistration {
  id: string;
  unique_code: string;
  child_name: string;
  birth_date: string;
  guardian_name: string;
  guardian_phone: string;
  address: string;
  status: string;
  admin_notes: string | null;
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
      guardian_name: string;
      guardian_phone: string;
      address: string;
    }) => {
      const unique_code = generateUniqueCode();
      const { data, error } = await supabase
        .from("orphan_registrations" as any)
        .insert({ ...input, unique_code } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as OrphanRegistration;
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

  const lookupByCode = async (code: string): Promise<OrphanRegistration | null> => {
    const { data, error } = await supabase
      .from("orphan_registrations" as any)
      .select("*")
      .eq("unique_code", code.toUpperCase().trim())
      .single();
    if (error) return null;
    return data as unknown as OrphanRegistration;
  };

  return {
    registrations,
    isLoading,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteRegistration: deleteMutation.mutateAsync,
    lookupByCode,
  };
}
