import { CalendarDays, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Donation } from "@/hooks/useSupabaseDonations";
import { Expense } from "@/hooks/useExpenses";
import { useMemo } from "react";

interface MonthlyRecapProps {
  donations: Donation[];
  expenses: Expense[];
}

interface MonthData {
  label: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
}

export function MonthlyRecap({ donations, expenses }: MonthlyRecapProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const monthlyData = useMemo(() => {
    const months: Record<string, MonthData> = {};

    const confirmedDonations = donations.filter(d => d.status === "confirmed");

    confirmedDonations.forEach((d) => {
      const date = new Date(d.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = {
          label: date.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
          pemasukan: 0,
          pengeluaran: 0,
          saldo: 0,
        };
      }
      months[key].pemasukan += d.amount;
    });

    expenses.forEach((e) => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = {
          label: date.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
          pemasukan: 0,
          pengeluaran: 0,
          saldo: 0,
        };
      }
      months[key].pengeluaran += e.amount;
    });

    Object.keys(months).forEach((key) => {
      months[key].saldo = months[key].pemasukan - months[key].pengeluaran;
    });

    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([, data]) => data);
  }, [donations, expenses]);

  if (monthlyData.length === 0) return null;

  return (
    <div className="px-4 mt-7">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-4 w-4 text-primary" />
        <div>
          <h2 className="text-base font-bold text-foreground">Rekap Bulanan</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Ringkasan keuangan per bulan</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {monthlyData.map((month, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl p-4 shadow-card border border-border/30 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs font-bold text-foreground mb-3 capitalize">{month.label}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Masuk</p>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(month.pemasukan)}</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-red-50 dark:bg-red-950/30">
                <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Keluar</p>
                <p className="text-[11px] font-bold text-red-700 dark:text-red-400">{formatCurrency(month.pengeluaran)}</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-primary/5 dark:bg-primary/10">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Saldo</p>
                <p className={`text-[11px] font-bold ${month.saldo >= 0 ? "text-primary" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(month.saldo)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
