import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const EXPENSE_CATEGORIES = [
  "Santunan Kematian",
  "Santunan Yatim-Piatu",
  "Bantuan untuk Masjid",
  "Bantuan Sosial",
  "Santunan Guru Ngaji TPQ",
  "Kas Cadangan",
  "Bantuan Pendidikan",
  "Pengembangan Dana",
  "Operasional",
  "Lain",
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  category: string;
  receipt_url: string | null;
  created_at: string;
}

export interface ExpenseInput {
  amount: number;
  date: string;
  description?: string;
  category: string;
  receipt_url?: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchExpenses();

    const channel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => fetchExpenses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addExpense = async (expense: ExpenseInput) => {
    const { error } = await supabase
      .from("expenses")
      .insert({
        amount: expense.amount,
        date: expense.date,
        description: expense.description || null,
        category: expense.category,
        receipt_url: expense.receipt_url || null,
      });
    return { error };
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);
    return { error };
  };

  const uploadReceipt = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const { error } = await supabase.storage
      .from("expense-receipts")
      .upload(fileName, file);

    if (error) return { error, url: null };

    const { data: urlData } = supabase.storage
      .from("expense-receipts")
      .getPublicUrl(fileName);

    return { error: null, url: urlData.publicUrl };
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  return {
    expenses,
    isLoading,
    addExpense,
    deleteExpense,
    uploadReceipt,
    getTotalExpenses,
    refetch: fetchExpenses,
  };
}
