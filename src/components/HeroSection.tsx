import { Coins, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import logo from "@/assets/logo.png";

interface HeroSectionProps {
  totalPemasukan: number;
  totalPengeluaran: number;
  totalTransactions: number;
  totalRegions: number;
}

export function HeroSection({ totalPemasukan, totalPengeluaran, totalTransactions, totalRegions }: HeroSectionProps) {
  const saldo = totalPemasukan - totalPengeluaran;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="mx-4 mt-4 relative">
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-700 p-5 text-primary-foreground shadow-elevated">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/[0.03]" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <img src={logo} alt="LAZISNU" className="h-11 w-11 rounded-full object-contain bg-white/90 p-0.5 ring-2 ring-white/20" />
            <div>
              <h1 className="text-base font-bold tracking-tight">LAZISNU Gendongkulon</h1>
              <p className="text-white/60 text-[11px] font-medium">Infaq Kaleng Koin NU</p>
            </div>
          </div>

          {/* Saldo */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="h-3.5 w-3.5 text-white/50" />
              <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest">Total Saldo</p>
            </div>
            <p className="text-[28px] font-extrabold tracking-tight leading-tight">
              {formatCurrency(saldo)}
            </p>
          </div>

          {/* Income & Expense Cards */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="bg-white/[0.12] backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">Pemasukan</p>
              </div>
              <p className="text-sm font-bold">{formatCurrency(totalPemasukan)}</p>
            </div>
            <div className="bg-white/[0.12] backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-400/20">
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-300" />
                </div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">Pengeluaran</p>
              </div>
              <p className="text-sm font-bold">{formatCurrency(totalPengeluaran)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                <Coins className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{totalTransactions}</p>
                <p className="text-white/50 text-[10px] font-medium">Transaksi</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{totalRegions}</p>
                <p className="text-white/50 text-[10px] font-medium">Wilayah</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
