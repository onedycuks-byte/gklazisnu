import { BottomNav } from "@/components/BottomNav";
import { Newspaper, Calendar, ChevronRight } from "lucide-react";

const newsItems = [
  {
    id: 1,
    title: "Penyaluran Dana Infaq untuk Pembangunan Masjid",
    date: "2026-02-20",
    excerpt: "Alhamdulillah, dana infaq kaleng koin telah disalurkan untuk pembangunan masjid di Gendongkulon.",
    category: "Penyaluran",
  },
  {
    id: 2,
    title: "Pengumpulan Kaleng Koin Bulan Februari",
    date: "2026-02-15",
    excerpt: "Koordinator wilayah telah melakukan pengumpulan kaleng koin rutin bulan Februari 2026.",
    category: "Pengumpulan",
  },
  {
    id: 3,
    title: "Rapat Koordinasi LAZISNU Gendongkulon",
    date: "2026-02-10",
    excerpt: "Rapat koordinasi membahas program kerja dan target pengumpulan infaq tahun 2026.",
    category: "Kegiatan",
  },
  {
    id: 4,
    title: "Sosialisasi Program Kaleng Koin ke Jamaah",
    date: "2026-02-05",
    excerpt: "Tim LAZISNU melakukan sosialisasi program kaleng koin kepada jamaah di berbagai musholla.",
    category: "Sosialisasi",
  },
];

const Berita = () => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Berita & Pengumuman</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Informasi terbaru LAZISNU</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {newsItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-card rounded-xl p-4 shadow-card animate-slide-up cursor-pointer hover:shadow-elevated transition-all"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-accent-foreground mb-2">
                  {item.category}
                </span>
                <h3 className="font-semibold text-foreground text-sm leading-snug">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">
                  {item.excerpt}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[11px]">{formatDate(item.date)}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-4" />
            </div>
          </div>
        ))}

        <div className="flex flex-col items-center py-8 text-muted-foreground">
          <Newspaper className="h-10 w-10 opacity-30 mb-2" />
          <p className="text-xs">Berita akan diperbarui secara berkala</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Berita;
