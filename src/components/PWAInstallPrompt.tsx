import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000) return;

    // iOS detection
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 2000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-elevated p-6 animate-slide-up">
        <div className="flex justify-end">
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          <img src={logo} alt="LAZISNU" className="h-16 w-16 rounded-2xl object-contain bg-white p-1 shadow-card" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Install Aplikasi</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Install LAZISNU Gendongkulon di perangkat Anda untuk akses lebih cepat
            </p>
          </div>

          {isIOS ? (
            <div className="text-sm text-muted-foreground bg-muted rounded-xl p-4 w-full">
              <p className="font-semibold text-foreground mb-2">Cara install di iPhone/iPad:</p>
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>Ketuk ikon <strong>Share</strong> (kotak dengan panah)</li>
                <li>Scroll ke bawah, pilih <strong>"Add to Home Screen"</strong></li>
                <li>Ketuk <strong>"Add"</strong></li>
              </ol>
            </div>
          ) : (
            <Button onClick={handleInstall} className="w-full gap-2" size="lg">
              <Download className="h-5 w-5" />
              Install Sekarang
            </Button>
          )}

          <button onClick={handleDismiss} className="text-xs text-muted-foreground hover:text-foreground">
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}
