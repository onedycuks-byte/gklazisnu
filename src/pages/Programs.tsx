import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { usePrograms } from "@/hooks/usePrograms";
import { useProgramDisbursements } from "@/hooks/useProgramDisbursements";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, HandCoins, Share2, Loader2, Eye } from "lucide-react";
import type { MouseEvent } from "react";
import { shareContent, buildPublicUrl } from "@/lib/share";
import { useContentStats, trackProgramShare } from "@/hooks/useContentStats";

export default function Programs() {
  const navigate = useNavigate();
  const { activePrograms, isLoading: programsLoading } = usePrograms();
  const { disbursements, isLoading: disbursementsLoading } = useProgramDisbursements();
  const { programStat } = useContentStats();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const totalDisbursedByProgram = disbursements.reduce((acc, d) => {
    acc.set(d.program_id, (acc.get(d.program_id) || 0) + d.amount);
    return acc;
  }, new Map<string, number>());

  if (programsLoading || disbursementsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-background pb-24">
      <div className="page-hero gradient-primary px-4 pt-6 pb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1 text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 px-0 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-lg font-bold text-primary-foreground">Program Donasi</h1>
        <p className="text-xs text-primary-foreground/80 mt-0.5">Semua program infaq dan donasi LAZISNU</p>
      </div>

      <div className="page-content px-4 mt-6">
        {activePrograms.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card text-center border border-border/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-3">
              <Target className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Belum ada program donasi aktif</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Program donasi akan muncul di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activePrograms.map((program, index) => {
              const progress = program.target_amount > 0
                ? Math.min((program.collected_amount / program.target_amount) * 100, 100)
                : 0;
              const disbursed = totalDisbursedByProgram.get(program.id) || 0;
              return (
                <div
                  key={program.id}
                  onClick={() => navigate(`/program/${program.id}`)}
                  className="surface-card bg-card rounded-2xl shadow-card cursor-pointer hover:shadow-elevated transition-all duration-300 border border-border/30 p-4 flex gap-4 items-center animate-slide-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {program.image_url ? (
                      <img src={program.image_url} alt={program.title} className="w-full h-full object-contain" />
                    ) : (
                      <Target className="h-6 w-6 text-muted-foreground/50" />
                    )}
                    <button
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        const progressPct = program.target_amount > 0 ? Math.round((program.collected_amount / program.target_amount) * 100) : 0;
                        trackProgramShare(program.id);
                        shareContent({
                          title: program.title,
                          text: `${program.title}\n\n${program.description ?? ""}\n\nTerkumpul ${progressPct}% — ${formatCurrency(program.collected_amount)} dari ${formatCurrency(program.target_amount)}`,
                          url: buildPublicUrl(`/program/${program.id}`),
                          imageUrl: program.image_url,
                        });
                      }}
                      className="absolute top-0.5 right-0.5 z-10 h-5 w-5 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition"
                      aria-label="Bagikan program"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs text-foreground line-clamp-1">{program.title}</h3>
                    <Progress value={progress} className="h-1.5 my-1.5" />
                    <p className="text-[10px] text-muted-foreground">
                      <span className="font-bold text-primary">{formatCurrency(program.collected_amount)}</span>
                      {" / "}{formatCurrency(program.target_amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <HandCoins className="h-3 w-3 text-emerald-600" />
                      Tersalurkan: <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(disbursed)}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{programStat(program.id).views}</span>
                      <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{programStat(program.id).shares}</span>
                    </p>
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
