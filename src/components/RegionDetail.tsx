import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone } from "lucide-react";
import { DonationTable } from "./DonationTable";
import { StatCard } from "./StatCard";
import { Coins, Calendar } from "lucide-react";

interface Region {
  id: string;
  name: string;
  coordinator: string;
  phone: string;
}

interface Donation {
  id: string;
  regionId: string;
  amount: number;
  date: string;
  notes?: string;
}

interface RegionDetailProps {
  region: Region;
  donations: Donation[];
  onBack: () => void;
  regions: Region[];
}

export function RegionDetail({
  region,
  donations,
  onBack,
  regions,
}: RegionDetailProps) {
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{region.name}</h2>
          <p className="text-muted-foreground">Detail wilayah dan riwayat donasi</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card p-5 shadow-card sm:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Informasi Koordinator</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <User className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{region.coordinator}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Phone className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telepon</p>
                <p className="font-medium">{region.phone}</p>
              </div>
            </div>
          </div>
        </div>
        <StatCard
          title="Total Terkumpul"
          value={formatCurrency(totalAmount)}
          icon={Coins}
          variant="primary"
        />
        <StatCard
          title="Jumlah Transaksi"
          value={donations.length.toString()}
          subtitle="kali penyetoran"
          icon={Calendar}
        />
      </div>

      <div className="rounded-xl bg-card p-6 shadow-card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Riwayat Donasi</h3>
          <p className="text-sm text-muted-foreground">
            Daftar penyetoran infaq kaleng koin
          </p>
        </div>
        <DonationTable
          donations={donations}
          regions={regions}
          showRegion={false}
        />
      </div>
    </div>
  );
}
