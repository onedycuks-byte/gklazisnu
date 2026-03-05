import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { HeroSection } from "@/components/HeroSection";
import { useRegions } from "@/hooks/useRegions";
import { useSupabaseDonations } from "@/hooks/useSupabaseDonations";
import { useExpenses } from "@/hooks/useExpenses";
import { usePrograms } from "@/hooks/usePrograms";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { FileText, Newspaper, Phone, Shield, Loader2, Target, Sparkles, MessageCircle, Mail, X, Bell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useState } from "react";
import { useTrackPageView } from "@/hooks/useAnalytics";

const Index = () => {
  useTrackPageView("/");
  const { regions, isLoading: regionsLoading } = useRegions();
  const { donations, isLoading: donationsLoading, getTotalDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, getTotalExpenses } = useExpenses();
  const { activePrograms, isLoading: programsLoading } = usePrograms();
  const { user, isAdmin } = useAuth();
  const { getSettingsMap, isLoading: settingsLoading } = useSiteSettings();
  const navigate = useNavigate();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (regionsLoading || donationsLoading || expensesLoading || programsLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPemasukan = getTotalDonations();
  const totalPengeluaran = getTotalExpenses();
  const totalTransactions = donations.length + expenses.length;

  const s = getSettingsMap();
  const announcementActive = s.announcement_active === "true";
  const announcementText = s.announcement_text || "";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Announcement Banner - Fixed at top */}
      {announcementActive && announcementText && !announcementDismissed && (
        <div className="sticky top-0 z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 shadow-md animate-slide-up">
          <Bell className="h-4 w-4 shrink-0 animate-bounce" />
          <p className="text-xs font-medium flex-1 leading-relaxed">{announcementText}</p>
          <button onClick={() => setAnnouncementDismissed(true)} className="shrink-0 opacity-70 hover:opacity-100 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: FileText, label: "Laporan", color: "gradient-primary", path: "/laporan" },
            { icon: Newspaper, label: "Berita", color: "gradient-gold", path: "/berita" },
            { icon: MessageCircle, label: "Diskusi", color: "gradient-primary", path: "/diskusi" },
            { icon: Sparkles, label: "Tanya AI", color: "gradient-gold", path: "/ai-chat" },
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

      {/* Program Penggalangan Dana */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Program Donasi</h2>
        </div>
        {activePrograms.length === 0 ? (
          <div className="bg-card rounded-xl p-6 shadow-card text-center">
            <Target className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada program donasi aktif</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePrograms.map((program, index) => {
              const progress = program.target_amount > 0
                ? Math.min((program.collected_amount / program.target_amount) * 100, 100)
                : 0;
              return (
                <div
                  key={program.id}
                  onClick={() => navigate(`/program/${program.id}`)}
                  className="bg-card rounded-xl overflow-hidden shadow-card cursor-pointer hover:shadow-elevated transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {program.image_url && (
                    <img src={program.image_url} alt={program.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-foreground mb-2">{program.title}</h3>
                    {program.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{program.description}</p>
                    )}
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Terkumpul</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(program.collected_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(program.target_amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Quick Access */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold text-foreground mb-3">Hubungi Kami</h2>
        <div className="flex gap-3">
          {s.whatsapp && (
            <a
              href={`https://wa.me/62${s.whatsapp.replace(/\D/g, "").replace(/^0/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-card hover:shadow-elevated transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">WhatsApp</span>
            </a>
          )}
          {s.phone && (
            <a
              href={`tel:+62${s.phone.replace(/\D/g, "").replace(/^0/, "")}`}
              className="flex-1 flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-card hover:shadow-elevated transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <Phone className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">Telepon</span>
            </a>
          )}
          {s.email && (
            <a
              href={`mailto:${s.email}`}
              className="flex-1 flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-card hover:shadow-elevated transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">Email</span>
            </a>
          )}
          <button
            onClick={() => navigate("/kontak")}
            className="flex-1 flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-card hover:shadow-elevated transition-all"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">Lokasi</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mt-8 mb-4">
        <p className="text-center text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} LAZISNU Gendongkulon
        </p>
      </div>

      <BottomNav />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
