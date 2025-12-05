import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "gold";
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 shadow-card transition-all duration-300 hover:shadow-elevated animate-scale-in",
        variant === "default" && "bg-card",
        variant === "primary" && "gradient-primary text-primary-foreground",
        variant === "gold" && "gradient-gold text-secondary-foreground"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" && "text-muted-foreground",
              variant !== "default" && "opacity-90"
            )}
          >
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p
              className={cn(
                "text-xs",
                variant === "default" && "text-muted-foreground",
                variant !== "default" && "opacity-80"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            variant === "default" && "bg-accent",
            variant !== "default" && "bg-primary-foreground/20"
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              variant === "default" && "text-primary",
              variant !== "default" && "text-inherit"
            )}
          />
        </div>
      </div>
    </div>
  );
}
