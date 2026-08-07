import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/hooks/useAnalytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    trackEvent("pwa_install", window.location.pathname);
    notify();
  });
}

export function usePWAInstall() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  const canInstall = !!deferredPrompt && !isStandalone;

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      trackEvent("pwa_install", window.location.pathname);
    }
    deferredPrompt = null;
    notify();
  };

  return { canInstall, isStandalone, install };
}

export function PWAInstallButton({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "default" | "lg" | "icon" | null;
}) {
  const { canInstall, isStandalone, install } = usePWAInstall();

  if (isStandalone || !canInstall) return null;

  return (
    <Button
      variant="outline"
      size={size || undefined}
      onClick={install}
      className={`gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary bg-primary/5 ${className || ""}`}
    >
      <Download className="h-3.5 w-3.5" />
      Install
    </Button>
  );
}
