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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.08)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-10 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
