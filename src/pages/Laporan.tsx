import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { RegionCard } from "@/components/RegionCard";
import { RegionDetail } from "@/components/RegionDetail";
import { DonationTable } from "@/components/DonationTable";
import { useRegions } from "@/hooks/useRegions";
import { useSupabaseDonations } from "@/hooks/useSupabaseDonations";
import { useExpenses } from "@/hooks/useExpenses";
import { Loader2, TrendingUp, TrendingDown, Wallet, Image, ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const Laporan = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const { regions, isLoading: regionsLoading } = useRegions();
  const { donations, isLoading: donationsLoading, getDonationsByRegion, getRecentDonations, getTotalDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, getTotalExpenses } = useExpenses();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (regionsLoading || donationsLoading || expensesLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-16 gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Memuat laporan...</p>
      </div>
    );
  }

  const totalPemasukan = getTotalDonations();
  const totalPengeluaran = getTotalExpenses();
  const saldo = totalPemasukan - totalPengeluaran;

  const regionSummaries = regions.map((region) => {
    const regionDonations = donations.filter((d) => d.region_id === region.id);
    const totalDonations = regionDonations.reduce((sum, d) => sum + d.amount, 0);
    return { ...region, totalDonations, donationCount: regionDonations.length };
  });

  const recentDonations = getRecentDonations(10).map((d) => ({
    id: d.id, regionId: d.region_id, amount: d.amount, date: d.date, notes: d.notes || undefined,
  }));

  if (selectedRegionId) {
    const region = regions.find((r) => r.id === selectedRegionId);
    if (!region) { setSelectedRegionId(null); return null; }
    const regionDonations = getDonationsByRegion(selectedRegionId).map((d) => ({
      id: d.id, regionId: d.region_id, amount: d.amount, date: d.date, notes: d.notes || undefined,
    }));
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-6">
          <RegionDetail region={region} donations={regionDonations} onBack={() => setSelectedRegionId(null)} regions={regions} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-700 text-primary-foreground px-4 pt-6 pb-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Laporan Keuangan</h1>
            <p className="text-white/60 text-xs mt-0.5">Infaq Kaleng Koin LAZISNU</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-2xl p-3 shadow-card text-center border border-border/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 mx-auto mb-1.5">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wide">Pemasukan</p>
            <p className="text-[11px] font-bold text-foreground mt-0.5">{formatCurrency(totalPemasukan)}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center border border-border/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-1.5">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wide">Pengeluaran</p>
            <p className="text-[11px] font-bold text-foreground mt-0.5">{formatCurrency(totalPengeluaran)}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center border border-border/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-1.5">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wide">Saldo</p>
            <p className="text-[11px] font-bold text-primary mt-0.5">{formatCurrency(saldo)}</p>
          </div>
        </div>

        <Tabs defaultValue="regions" className="space-y-3">
          <TabsList className="w-full bg-card shadow-card rounded-xl h-11 p-1 border border-border/30">
            <TabsTrigger value="regions" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:shadow-sm">Wilayah</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:shadow-sm">Riwayat</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:shadow-sm">Pengeluaran</TabsTrigger>
          </TabsList>

          <TabsContent value="regions" className="space-y-3">
            {regionSummaries.map((region, index) => (
              <RegionCard key={region.id} region={region} index={index} onSelect={setSelectedRegionId} />
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            <DonationTable donations={recentDonations} regions={regions} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-2">
            {expenses.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 bg-card rounded-2xl shadow-card border border-border/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-3">
                  <TrendingDown className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">Belum ada data pengeluaran</p>
              </div>
            ) : (
              expenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card border border-border/30 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-400/20 to-red-600/20 shrink-0">
                    <ArrowDownRight className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground truncate">{expense.description || "Pengeluaran"}</p>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-primary/10 text-primary shrink-0 uppercase tracking-wide">{expense.category || "Operasional"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(expense.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {expense.receipt_url && (
                      <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                        <Image className="h-4 w-4" />
                      </a>
                    )}
                    <p className="font-bold text-sm text-destructive">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Laporan;
