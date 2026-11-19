import { Coins, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, MapPin, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

interface HeroSectionProps {
  totalPemasukan: number;
  totalPengeluaran: number;
  totalTransactions: number;
  totalRegions: number;
}

export function HeroSection({ totalPemasukan, totalPengeluaran, totalTransactions, totalRegions }: HeroSectionProps) {
  const saldo = totalPemasukan - totalPengeluaran;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <section className="relative mx-auto mt-3 w-full max-w-6xl px-4 sm:mt-5 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-primary to-emerald-700 px-5 py-6 text-primary-foreground shadow-[0_24px_70px_-28px_hsl(var(--primary)/0.65)] sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_24px_8px_rgba(252,211,77,0.25)]" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-white/30 sm:h-14 sm:w-14">
                <img src={logo} alt="Logo LAZISNU" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100/75">Lembaga Amil Zakat, Infak dan Sedekah</p>
                <h1 className="mt-0.5 text-lg font-extrabold tracking-tight sm:text-xl">LAZISNU Gendongkulon</h1>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/65"><MapPin className="h-3 w-3" /> Gendongkulon</p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-amber-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Amanah • Transparan • Peduli
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Ringkasan keuangan</p>
              <p className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">{formatCurrency(saldo)}</p>
              <p className="mt-2 text-sm text-emerald-50/70">Total saldo dari pencatatan pemasukan dan pengeluaran.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/[0.11] p-4 backdrop-blur-md sm:p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Total pemasukan</p>
              <p className="mt-1.5 break-words text-base font-extrabold sm:text-lg">{formatCurrency(totalPemasukan)}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.11] p-4 backdrop-blur-md sm:p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-300/15 text-rose-200">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Total pengeluaran</p>
              <p className="mt-1.5 break-words text-base font-extrabold sm:text-lg">{formatCurrency(totalPengeluaran)}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-emerald-950/25 px-4 py-3.5 backdrop-blur-md sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/15 text-amber-200">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Aktivitas tercatat</p>
                  <p className="text-lg font-extrabold">{totalTransactions} <span className="text-xs font-medium text-white/60">transaksi</span></p>
                </div>
              </div>
              <div className="h-9 w-px bg-white/15" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Jangkauan</p>
                  <p className="text-lg font-extrabold">{totalRegions} <span className="text-xs font-medium text-white/60">wilayah</span></p>
                </div>
              </div>
              <Wallet className="hidden h-5 w-5 text-white/20 sm:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
