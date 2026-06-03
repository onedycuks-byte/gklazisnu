import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, BookOpen, Share2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTrackPageView } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import maulidPdf from "@/assets/maulid-diba.pdf.asset.json";

// Use bundled worker (works on all mobile browsers, no CDN/CORS issues)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Maulid() {
  useTrackPageView("/maulid");
  const navigate = useNavigate();
  const pdfUrl = maulidPdf.url;

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(360);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth ?? 360;
      setPageWidth(Math.min(w - 8, 900));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleShare = async () => {
    const shareUrl = window.location.origin + "/maulid";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Buku Maulid Diba'i",
          text: "Baca & ikuti pembacaan Maulid Diba'i lengkap.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Tautan disalin");
      }
    } catch {
      /* dismissed */
    }
  };

  const go = (delta: number) => {
    setPageNumber((p) => Math.min(Math.max(1, p + delta), numPages || 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-tight truncate">Maulid Diba'i</h1>
              <p className="text-[10px] text-muted-foreground">
                {numPages ? `Halaman ${pageNumber} / ${numPages}` : "Memuat kitab..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Bagikan"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-lg w-full mx-auto px-3 pt-3 flex-1 flex flex-col">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-4 shadow-elevated mb-3">
          <p className="text-[10px] uppercase tracking-wide opacity-80">Kitab</p>
          <h2 className="text-lg font-bold leading-tight">Maulid Diba' bil-Hasyiyah</h2>
          <p className="text-[11px] opacity-90 mt-1 leading-relaxed">
            Karya Imam Abdurrahman ad-Diba'i. Dibaca rutin oleh warga Nahdliyin sebagai
            wujud cinta kepada Rasulullah ﷺ.
          </p>
          <div className="flex gap-2 mt-3">
            <a href={pdfUrl} download="Maulid-Dibai.pdf" className="flex-1">
              <Button size="sm" variant="secondary" className="w-full h-9 gap-1.5 text-xs font-semibold">
                <Download className="h-3.5 w-3.5" /> Unduh PDF
              </Button>
            </a>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" variant="outline" className="w-full h-9 gap-1.5 text-xs font-semibold bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
                <BookOpen className="h-3.5 w-3.5" /> Buka Asli
              </Button>
            </a>
          </div>
        </div>

        <div
          ref={containerRef}
          className="rounded-2xl overflow-hidden border border-border/50 shadow-card bg-muted/40 flex-1 min-h-[60vh] flex items-start justify-center p-1"
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(e) => {
              console.error("PDF load error", e);
              toast.error("Gagal memuat PDF");
            }}
            loading={
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-xs">Memuat kitab...</p>
              </div>
            }
            error={
              <div className="p-6 text-center text-sm text-muted-foreground">
                Gagal memuat PDF.{" "}
                <a href={pdfUrl} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                  Buka langsung
                </a>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="!bg-transparent"
            />
          </Document>
        </div>

        {numPages > 0 && (
          <div className="flex items-center justify-between gap-2 mt-3 sticky bottom-20 z-30">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => go(-1)}
              disabled={pageNumber <= 1}
              className="flex-1 h-10 gap-1 shadow-elevated"
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Button>
            <div className="text-xs font-semibold bg-card border border-border rounded-lg px-3 h-10 flex items-center shadow-card">
              {pageNumber} / {numPages}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => go(1)}
              disabled={pageNumber >= numPages}
              className="flex-1 h-10 gap-1 shadow-elevated"
            >
              Berikutnya <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-3 mb-1">
          صلى الله على محمد ﷺ
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
