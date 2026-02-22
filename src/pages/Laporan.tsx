import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { RegionCard } from "@/components/RegionCard";
import { RegionDetail } from "@/components/RegionDetail";
import { DonationTable } from "@/components/DonationTable";
import { useRegions } from "@/hooks/useRegions";
import { useSupabaseDonations } from "@/hooks/useSupabaseDonations";
import { useExpenses } from "@/hooks/useExpenses";
import { Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Laporan = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const { regions, isLoading: regionsLoading } = useRegions();
  const { donations, isLoading: donationsLoading, getDonationsByRegion, getRecentDonations, getTotalDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, getTotalExpenses } = useExpenses();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (regionsLoading || donationsLoading || expensesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <div className="gradient-primary text-primary-foreground px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Laporan Keuangan</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Infaq Kaleng Koin LAZISNU Gendongkulon</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Saldo Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-[10px] text-muted-foreground uppercase">Pemasukan</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{formatCurrency(totalPemasukan)}</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <TrendingDown className="h-4 w-4 mx-auto mb-1 text-red-600" />
            <p className="text-[10px] text-muted-foreground uppercase">Pengeluaran</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{formatCurrency(totalPengeluaran)}</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <Wallet className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-[10px] text-muted-foreground uppercase">Saldo</p>
            <p className="text-xs font-bold text-primary mt-0.5">{formatCurrency(saldo)}</p>
          </div>
        </div>

        <Tabs defaultValue="regions" className="space-y-4">
          <TabsList className="w-full bg-card shadow-card">
            <TabsTrigger value="regions" className="flex-1">Wilayah</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Riwayat</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1">Pengeluaran</TabsTrigger>
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
              <div className="text-center text-muted-foreground py-8 text-sm">Belum ada data pengeluaran</div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{expense.description || "Pengeluaran"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-destructive">{formatCurrency(expense.amount)}</p>
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
