import { BottomNav } from "@/components/BottomNav";
import { useNews } from "@/hooks/useNews";
import { Newspaper, Calendar, ChevronRight, Loader2 } from "lucide-react";

const Berita = () => {
  const { publishedNews, isLoading } = useNews();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-primary text-primary-foreground px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Berita & Pengumuman</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Informasi terbaru LAZISNU</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : publishedNews.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Newspaper className="h-10 w-10 opacity-30 mb-2" />
            <p className="text-xs">Belum ada berita</p>
          </div>
        ) : (
          publishedNews.map((item, index) => (
            <div
              key={item.id}
              className="bg-card rounded-xl overflow-hidden shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-accent-foreground mb-2">
                  {item.category}
                </span>
                <h3 className="font-semibold text-foreground text-sm leading-snug">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">
                    {item.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[11px]">{formatDate(item.published_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Berita;
