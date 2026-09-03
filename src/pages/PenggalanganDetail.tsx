import { useParams, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { usePublicProposals } from "@/hooks/useFundraising";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, Megaphone, Share2, Target, Coins, MessageCircle, Users, Calendar } from "lucide-react";
import { shareContent, buildPublicUrl } from "@/lib/share";
import { useTrackPageView } from "@/hooks/useAnalytics";

const WA_NUMBER = "08976315251";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function PenggalanganDetail() {
  useTrackPageView("/penggalangan");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { proposals, isLoading } = usePublicProposals();

  const proposal = proposals.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Penggalangan dana tidak ditemukan</p>
        <Button onClick={() => navigate("/penggalangan")}>Kembali</Button>
      </div>
    );
  }

  const progress = proposal.target_amount > 0
    ? Math.min((proposal.collected_amount / proposal.target_amount) * 100, 100)
    : 0;

  const handleShare = () => {
    shareContent({
      title: proposal.title,
      text: `${proposal.title}\n\n${proposal.description}\n\nTerkumpul: ${formatCurrency(proposal.collected_amount)} dari ${formatCurrency(proposal.target_amount)} (${progress.toFixed(0)}%)\n\nMari bantu sebarkan 🙏`,
      url: buildPublicUrl(`/penggalangan/${proposal.id}`),
      imageUrl: proposal.image_url,
    });
  };

  const handleWA = () => {
    const message = encodeURIComponent(
      `Assalamu'alaikum, saya ingin berdonasi untuk penggalangan dana "${proposal.title}". Mohon informasinya. Terima kasih.`
    );
    window.open(`https://wa.me/62${WA_NUMBER.slice(1)}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {proposal.image_url ? (
        <div className="relative">
          <img src={proposal.image_url} alt={proposal.title} className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={() => navigate("/penggalangan")} className="absolute top-4 left-4 flex items-center gap-1 text-white/80">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Kembali</span>
          </button>
          <h1 className="absolute bottom-4 left-4 right-4 text-lg font-bold text-white">{proposal.title}</h1>
        </div>
      ) : (
        <div className="gradient-primary px-4 pt-4 pb-6">
          <button onClick={() => navigate("/penggalangan")} className="flex items-center gap-1 text-primary-foreground/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Kembali</span>
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">{proposal.title}</h1>
        </div>
      )}

      <div className="px-4 -mt-3 space-y-4">
        <div className="bg-card rounded-xl p-5 shadow-card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">Terkumpul</span>
            </div>
            <span className="text-xs font-semibold text-primary">{progress.toFixed(0)}%</span>
          </div>
          <p className="text-xl font-bold text-foreground mb-1">{formatCurrency(proposal.collected_amount)}</p>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Target: {formatCurrency(proposal.target_amount)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(proposal.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-card space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">
              <Megaphone className="h-3 w-3" /> {proposal.category}
            </span>
            {proposal.beneficiary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground font-medium">
                <Users className="h-3 w-3" /> {proposal.beneficiary}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold mb-1.5">Latar Belakang</h2>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
              {proposal.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleWA} className="w-full gap-2">
            <MessageCircle className="h-4 w-4" /> Donasi
          </Button>
          <Button variant="outline" onClick={handleShare} className="w-full gap-2">
            <Share2 className="h-4 w-4" /> Bagikan
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
