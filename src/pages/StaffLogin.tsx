import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Delete, Lock, ShieldCheck } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  ketua: "Ketua",
  admin: "Admin",
  bendahara: "Bendahara",
  sekretaris: "Sekretaris",
  dokumentasi: "Dokumentasi",
  koordinator: "Koordinator",
};

const ROLE_COLORS: Record<string, string> = {
  ketua: "from-yellow-500 to-amber-600",
  admin: "from-red-500 to-rose-600",
  bendahara: "from-emerald-500 to-teal-600",
  sekretaris: "from-blue-500 to-indigo-600",
  dokumentasi: "from-amber-500 to-orange-600",
  koordinator: "from-purple-500 to-violet-600",
};

export default function StaffLogin() {
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/admin");
  }, [user, navigate]);

  const verifyPin = useCallback(async (fullPin: string) => {
    setIsVerifying(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-staff-pin", {
        body: { pin: fullPin },
      });

      if (fnError || data?.error) {
        setError(data?.error || "PIN tidak valid");
        setPin("");
        setIsVerifying(false);
        return;
      }

      setSuccess(data.role);

      // Sign in with password - supports multiple devices simultaneously
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError("Gagal membuat sesi: " + signInError.message);
        setSuccess(null);
        setPin("");
        setIsVerifying(false);
        return;
      }

      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${ROLE_LABELS[data.role]}!`,
      });
    } catch {
      setError("Terjadi kesalahan koneksi");
      setPin("");
      setIsVerifying(false);
    }
  }, []);

  const handleKeyPress = useCallback((digit: string) => {
    if (isVerifying) return;
    setError("");

    setPin((prev) => {
      const newPin = prev + digit;
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
      return newPin.length <= 6 ? newPin : prev;
    });
  }, [isVerifying, verifyPin]);

  const handleDelete = useCallback(() => {
    if (isVerifying) return;
    setError("");
    setPin((prev) => prev.slice(0, -1));
  }, [isVerifying]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKeyPress(e.key);
      if (e.key === "Backspace") handleDelete();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyPress, handleDelete]);

  const numpadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 select-none">
      {/* Lock icon */}
      <div className="mb-6">
        {success ? (
          <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${ROLE_COLORS[success] || "from-primary to-primary"} flex items-center justify-center shadow-2xl animate-in zoom-in duration-300`}>
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
        ) : (
          <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-2xl">
            <Lock className="h-10 w-10 text-white/80" />
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-white text-xl font-semibold mb-1">
        {success ? `Login sebagai ${ROLE_LABELS[success]}` : "Staff Login"}
      </h1>
      <p className="text-white/50 text-sm mb-8">
        {success ? "Mengalihkan..." : "Masukkan PIN 6 digit"}
      </p>

      {/* PIN dots */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
              error
                ? "bg-red-500 animate-shake"
                : i < pin.length
                ? success
                  ? `bg-gradient-to-br ${ROLE_COLORS[success] || "from-primary to-primary"}`
                  : "bg-white scale-110"
                : "bg-white/20 border border-white/30"
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-sm mb-4 animate-in fade-in duration-200">{error}</p>
      )}

      {/* Loading */}
      {isVerifying && (
        <div className="mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-white/70" />
        </div>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 max-w-[280px] w-full">
        {numpadKeys.flat().map((key, idx) => {
          if (key === "") {
            return <div key={idx} />;
          }
          if (key === "del") {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                disabled={isVerifying || pin.length === 0}
                className="h-16 w-full rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150 active:scale-95 disabled:opacity-30"
              >
                <Delete className="h-6 w-6" />
              </button>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => handleKeyPress(key)}
              disabled={isVerifying || pin.length >= 6}
              className="h-16 w-full rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white text-2xl font-light hover:bg-white/20 transition-all duration-150 active:scale-95 active:bg-white/30 disabled:opacity-30"
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate("/")}
        className="mt-10 text-white/40 text-sm hover:text-white/70 transition-colors"
      >
        ← Kembali ke Beranda
      </button>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
