import { Home, FileText, Newspaper, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Beranda", icon: Home, path: "/" },
  { label: "Laporan", icon: FileText, path: "/laporan" },
  { label: "Berita", icon: Newspaper, path: "/berita" },
  { label: "Diskusi", icon: MessageCircle, path: "/diskusi" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-2px_20px_-4px_hsl(var(--foreground)/0.06)]">
      <div className="flex items-center justify-around h-[68px] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-[3px] rounded-full bg-primary" />
              )}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10 scale-110"
              )}>
                <item.icon className={cn("h-[18px] w-[18px]", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[10px] transition-all duration-200",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
