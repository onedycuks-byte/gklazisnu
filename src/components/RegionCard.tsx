import { MapPin, User, Phone, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegionSummary {
  id: string;
  name: string;
  coordinator: string;
  phone: string;
  totalDonations: number;
  donationCount: number;
}

interface RegionCardProps {
  region: RegionSummary;
  index: number;
  onSelect: (regionId: string) => void;
}

export function RegionCard({ region, index, onSelect }: RegionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      onClick={() => onSelect(region.id)}
      className={cn(
        "group cursor-pointer rounded-xl bg-card p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-slide-up",
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground font-bold text-lg">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {region.name}
          </h3>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{region.coordinator}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{region.phone}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>{region.donationCount} transaksi</span>
          </div>
          <span className="font-bold text-primary">
            {formatCurrency(region.totalDonations)}
          </span>
        </div>
      </div>
    </div>
  );
}
