import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useDiscussions } from "@/hooks/useDiscussions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Diskusi = () => {
  const { discussions, isLoading, addDiscussion } = useDiscussions();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const approvedDiscussions = discussions.filter((d) => d.is_approved);

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
      toast({ title: "Terkirim!", description: "Pesan Anda akan ditampilkan setelah disetujui admin" });
      setName("");
      setMessage("");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Diskusi</h1>
          <p className="text-xs text-muted-foreground">Tanya jawab & diskusi seputar LAZISNU</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Tulis Pesan</h2>
          <Input
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
          <Textarea
            placeholder="Tulis pesan atau pertanyaan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Kirim Pesan
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Pesan akan ditampilkan setelah disetujui admin
          </p>
        </div>
      </div>

      {/* Discussion List */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Diskusi ({approvedDiscussions.length})
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : approvedDiscussions.length === 0 ? (
          <div className="bg-card rounded-xl p-6 shadow-card text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada diskusi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvedDiscussions.map((d, i) => (
              <div
                key={d.id}
                className="bg-card rounded-xl p-4 shadow-card animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{d.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(d.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{d.message}</p>
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
