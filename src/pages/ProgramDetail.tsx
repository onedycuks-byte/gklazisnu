import { useParams, useNavigate } from "react-router-dom";
import { usePrograms } from "@/hooks/usePrograms";
import { useProgramDisbursements } from "@/hooks/useProgramDisbursements";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, MessageCircle, Target, Coins, Share2, HandCoins, Calendar, Eye } from "lucide-react";
import { shareContent, buildPublicUrl } from "@/lib/share";
import { useEffect } from "react";
import { useContentStats, trackProgramView, trackProgramShare } from "@/hooks/useContentStats";

const WA_NUMBER = "08976315251";

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { programs, isLoading } = usePrograms();
  const { disbursements, totalDisbursed } = useProgramDisbursements(id);

  const program = programs.find((p) => p.id === id);
  const { programStat } = useContentStats();

  useEffect(() => {
    if (id) trackProgramView(id);
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleConfirmWA = () => {
    const message = encodeURIComponent(
      `Assalamu'alaikum, saya ingin mengkonfirmasi donasi untuk program "${program?.title}". Mohon diverifikasi. Terima kasih.`
    );
    window.open(`https://wa.me/62${WA_NUMBER.slice(1)}?text=${message}`, "_blank");
  };

  const handleShare = () => {
    if (!program) return;
    const progressPct = program.target_amount > 0
      ? Math.round((program.collected_amount / program.target_amount) * 100)
      : 0;
    const text = `${program.title}\n\n${program.description ?? ""}\n\nTerkumpul: ${formatCurrency(program.collected_amount)} dari ${formatCurrency(program.target_amount)} (${progressPct}%)\n\nMari bantu sebarkan donasi ini 🙏`;
    trackProgramShare(program.id);
    shareContent({
      title: program.title,
      text,
      url: buildPublicUrl(`/program/${program.id}`),
      imageUrl: program.image_url,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Program tidak ditemukan</p>
        <Button onClick={() => navigate("/")}>Kembali</Button>
      </div>
    );
  }

  const progress = program.target_amount > 0
    ? Math.min((program.collected_amount / program.target_amount) * 100, 100)
    : 0;

  return (
    <div className="page-container min-h-screen bg-background pb-24">
      {/* Header with image */}
      {program.image_url ? (
        <div className="relative">
          <img src={program.image_url} alt={program.title} className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={() => navigate("/")} className="absolute top-4 left-4 flex items-center gap-1 text-white/80">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Kembali</span>
          </button>
          <h1 className="absolute bottom-4 left-4 text-lg font-bold text-white">{program.title}</h1>
        </div>
      ) : (
        <div className="page-hero gradient-primary px-4 pt-6 pb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-primary-foreground/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Kembali</span>
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">{program.title}</h1>
        </div>
      )}

      <div className="page-content mx-auto max-w-5xl px-4 -mt-4">
        {/* Progress Card */}
        <div className="surface-card bg-card rounded-2xl p-5 shadow-card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">Terkumpul</span>
            </div>
            <span className="text-xs font-semibold text-primary">{progress.toFixed(0)}%</span>
          </div>
          <p className="text-xl font-bold text-foreground mb-1">{formatCurrency(program.collected_amount)}</p>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Target: {formatCurrency(program.target_amount)}
            </span>
            <span className="flex items-center gap-2.5">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{programStat(program.id).views}</span>
              <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{programStat(program.id).shares}</span>
            </span>
          </div>
        </div>

        {/* Description */}
        {program.description && (
          <div className="surface-card bg-card rounded-2xl p-5 shadow-card mt-4 animate-slide-up" style={{ animationDelay: "80ms" }}>
            <h2 className="text-sm font-bold text-foreground mb-2">Tentang Program</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{program.description}</p>
          </div>
        )}

        {/* QRIS */}
        {program.qris_image_url && (
          <div className="surface-card bg-card rounded-2xl p-5 shadow-card mt-4 animate-slide-up text-center" style={{ animationDelay: "160ms" }}>
            <h2 className="text-sm font-bold text-foreground mb-3">Bayar via QRIS</h2>
            <div className="bg-background rounded-lg p-3 inline-block">
              <img
                src={program.qris_image_url}
                alt="QRIS Payment"
                className="max-w-[250px] w-full mx-auto rounded"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Scan QR code di atas menggunakan aplikasi e-wallet atau mobile banking Anda
            </p>
          </div>
        )}

        {/* Laporan Penyaluran */}
        <div className="surface-card bg-card rounded-2xl p-5 shadow-card mt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Laporan Penyaluran</h2>
            </div>
            <span className="text-xs font-semibold text-primary">{disbursements.length} kegiatan</span>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 mb-3">
            <p className="text-xs text-muted-foreground">Total Tersalurkan</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalDisbursed)}</p>
          </div>
          {disbursements.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Belum ada laporan penyaluran</p>
          ) : (
            <div className="space-y-2">
              {disbursements.map((d) => (
                <div key={d.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{d.recipient_name}</p>
                    <p className="text-sm font-bold text-primary whitespace-nowrap">{formatCurrency(d.amount)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                  {d.image_url && (
                    <img src={d.image_url} alt={d.recipient_name} className="mt-2 w-full rounded-md max-h-48 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2 animate-slide-up" style={{ animationDelay: "240ms" }}>
          <Button onClick={handleConfirmWA} className="w-full h-12 gap-2 text-base" variant="success">
            <MessageCircle className="h-5 w-5" />
            Konfirmasi via WhatsApp
          </Button>
          <Button onClick={handleShare} variant="outline" className="w-full h-12 gap-2 text-base">
            <Share2 className="h-5 w-5" />
            Bagikan Program
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Setelah transfer, konfirmasi pembayaran Anda ke WhatsApp {WA_NUMBER}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
