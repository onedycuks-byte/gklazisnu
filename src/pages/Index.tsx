import { useState } from "react";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { RegionCard } from "@/components/RegionCard";
import { AddDonationDialog } from "@/components/AddDonationDialog";
import { DonationTable } from "@/components/DonationTable";
import { RegionDetail } from "@/components/RegionDetail";
import { useDonations } from "@/hooks/useDonations";
import { regions } from "@/data/regions";
import { Coins, MapPin, TrendingUp, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const {
    addDonation,
    deleteDonation,
    getRegionSummaries,
    getTotalDonations,
    getDonationsByRegion,
    getRecentDonations,
  } = useDonations();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const regionSummaries = getRegionSummaries();
  const totalDonations = getTotalDonations();
  const totalTransactions = regionSummaries.reduce((sum, r) => sum + r.donationCount, 0);
  const recentDonations = getRecentDonations(10);

  if (selectedRegionId) {
    const region = regions.find((r) => r.id === selectedRegionId)!;
    const donations = getDonationsByRegion(selectedRegionId);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <RegionDetail
            region={region}
            donations={donations}
            onBack={() => setSelectedRegionId(null)}
            onAddDonation={addDonation}
            onDeleteDonation={deleteDonation}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        {/* Stats Overview */}
        <section className="animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground mb-4">Ringkasan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Terkumpul"
              value={formatCurrency(totalDonations)}
              icon={Coins}
              variant="gold"
            />
            <StatCard
              title="Jumlah Wilayah"
              value="5"
              subtitle="wilayah aktif"
              icon={MapPin}
              variant="primary"
            />
            <StatCard
              title="Total Transaksi"
              value={totalTransactions.toString()}
              subtitle="kali penyetoran"
              icon={TrendingUp}
            />
            <StatCard
              title="Koordinator"
              value="5"
              subtitle="orang aktif"
              icon={Users}
            />
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="regions" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="regions">Wilayah</TabsTrigger>
            <TabsTrigger value="history">Riwayat Terbaru</TabsTrigger>
          </TabsList>

          <TabsContent value="regions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Daftar Wilayah</h2>
                <p className="text-sm text-muted-foreground">
                  Klik wilayah untuk melihat detail dan menambah donasi
                </p>
              </div>
              <AddDonationDialog onAdd={addDonation} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regionSummaries.map((region, index) => (
                <RegionCard
                  key={region.id}
                  region={region}
                  index={index}
                  onSelect={setSelectedRegionId}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Riwayat Donasi Terbaru</h2>
                <p className="text-sm text-muted-foreground">
                  10 transaksi terakhir dari semua wilayah
                </p>
              </div>
              <AddDonationDialog onAdd={addDonation} />
            </div>
            <DonationTable
              donations={recentDonations}
              onDelete={deleteDonation}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LAZIZNU Gendongkulon. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
