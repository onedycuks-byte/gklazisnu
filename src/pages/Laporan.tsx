import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { RegionCard } from "@/components/RegionCard";
import { RegionDetail } from "@/components/RegionDetail";
import { DonationTable } from "@/components/DonationTable";
import { useRegions } from "@/hooks/useRegions";
import { useSupabaseDonations } from "@/hooks/useSupabaseDonations";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Laporan = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const { regions, isLoading: regionsLoading } = useRegions();
  const { donations, isLoading: donationsLoading, getDonationsByRegion, getRecentDonations } = useSupabaseDonations();

  if (regionsLoading || donationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <h1 className="text-xl font-bold">Laporan Koin Infaq</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Data donasi per wilayah</p>
      </div>

      <div className="px-4 -mt-4 space-y-6">
        <Tabs defaultValue="regions" className="space-y-4">
          <TabsList className="w-full bg-card shadow-card">
            <TabsTrigger value="regions" className="flex-1">Wilayah</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="regions" className="space-y-3">
            {regionSummaries.map((region, index) => (
              <RegionCard key={region.id} region={region} index={index} onSelect={setSelectedRegionId} />
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            <DonationTable donations={recentDonations} regions={regions} />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Laporan;
