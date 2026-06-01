import { toast } from "@/hooks/use-toast";

export interface ShareData {
  title: string;
  text?: string;
  url: string;
  imageUrl?: string | null;
}

export async function shareContent({ title, text, url, imageUrl }: ShareData) {
  const shareText = text ? `${text}\n\n${url}` : url;

  // Try native Web Share with file (image) when possible
  try {
    if (imageUrl && typeof navigator !== "undefined" && (navigator as any).canShare) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], "gambar.jpg", { type: blob.type || "image/jpeg" });
        const dataWithFile: any = { title, text, url, files: [file] };
        if ((navigator as any).canShare(dataWithFile)) {
          await (navigator as any).share(dataWithFile);
          return;
        }
      } catch {
        // fall through to plain share
      }
    }

    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share({ title, text, url });
      return;
    }
  } catch (err: any) {
    if (err?.name === "AbortError") return;
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    toast({ title: "Tautan disalin", description: "Tautan berhasil disalin ke clipboard." });
  } catch {
    toast({ title: "Gagal membagikan", description: "Silakan salin tautan secara manual.", variant: "destructive" });
  }
}
