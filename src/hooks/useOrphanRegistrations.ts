import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

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

export interface WalletTransaction {
  id: string;
  registration_id: string;
  amount: number;
  type: string;
  description: string | null;
  admin_note: string | null;
  created_at: string;
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

  // Wallet transactions
  const getTransactions = async (registrationId: string): Promise<WalletTransaction[]> => {
    const { data, error } = await supabase
      .from("wallet_transactions" as any)
      .select("*")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data || []) as unknown as WalletTransaction[];
  };

  const topUpMutation = useMutation({
    mutationFn: async ({ registrationId, amount, description, adminNote, childName }: {
      registrationId: string;
      amount: number;
      description?: string;
      adminNote?: string;
      childName?: string;
    }) => {
      // Insert wallet transaction
      const { error: txError } = await supabase
        .from("wallet_transactions" as any)
        .insert({
          registration_id: registrationId,
          amount,
          type: "topup",
          description: description || "Top up saldo",
          admin_note: adminNote || null,
        } as any);
      if (txError) throw txError;

      // Update balance
      const { data: current } = await supabase
        .from("orphan_registrations" as any)
        .select("balance")
        .eq("id", registrationId)
        .single();
      
      const currentBalance = (current as any)?.balance || 0;
      const { error: updateError } = await supabase
        .from("orphan_registrations" as any)
        .update({ balance: currentBalance + amount } as any)
        .eq("id", registrationId);
      if (updateError) throw updateError;

      // Sync: record as expense in LAZISNU financial system
      const expenseDesc = childName
        ? `Santunan Yatim-Piatu: ${childName}${description ? ` - ${description}` : ""}`
        : description || "Penyaluran dana santunan yatim-piatu";
      const { error: expError } = await supabase
        .from("expenses")
        .insert({
          amount,
          date: new Date().toISOString().split("T")[0],
          description: expenseDesc,
          category: "Santunan Yatim-Piatu",
        });
      if (expError) throw expError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orphan_registrations"] });
      queryClient.invalidateQueries({ queryKey: ["wallet_transactions"] });
    },
  });

  const deductMutation = useMutation({
    mutationFn: async ({ registrationId, amount, description, adminNote }: {
      registrationId: string;
      amount: number;
      description?: string;
      adminNote?: string;
    }) => {
      const { error: txError } = await supabase
        .from("wallet_transactions" as any)
        .insert({
          registration_id: registrationId,
          amount: -amount,
          type: "deduct",
          description: description || "Pencairan dana",
          admin_note: adminNote || null,
        } as any);
      if (txError) throw txError;

      const { data: current } = await supabase
        .from("orphan_registrations" as any)
        .select("balance")
        .eq("id", registrationId)
        .single();
      
      const currentBalance = (current as any)?.balance || 0;
      const { error: updateError } = await supabase
        .from("orphan_registrations" as any)
        .update({ balance: Math.max(0, currentBalance - amount) } as any)
        .eq("id", registrationId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orphan_registrations"] });
      queryClient.invalidateQueries({ queryKey: ["wallet_transactions"] });
    },
  });

  return {
    registrations,
    isLoading,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteRegistration: deleteMutation.mutateAsync,
    lookupByCode,
    getTransactions,
    topUp: topUpMutation.mutateAsync,
    isTopingUp: topUpMutation.isPending,
    deduct: deductMutation.mutateAsync,
    isDeducting: deductMutation.isPending,
  };
}

export function useWalletRealtime(registrationId: string | null, onUpdate: () => void) {
  useEffect(() => {
    if (!registrationId) return;

    const channel = supabase
      .channel(`wallet-${registrationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `registration_id=eq.${registrationId}`,
        },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orphan_registrations',
          filter: `id=eq.${registrationId}`,
        },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [registrationId, onUpdate]);
}
