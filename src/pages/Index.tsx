import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { HeroSection } from "@/components/HeroSection";
import { useRegions } from "@/hooks/useRegions";
import { useSupabaseDonations } from "@/hooks/useSupabaseDonations";
import { useExpenses } from "@/hooks/useExpenses";
import { usePrograms } from "@/hooks/usePrograms";
import { useProgramDisbursements } from "@/hooks/useProgramDisbursements";
import { useNews } from "@/hooks/useNews";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { FileText, Newspaper, Phone, Shield, Loader2, Target, Sparkles, MessageCircle, Mail, X, Bell, MapPin, ChevronRight, Heart, Calculator, Clock, BookOpen, HandCoins, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slideshow } from "@/components/Slideshow";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAInstallButton, usePWAInstall } from "@/components/PWAInstallButton";
import { useState } from "react";
import { useTrackPageView } from "@/hooks/useAnalytics";

const Index = () => {
  useTrackPageView("/");
  const { regions, isLoading: regionsLoading } = useRegions();
  const { donations, isLoading: donationsLoading, getTotalDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, getTotalExpenses } = useExpenses();
  const { activePrograms, isLoading: programsLoading } = usePrograms();
  const { disbursements: programDisbursements, isLoading: programDisbursementsLoading } = useProgramDisbursements();
  const { publishedNews, isLoading: newsLoading } = useNews();
  const { user, isAdmin } = useAuth();
  const { canInstall, isStandalone, install } = usePWAInstall();
  const { getSettingsMap, isLoading: settingsLoading } = useSiteSettings();
  const navigate = useNavigate();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (regionsLoading || donationsLoading || expensesLoading || programsLoading || settingsLoading || programDisbursementsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Memuat data...</p>
      </div>
    );
  }

  const totalPemasukan = getTotalDonations();
  const totalPengeluaran = getTotalExpenses();
  const totalTransactions = donations.length + expenses.length;

  const s = getSettingsMap();
  const announcementActive = s.announcement_active === "true";
  const announcementText = s.announcement_text || "";
  const newsSlideshow = s.news_slideshow_enabled !== "false"; // default ON
  const programsSlideshow = s.programs_slideshow_enabled !== "false"; // default ON

  const totalDisbursedByProgram = programDisbursements.reduce((acc, d) => {
    acc.set(d.program_id, (acc.get(d.program_id) || 0) + d.amount);
    return acc;
  }, new Map<string, number>());

  const quickMenuItems = [
    { icon: FileText, label: "Laporan", gradient: "from-primary to-emerald-600", path: "/laporan" },
    { icon: Newspaper, label: "Berita", gradient: "from-amber-500 to-orange-500", path: "/berita" },
    { icon: Heart, label: "Santunan", gradient: "from-rose-500 to-pink-600", path: "/santunan" },
    { icon: BookOpen, label: "Maulid", gradient: "from-emerald-600 to-teal-700", path: "/maulid" },
    { icon: Calculator, label: "Edukasi", gradient: "from-teal-500 to-cyan-600", path: "/edukasi" },
    { icon: MessageCircle, label: "Diskusi", gradient: "from-blue-500 to-indigo-500", path: "/diskusi" },
    { icon: Sparkles, label: "Tanya AI", gradient: "from-violet-500 to-purple-600", path: "/ai-chat" },
    ...(canInstall && !isStandalone ? [{ icon: Download, label: "Install", gradient: "from-sky-500 to-blue-600", path: "__install__", onClick: install }] : []),
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Announcement Banner */}
      {announcementActive && announcementText && !announcementDismissed && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 shrink-0">
            <Bell className="h-3 w-3" />
          </div>
          <p className="text-xs font-medium flex-1 leading-relaxed">{announcementText}</p>
          <button onClick={() => setAnnouncementDismissed(true)} className="shrink-0 hover:bg-white/10 rounded-full p-1 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Admin + Install Buttons */}
      <div className="flex items-center justify-between px-4 pt-3 gap-2">
        <PWAInstallButton />
        {user && isAdmin ? (
          <Button size="sm" onClick={() => navigate("/admin")} className="gap-1.5 text-xs bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md border-0">
            <Shield className="h-3.5 w-3.5" />
            Admin Panel
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
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
        <div className="grid grid-cols-3 gap-2.5">
          {quickMenuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="group flex flex-col items-center gap-2.5 p-3.5 bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 animate-scale-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Berita Terbaru - Slideshow */}
      {!newsLoading && publishedNews.length > 0 && (
        <div className="px-4 mt-7">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">Berita Terbaru</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Update terkini dari kami</p>
            </div>
            <button
              onClick={() => navigate("/berita")}
              className="text-xs font-semibold text-primary flex items-center gap-0.5"
            >
              Semua <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {(() => {
            const items = publishedNews.slice(0, 6);
            const renderNews = (n: typeof publishedNews[number]) => (
              <button
                key={n.id}
                onClick={() => navigate(`/berita?n=${n.id}`)}
                className="block w-full text-left bg-card"
              >
                {n.image_url ? (
                  <div className="relative w-full aspect-[16/10] bg-black">
                    <img src={n.image_url} alt={n.title} className="absolute inset-0 w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        {n.category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 text-white">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1">{n.title}</h3>
                      {n.excerpt && (
                        <p className="text-[11px] text-white/85 line-clamp-2 leading-relaxed">{n.excerpt}</p>
                      )}
                      <p className="text-[10px] text-white/70 mt-1.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(n.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-gradient-to-br from-primary/10 to-emerald-100/40 min-h-[13rem] flex flex-col justify-between">
                    <span className="self-start bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {n.category}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1 text-foreground">{n.title}</h3>
                      {n.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{n.excerpt}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(n.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            );
            if (newsSlideshow) {
              return (
                <Slideshow className="shadow-card border border-border/30" autoPlay={false} showArrows>
                  {items.map(renderNews)}
                </Slideshow>
              );
            }
            return (
              <div className="space-y-3">
                {items.map((n) => (
                  <div key={n.id} className="rounded-2xl overflow-hidden shadow-card border border-border/30">
                    {renderNews(n)}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Program Donasi */}
      <div className="px-4 mt-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Program Donasi</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Salurkan infaq terbaik Anda</p>
          </div>
          {activePrograms.length > 0 && (
            <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
              {activePrograms.length} aktif
            </span>
          )}
        </div>
        {activePrograms.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card text-center border border-border/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-3">
              <Target className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Belum ada program donasi aktif</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Program donasi akan muncul di sini</p>
          </div>
        ) : (
          (() => {
            const featured = activePrograms.slice(0, 3);
            const rest = activePrograms.slice(3);
            const renderCard = (program: typeof activePrograms[number], index: number, variant: "full" | "compact") => {
              const progress = program.target_amount > 0
                ? Math.min((program.collected_amount / program.target_amount) * 100, 100)
                : 0;
              const disbursed = totalDisbursedByProgram.get(program.id) || 0;
              if (variant === "full") {
                return (
                  <div
                    onClick={() => navigate(`/program/${program.id}`)}
                    className="bg-card cursor-pointer"
                  >
                    {program.image_url ? (
                      <div className="relative w-full aspect-[16/10] bg-black">
                        <img src={program.image_url} alt={program.title} className="absolute inset-0 w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {Math.round(progress)}%
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-emerald-200/40 flex items-center justify-center">
                        <Target className="h-10 w-10 text-primary/40" />
                      </div>
                    )}
                    <div className="p-4 pb-8">
                      <h3 className="font-bold text-sm text-foreground mb-1.5 leading-snug">{program.title}</h3>
                      {program.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{program.description}</p>
                      )}
                      <div className="relative h-2 rounded-full bg-muted overflow-hidden mb-3">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Terkumpul</p>
                          <p className="text-sm font-bold text-primary">{formatCurrency(program.collected_amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Target</p>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(program.target_amount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <HandCoins className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-[10px] text-muted-foreground font-medium">Tersalurkan</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(disbursed)}</p>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={program.id}
                  onClick={() => navigate(`/program/${program.id}`)}
                  className="bg-card rounded-2xl shadow-card cursor-pointer hover:shadow-elevated transition-all duration-300 border border-border/30 p-3 flex gap-3 items-center animate-slide-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {program.image_url ? (
                      <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                    ) : (
                      <Target className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs text-foreground line-clamp-1">{program.title}</h3>
                    <div className="relative h-1.5 rounded-full bg-muted overflow-hidden my-1.5">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-emerald-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      <span className="font-bold text-primary">{formatCurrency(program.collected_amount)}</span>
                      {" / "}{formatCurrency(program.target_amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <HandCoins className="h-3 w-3 text-emerald-600" />
                      Tersalurkan: <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(disbursed)}</span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              );
            };
            if (!programsSlideshow) {
              return (
                <div className="space-y-3">
                  {activePrograms.map((p, i) => (
                    <div key={p.id} className="rounded-2xl overflow-hidden shadow-card border border-border/30">
                      {renderCard(p, i, "full")}
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <>
                {featured.length > 0 && (
                  <Slideshow className="shadow-card border border-border/30 mb-3" autoPlay={false} showArrows>
                    {featured.map((p, i) => (
                      <div key={p.id}>{renderCard(p, i, "full")}</div>
                    ))}
                  </Slideshow>
                )}
                {rest.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
                      Program Lainnya
                    </p>
                    {rest.map((p, i) => renderCard(p, i, "compact"))}
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>

      {/* Contact Quick Access */}
      <div className="px-4 mt-7">
        <h2 className="text-base font-bold text-foreground mb-1">Hubungi Kami</h2>
        <p className="text-[11px] text-muted-foreground mb-3">Silakan hubungi kami kapan saja</p>
        <div className="grid grid-cols-2 gap-2.5">
          {s.whatsapp && (
            <a
              href={`https://wa.me/62${s.whatsapp.replace(/\D/g, "").replace(/^0/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-sm">
                <MessageCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground block">WhatsApp</span>
                <span className="text-[10px] text-muted-foreground">Chat langsung</span>
              </div>
            </a>
          )}
          {s.phone && (
            <a
              href={`tel:+62${s.phone.replace(/\D/g, "").replace(/^0/, "")}`}
              className="flex items-center gap-3 p-3.5 bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-sm">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground block">Telepon</span>
                <span className="text-[10px] text-muted-foreground">Hubungi kami</span>
              </div>
            </a>
          )}
          {s.email && (
            <a
              href={`mailto:${s.email}`}
              className="flex items-center gap-3 p-3.5 bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground block">Email</span>
                <span className="text-[10px] text-muted-foreground">Kirim email</span>
              </div>
            </a>
          )}
          <button
            onClick={() => navigate("/kontak")}
            className="flex items-center gap-3 p-3.5 bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-sm">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">Lokasi</span>
              <span className="text-[10px] text-muted-foreground">Lihat peta</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mt-10 mb-4">
        <div className="border-t border-border/50 pt-4">
          <p className="text-center text-[11px] text-muted-foreground/70">
            &copy; {new Date().getFullYear()} LAZISNU Gendongkulon • Amanah & Transparan
          </p>
        </div>
      </div>

      <BottomNav />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
