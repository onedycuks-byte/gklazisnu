import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const INCOME_CATEGORIES = [
  "Infaq Kaleng Koin",
  "Donasi Umum",
  "Zakat",
  "Sedekah",
  "Lain-lain",
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];

export interface Donation {
  id: string;
  region_id: string | null;
  amount: number;
  date: string;
  notes: string | null;
  category: string;
  status: string;
  submitted_by: string | null;
  created_at: string;
}

export interface DonationInput {
  region_id?: string | null;
  amount: number;
  date: string;
  notes?: string;
  category: string;
}

export function useSupabaseDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("date", { ascending: false });
    
    if (!error && data) {
      setDonations(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDonations();

    const channel = supabase
      .channel("donations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        () => fetchDonations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addDonation = async (donation: DonationInput, pending = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("donations")
      .insert({
        region_id: donation.region_id || null,
        amount: donation.amount,
        date: donation.date,
        notes: donation.notes || null,
        category: donation.category,
        ...(pending ? { status: "pending", submitted_by: user?.id } : {}),
      } as any);
    
    return { error };
  };

  const updateDonation = async (id: string, updates: Partial<DonationInput>) => {
    const { error } = await supabase
      .from("donations")
      .update(updates)
      .eq("id", id);
    
    return { error };
  };

  const deleteDonation = async (id: string) => {
    const { error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id);
    
    return { error };
  };

  const getDonationsByRegion = (regionId: string) => {
    return donations.filter((d) => d.region_id === regionId && d.status === "confirmed");
  };

  const getTotalDonations = () => {
    return donations.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + d.amount, 0);
  };

  const getRecentDonations = (limit: number = 10) => {
    return donations.filter(d => d.status === 'confirmed').slice(0, limit);
  };

  return {
    donations,
    isLoading,
    addDonation,
    updateDonation,
    deleteDonation,
    getDonationsByRegion,
    getTotalDonations,
    getRecentDonations,
    refetch: fetchDonations,
  };
}
