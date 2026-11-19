import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";
import { BottomNav } from "@/components/BottomNav";
import { usePublicProposals } from "@/hooks/useFundraising";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, Megaphone, Share2, Target } from "lucide-react";
import { shareContent, buildPublicUrl } from "@/lib/share";
import { useTrackPageView } from "@/hooks/useAnalytics";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function Penggalangan() {
  useTrackPageView("/penggalangan");
  const navigate = useNavigate();
  const { proposals, isLoading } = usePublicProposals();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-background pb-24">
      <div className="page-hero gradient-primary px-4 pt-6 pb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-1 text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 px-0 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-lg font-bold text-primary-foreground">Penggalangan Dana</h1>
        <p className="text-xs text-primary-foreground/80 mt-0.5">
          Pengajuan penggalangan dana yang telah disetujui pengurus
        </p>
      </div>

      <div className="page-content px-4 mt-6">
        {proposals.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card text-center border border-border/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-3">
              <Megaphone className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Belum ada penggalangan dana disetujui</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Pengajuan yang disetujui akan tampil di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proposals.map((p, index) => {
              const progress = p.target_amount > 0 ? Math.min((p.collected_amount / p.target_amount) * 100, 100) : 0;
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/penggalangan/${p.id}`)}
                  className="bg-card rounded-2xl shadow-card cursor-pointer hover:shadow-elevated transition-all duration-300 border border-border/30 p-3 flex gap-3 items-center animate-slide-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-contain" />
                    ) : (
                      <Megaphone className="h-6 w-6 text-muted-foreground/50" />
                    )}
                    <button
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        shareContent({
                          title: p.title,
                          text: `${p.title}\n\n${p.description}\n\nTerkumpul ${formatCurrency(p.collected_amount)} dari ${formatCurrency(p.target_amount)}`,
                          url: buildPublicUrl(`/penggalangan/${p.id}`),
                          imageUrl: p.image_url,
                        });
                      }}
                      className="absolute top-0.5 right-0.5 z-10 h-5 w-5 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition"
                      aria-label="Bagikan penggalangan"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs text-foreground line-clamp-1">{p.title}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {p.category}
                      {p.beneficiary ? ` · ${p.beneficiary}` : ""}
                    </p>
                    <Progress value={progress} className="h-1.5 my-1.5" />
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-primary">{formatCurrency(p.collected_amount)}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {formatCurrency(p.target_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
