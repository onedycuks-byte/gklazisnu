import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
}

export interface ExpenseInput {
  amount: number;
  date: string;
  description?: string;
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

  const getTotalExpenses = () => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  return {
    expenses,
    isLoading,
    addExpense,
    deleteExpense,
    getTotalExpenses,
    refetch: fetchExpenses,
  };
}
