import { Coins } from "lucide-react";

interface HeroSectionProps {
  totalDonations: number;
  totalTransactions: number;
  totalRegions: number;
}

export function HeroSection({ totalDonations, totalTransactions, totalRegions }: HeroSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="gradient-primary text-primary-foreground rounded-2xl p-6 mx-4 mt-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary-foreground/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary-foreground/5" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">LAZISNU Gendongkulon</h1>
            <p className="text-primary-foreground/80 text-xs">
              Infaq Kaleng Koin NU
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Total Terkumpul</p>
          <p className="text-3xl font-extrabold tracking-tight mt-1">
            {formatCurrency(totalDonations)}
          </p>
        </div>

        <div className="flex gap-6 mt-5 pt-4 border-t border-primary-foreground/20">
          <div>
            <p className="text-2xl font-bold">{totalTransactions}</p>
            <p className="text-primary-foreground/70 text-xs">Transaksi</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalRegions}</p>
            <p className="text-primary-foreground/70 text-xs">Wilayah</p>
          </div>
        </div>
      </div>
    </section>
  );
}
