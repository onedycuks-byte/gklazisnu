import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Berapa nisab zakat maal?",
  "Apa perbedaan infaq dan sedekah?",
  "Siapa saja yang berhak menerima zakat?",
  "Bagaimana cara menghitung zakat profesi?",
];

const AiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zakat-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "Maaf, terjadi kesalahan. Coba lagi nanti.",
        },
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
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 gradient-primary px-4 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary-foreground">Asisten LAZISNU</h1>
              <p className="text-[10px] text-primary-foreground/70">Tanya seputar Zakat, Infaq & Sedekah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-elevated">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Assalamu'alaikum! 👋</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
              Saya Asisten LAZISNU, siap menjawab pertanyaan Anda seputar zakat, infaq, dan sedekah.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs bg-card border border-border rounded-xl px-4 py-3 text-foreground hover:bg-accent transition-colors shadow-card"
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
            className={`flex gap-2 animate-slide-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center mt-1">
                <Bot className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md shadow-card"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:my-2 text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center mt-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2 justify-start animate-fade-in">
            <div className="h-7 w-7 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-card">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-16 bg-background border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-xl gradient-primary"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AiChat;
