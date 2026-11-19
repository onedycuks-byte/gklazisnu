import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useDiscussions } from "@/hooks/useDiscussions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, Send, ArrowLeft, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Diskusi = () => {
  const { discussions, isLoading, addDiscussion } = useDiscussions();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) {
      toast({ title: "Error", description: "Nama dan pesan harus diisi", variant: "destructive" });
      return;
    }
    if (name.length > 100 || message.length > 1000) {
      toast({ title: "Error", description: "Nama maks 100 karakter, pesan maks 1000 karakter", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await addDiscussion({ author_name: name.trim(), message: message.trim() });
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal", description: "Gagal mengirim pesan", variant: "destructive" });
    } else {
      toast({ title: "Terkirim!", description: "Pesan Anda berhasil dikirim" });
      setName("");
      setMessage("");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="page-container min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="page-hero relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-700 text-primary-foreground px-4 pt-7 pb-12">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Diskusi</h1>
            <p className="text-white/60 text-xs mt-0.5">Tanya jawab seputar LAZISNU</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="page-content px-4 -mt-6">
        <div className="bg-card rounded-2xl p-4 shadow-elevated space-y-3 border border-border/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Tulis Pesan</h2>
          </div>
          <Input
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="rounded-xl bg-muted/50 border-border/50"
          />
          <Textarea
            placeholder="Tulis pesan atau pertanyaan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={3}
            className="rounded-xl bg-muted/50 border-border/50"
          />
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2 rounded-xl h-11 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-md">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Kirim Pesan
          </Button>
        </div>
      </div>

      {/* Discussion List */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Diskusi</h2>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {discussions.length} pesan
          </span>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Memuat diskusi...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card text-center border border-border/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-3">
              <MessageCircle className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Belum ada diskusi</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Jadilah yang pertama bertanya!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map((d, i) => (
              <div
                key={d.id}
                className="bg-card rounded-2xl p-4 shadow-card animate-slide-up border border-border/30"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-foreground block truncate">{d.author_name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(d.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-[42px]">{d.message}</p>
                
                {/* Admin Reply */}
                {d.admin_reply && (
                  <div className="mt-3 ml-[42px] bg-primary/5 border border-primary/15 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Shield className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-[11px] font-bold text-primary">Admin</span>
                      {d.replied_at && (
                        <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(d.replied_at)}</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{d.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Diskusi;
