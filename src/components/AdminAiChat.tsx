import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Buatkan berita kegiatan pembagian sembako",
  "Buat deskripsi program donasi untuk yatim piatu",
  "Analisis pemasukan dan pengeluaran bulan ini",
  "Buat caption Instagram untuk promosi donasi",
  "Rangkum laporan keuangan terkini",
  "Saran meningkatkan donasi",
];

export function AdminAiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({ title: "Disalin!", description: "Teks berhasil disalin ke clipboard" });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Silakan login terlebih dahulu");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages: allMessages }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Terjadi kesalahan" }));
        throw new Error(err.error || "Gagal menghubungi AI");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : "Terjadi kesalahan." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Asisten AI Admin</CardTitle>
            <p className="text-xs text-muted-foreground">
              Bantu buat konten, analisis data, dan kelola website
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chat area */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-muted/30">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                <Bot className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Tanya apapun untuk mengelola konten LAZISNU
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center mt-1">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[85%] relative group ${
                  msg.role === "user"
                    ? "gradient-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2"
                    : "bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <>
                      <div className="prose prose-sm max-w-none text-foreground prose-p:my-1 prose-li:my-0 prose-headings:my-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <button
                        onClick={() => copyToClipboard(msg.content, i)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-muted hover:bg-accent"
                        title="Salin teks"
                      >
                        {copiedIndex === i ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-6 w-6 rounded-full bg-muted flex-shrink-0 flex items-center justify-center mt-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2 justify-start">
                <div className="h-6 w-6 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center">
                  <Bot className="h-3 w-3 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 bg-card flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik perintah... (contoh: 'Buatkan berita kegiatan baksos')"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
