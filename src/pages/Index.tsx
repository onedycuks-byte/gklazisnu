import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { RegionCard } from "@/components/RegionCard";
import { DonationTable } from "@/components/DonationTable";
import { RegionDetail } from "@/components/RegionDetail";
import { useRegions } from "@/hooks/useRegions";
import { useSupabaseDonations } from "@/hooks/useSupabaseDonations";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, MapPin, TrendingUp, Users, Shield, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const { regions, isLoading: regionsLoading } = useRegions();
  const { 
    donations, 
    isLoading: donationsLoading,
    getDonationsByRegion,
    getTotalDonations,
    getRecentDonations,
  } = useSupabaseDonations();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (regionsLoading || donationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const regionSummaries = regions.map((region) => {
    const regionDonations = donations.filter((d) => d.region_id === region.id);
    const totalDonations = regionDonations.reduce((sum, d) => sum + d.amount, 0);
    return {
      ...region,
      totalDonations,
      donationCount: regionDonations.length,
    };
  });

  const totalDonations = getTotalDonations();
  const totalTransactions = donations.length;
  const recentDonations = getRecentDonations(10).map((d) => ({
    id: d.id,
    regionId: d.region_id,
    amount: d.amount,
    date: d.date,
    notes: d.notes || undefined,
  }));

  if (selectedRegionId) {
    const region = regions.find((r) => r.id === selectedRegionId);
    if (!region) {
      setSelectedRegionId(null);
      return null;
    }
    
    const regionDonations = getDonationsByRegion(selectedRegionId).map((d) => ({
      id: d.id,
      regionId: d.region_id,
      amount: d.amount,
      date: d.date,
      notes: d.notes || undefined,
    }));

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <RegionDetail
            region={region}
            donations={regionDonations}
            onBack={() => setSelectedRegionId(null)}
            regions={regions}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        {/* Admin Button */}
        <div className="flex justify-end">
          {user && isAdmin ? (
            <Button onClick={() => navigate("/admin")} className="gap-2">
              <Shield className="h-4 w-4" />
              Dashboard Admin
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate("/auth")} className="gap-2">
              <Shield className="h-4 w-4" />
              Login Admin
            </Button>
          )}
        </div>

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
              value={regions.length.toString()}
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
              value={regions.length.toString()}
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
            <div>
              <h2 className="text-xl font-semibold text-foreground">Daftar Wilayah</h2>
              <p className="text-sm text-muted-foreground">
                Klik wilayah untuk melihat detail donasi
              </p>
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
            <div>
              <h2 className="text-xl font-semibold text-foreground">Riwayat Donasi Terbaru</h2>
              <p className="text-sm text-muted-foreground">
                10 transaksi terakhir dari semua wilayah
              </p>
            </div>
            <DonationTable
              donations={recentDonations}
              regions={regions}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LAZISNU Gendongkulon. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
