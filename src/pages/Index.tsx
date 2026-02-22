import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { HeroSection } from "@/components/HeroSection";
import { useRegions } from "@/hooks/useRegions";
import { useSupabaseDonations } from "@/hooks/useSupabaseDonations";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Newspaper, Phone, Shield, Loader2, MapPin, ChevronRight, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { regions, isLoading: regionsLoading } = useRegions();
  const { donations, isLoading: donationsLoading, getTotalDonations, getRecentDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, getTotalExpenses } = useExpenses();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (regionsLoading || donationsLoading || expensesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPemasukan = getTotalDonations();
  const totalPengeluaran = getTotalExpenses();
  const totalTransactions = donations.length + expenses.length;
  const recentDonations = getRecentDonations(3);

  const regionSummaries = regions
    .map((region) => {
      const regionDonations = donations.filter((d) => d.region_id === region.id);
      const total = regionDonations.reduce((sum, d) => sum + d.amount, 0);
      return { ...region, total, count: regionDonations.length };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Admin Button */}
      <div className="flex justify-end px-4 pt-3">
        {user && isAdmin ? (
          <Button size="sm" onClick={() => navigate("/admin")} variant="destructive" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />
            Admin Panel
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Login
          </Button>
        )}
      </div>

      {/* Hero */}
      <HeroSection
        totalPemasukan={totalPemasukan}
        totalPengeluaran={totalPengeluaran}
        totalTransactions={totalTransactions}
        totalRegions={regions.length}
      />

      {/* Quick Menu */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FileText, label: "Laporan", color: "gradient-primary", path: "/laporan" },
            { icon: Newspaper, label: "Berita", color: "gradient-gold", path: "/berita" },
            { icon: Phone, label: "Kontak", color: "gradient-primary", path: "/kontak" },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-card hover:shadow-elevated transition-all animate-scale-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.color} text-primary-foreground`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Wilayah */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Top Wilayah</h2>
          <button onClick={() => navigate("/laporan")} className="text-xs text-primary font-semibold flex items-center gap-0.5">
            Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {regionSummaries.map((region, index) => (
            <div
              key={region.id}
              onClick={() => navigate("/laporan")}
              className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-card cursor-pointer hover:shadow-elevated transition-all animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{region.name}</p>
                <p className="text-xs text-muted-foreground">{region.count} transaksi</p>
              </div>
              <p className="font-bold text-sm text-primary">{formatCurrency(region.total)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Transaksi Terbaru</h2>
          <button onClick={() => navigate("/laporan")} className="text-xs text-primary font-semibold flex items-center gap-0.5">
            Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {recentDonations.map((d, index) => {
            const region = regions.find((r) => r.id === d.region_id);
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-card animate-slide-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{region?.name || "Wilayah"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p className="font-bold text-sm text-primary">{formatCurrency(d.amount)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mt-8 mb-4">
        <p className="text-center text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} LAZISNU Gendongkulon
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
