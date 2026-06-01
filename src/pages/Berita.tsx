import { BottomNav } from "@/components/BottomNav";
import { useNews } from "@/hooks/useNews";
import { Newspaper, Calendar, ArrowLeft, X, Share2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { shareContent } from "@/lib/share";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

const Berita = () => {
  const { publishedNews, isLoading } = useNews();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNews, setSelectedNews] = useState<typeof publishedNews[0] | null>(null);

  // Deep-link: open drawer when ?n=<id> present
  useEffect(() => {
    const id = searchParams.get("n");
    if (id && publishedNews.length) {
      const item = publishedNews.find((n) => n.id === id);
      if (item) setSelectedNews(item);
    }
  }, [searchParams, publishedNews]);

  const openNews = (item: typeof publishedNews[0]) => {
    setSelectedNews(item);
    setSearchParams({ n: item.id }, { replace: true });
  };

  const closeNews = () => {
    setSelectedNews(null);
    if (searchParams.get("n")) {
      searchParams.delete("n");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleShare = (item: typeof publishedNews[0]) => {
    const url = `${window.location.origin}/berita?n=${item.id}`;
    const text = `${item.title}${item.excerpt ? `\n\n${item.excerpt}` : ""}`;
    shareContent({ title: item.title, text, url, imageUrl: item.image_url });
  };


  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-700 text-primary-foreground px-4 pt-6 pb-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Berita & Pengumuman</h1>
            <p className="text-white/60 text-xs mt-0.5">Informasi terbaru LAZISNU</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Memuat berita...</p>
          </div>
        ) : publishedNews.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground bg-card rounded-2xl shadow-card">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-3">
              <Newspaper className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">Belum ada berita</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Berita akan muncul di sini</p>
          </div>
        ) : (
          publishedNews.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className="bg-card rounded-2xl overflow-hidden shadow-card animate-slide-up border border-border/30 hover:shadow-elevated transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {item.image_url && (
                <div className="relative">
                  <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              <div className="p-4">
                <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full bg-primary/10 text-primary mb-2.5 uppercase tracking-wide">
                  {item.category}
                </span>
                <h3 className="font-bold text-foreground text-sm leading-snug mb-1.5">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                    {item.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-3 text-muted-foreground/70">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[11px] font-medium">{formatDate(item.published_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* News Detail Drawer */}
      <Drawer open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DrawerHeader className="relative pb-2">
                <DrawerClose className="absolute right-4 top-4 rounded-full p-1.5 bg-muted/80 hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </DrawerClose>
                <span className="inline-block self-start px-2.5 py-1 text-[10px] font-bold rounded-full bg-primary/10 text-primary mb-2 uppercase tracking-wide">
                  {selectedNews.category}
                </span>
                <DrawerTitle className="text-left text-base leading-snug pr-8">
                  {selectedNews.title}
                </DrawerTitle>
                <div className="flex items-center gap-1.5 mt-2 text-muted-foreground/70">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[11px] font-medium">{formatDate(selectedNews.published_at)}</span>
                </div>
              </DrawerHeader>
              <div className="px-4 pb-8 space-y-4">
                {selectedNews.image_url && (
                  <img
                    src={selectedNews.image_url}
                    alt={selectedNews.title}
                    className="w-full rounded-xl object-cover max-h-60"
                  />
                )}
                {selectedNews.excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {selectedNews.excerpt}
                  </p>
                )}
                {selectedNews.content ? (
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedNews.content}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Tidak ada konten lengkap.</p>
                )}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <BottomNav />
    </div>
  );
};

export default Berita;
