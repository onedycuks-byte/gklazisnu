import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicFinancialSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  total_transactions: number;
  monthly: Array<{ month: string; income: number; expenses: number; balance: number }>;
  regions: Array<{ region: string; total: number; transactions: number }>;
}

export function usePublicFinancialSummary() {
  return useQuery({
    queryKey: ["public-financial-summary"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_public_financial_summary");
      if (error) throw error;
      return data as PublicFinancialSummary;
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}
