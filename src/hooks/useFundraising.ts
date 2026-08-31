import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FundraiserAccount {
  id: string;
  user_id: string;
  nik: string;
  full_name: string;
  phone: string;
  address: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundraisingProposal {
  id: string;
  fundraiser_id: string;
  title: string;
  description: string;
  category: string;
  beneficiary: string | null;
  target_amount: number;
  collected_amount: number;
  image_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const PROPOSAL_CATEGORIES = [
  "Sosial",
  "Kesehatan",
  "Pendidikan",
  "Bencana Alam",
  "Pembangunan Tempat Ibadah",
  "Yatim & Dhuafa",
  "Lainnya",
];

export const nikToEmail = (nik: string) => `${nik.trim()}@penggalang.local`;

/** Akun penggalang milik user yang sedang login */
export function useMyFundraiser(userId?: string) {
  const queryClient = useQueryClient();

  const { data: account, isLoading } = useQuery({
    queryKey: ["fundraiser-account", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraiser_accounts")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as FundraiserAccount | null;
    },
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ["my-proposals", account?.id],
    enabled: !!account?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraising_proposals")
        .select("*")
        .eq("fundraiser_id", account!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FundraisingProposal[];
    },
  });

  const createProposal = useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      category: string;
      beneficiary?: string;
      target_amount: number;
      image_url?: string | null;
    }) => {
      const { error } = await supabase.from("fundraising_proposals").insert({
        ...payload,
        fundraiser_id: account!.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["all-proposals"] });
    },
  });

  return { account, isLoading, proposals, proposalsLoading, createProposal };
}

/** Semua akun & pengajuan (khusus pengurus) */
export function useFundraisingAdmin() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["all-fundraisers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraiser_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FundraiserAccount[];
    },
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ["all-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraising_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FundraisingProposal[];
    },
  });

  const setAccountStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("fundraiser_accounts")
        .update({ status, admin_notes: notes ?? null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-fundraisers"] }),
  });

  const setProposalStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("fundraising_proposals")
        .update({ status, admin_notes: notes ?? null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-proposals"] }),
  });

  return {
    accounts,
    proposals,
    isLoading: accountsLoading || proposalsLoading,
    setAccountStatus,
    setProposalStatus,
  };
}
