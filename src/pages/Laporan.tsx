import { BottomNav } from "@/components/BottomNav";
import { usePublicFinancialSummary } from "@/hooks/usePublicFinancialSummary";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Wallet, Loader2, MapPin, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const currency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const monthLabel = (value: string) =>
  new Date(`${value}-01T00:00:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

export default function Laporan() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePublicFinancialSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Memuat ringkasan laporan...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-sm font-semibold">Ringkasan laporan belum dapat dimuat.</p>
        <p className="text-xs text-muted-foreground">Silakan coba kembali beberapa saat lagi.</p>
        <button onClick={() => navigate("/")} className="text-sm text-primary font-semibold">Kembali ke beranda</button>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-background pb-20">
      <header className="page-hero relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-700 text-primary-foreground px-4 pt-7 pb-12">
        <div className="relative z-10 flex items-center gap-3 max-w-5xl mx-auto">
          <button onClick={() => navigate("/")} aria-label="Kembali" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Laporan Keuangan</h1>
            <p className="text-white/70 text-xs mt-0.5">Ringkasan transparansi dana LAZISNU</p>
          </div>
        </div>
      </header>

      <main className="page-content max-w-5xl mx-auto px-4 -mt-6 space-y-5">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard label="Total Pemasukan" value={currency(Number(data.total_income || 0))} icon={<ArrowUpRight className="h-4 w-4 text-emerald-600" />} />
          <SummaryCard label="Total Pengeluaran" value={currency(Number(data.total_expenses || 0))} icon={<ArrowDownRight className="h-4 w-4 text-red-600" />} />
          <SummaryCard label="Saldo Saat Ini" value={currency(Number(data.balance || 0))} icon={<Wallet className="h-4 w-4 text-primary" />} />
        </section>

        <section className="rounded-2xl bg-card border border-border/40 shadow-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm">Ringkasan Bulanan</h2>
          </div>
          {data.monthly.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Belum ada transaksi tercatat.</p>
          ) : (
            <div className="space-y-3">
              {data.monthly.map((month) => (
                <div key={month.month} className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs font-bold capitalize mb-2">{monthLabel(month.month)}</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div><p className="text-muted-foreground">Masuk</p><p className="font-semibold text-emerald-700">{currency(Number(month.income))}</p></div>
                    <div><p className="text-muted-foreground">Keluar</p><p className="font-semibold text-red-600">{currency(Number(month.expenses))}</p></div>
                    <div><p className="text-muted-foreground">Saldo</p><p className="font-semibold">{currency(Number(month.balance))}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-card border border-border/40 shadow-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm">Rekap per Wilayah</h2>
          </div>
          {data.regions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Belum ada rekap wilayah.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {data.regions.map((region) => (
                <div key={region.region} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{region.region}</p>
                    <p className="text-[10px] text-muted-foreground">{Number(region.transactions)} transaksi terkonfirmasi</p>
                  </div>
                  <p className="text-xs font-bold text-primary whitespace-nowrap">{currency(Number(region.total))}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-[10px] leading-relaxed text-muted-foreground text-center px-3">
          Halaman ini menampilkan ringkasan agregat. Rincian transaksi, identitas donatur, penerima manfaat, dan bukti pengeluaran hanya tersedia bagi pengurus yang berwenang.
        </p>
      </main>
      <BottomNav />
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border/40 shadow-card p-4 text-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/5 mx-auto mb-2">{icon}</div>
      <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wide">{label}</p>
      <p className="text-sm font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}
