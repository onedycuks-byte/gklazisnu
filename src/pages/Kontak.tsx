import { BottomNav } from "@/components/BottomNav";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Phone, Mail, MapPin, MessageCircle, Globe, Clock, Users, Heart, Loader2, ChevronRight, Landmark } from "lucide-react";

const Kontak = () => {
  const { getSettingsMap, isLoading } = useSiteSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const s = getSettingsMap();
  const services = (s.services || "").split(",").filter(Boolean);

  const contacts = [
    { icon: Phone, label: "Telepon", value: s.phone, action: `tel:+62${(s.phone || "").replace(/\D/g, "").replace(/^0/, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: s.whatsapp, action: `https://wa.me/62${(s.whatsapp || "").replace(/\D/g, "").replace(/^0/, "")}` },
    { icon: Mail, label: "Email", value: s.email, action: `mailto:${s.email}` },
  ];

  return (
    <div className="page-container min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="page-hero gradient-primary px-5 pt-9 pb-16">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Landmark className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-primary-foreground">{s.org_name || "LAZISNU"}</h1>
                <p className="text-primary-foreground/70 text-xs font-medium">Hubungi kami untuk informasi donasi</p>
              </div>
            </div>
          </div>
        </div>
        {/* Wave shape */}
        <div className="h-6 bg-background -mt-6 rounded-t-3xl relative z-10" />
      </div>

      <div className="page-content mx-auto max-w-4xl px-4 -mt-3 space-y-5">
        {/* Leader Card - Featured */}
        <div className="surface-card bg-card rounded-2xl p-5 shadow-elevated animate-slide-up border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-base font-extrabold text-foreground">{s.org_leader || "Pengurus"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.org_title || "Ketua"}</p>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="animate-slide-up" style={{ animationDelay: "80ms" }}>
          <h2 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Hubungi Kami
          </h2>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.action}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-card shadow-card hover:shadow-elevated transition-all group border border-transparent hover:border-primary/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground shrink-0 group-hover:scale-105 transition-transform">
                  <contact.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{contact.label}</p>
                  <p className="text-sm font-bold text-foreground truncate">{contact.value}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "160ms" }}>
            <h2 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Layanan Kami
            </h2>
            <div className="bg-card rounded-2xl p-4 shadow-card border border-primary/5">
              <div className="grid grid-cols-1 gap-2">
                {services.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-accent/40 hover:bg-accent/70 transition-colors">
                    <div className="h-8 w-8 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{item.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="animate-slide-up" style={{ animationDelay: "240ms" }}>
          <h2 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Lokasi Kantor
          </h2>
          <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-primary/5">
            <div className="gradient-primary p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="text-sm text-primary-foreground/90 font-medium leading-relaxed">
                  {s.address || "Alamat belum diatur"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="animate-slide-up" style={{ animationDelay: "320ms" }}>
          <h2 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Jam Operasional
          </h2>
          <div className="bg-card rounded-2xl p-4 shadow-card border border-primary/5">
            <div className="space-y-3">
              {[
                { day: "Senin - Jumat", time: s.hours_weekday || "08:00 - 16:00", active: true },
                { day: "Sabtu", time: s.hours_saturday || "08:00 - 12:00", active: true },
                { day: "Minggu", time: s.hours_sunday || "Tutup", active: false },
              ].map((item) => (
                <div key={item.day} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/30 transition-colors">
                  <span className="text-sm text-muted-foreground font-medium">{item.day}</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    item.active 
                      ? "text-primary bg-accent" 
                      : "text-destructive bg-destructive/10"
                  }`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <h2 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Sosial Media
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Globe, label: "Website", value: s.website },
              { icon: MessageCircle, label: "Facebook", value: s.facebook },
            ].filter(l => l.value).map((link) => (
              <div
                key={link.label}
                className="bg-card rounded-2xl p-4 shadow-card text-center border border-primary/5 hover:shadow-elevated transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground mx-auto mb-2">
                  <link.icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{link.label}</p>
                <p className="text-xs font-bold text-foreground mt-0.5 truncate">{link.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="animate-slide-up text-center py-4" style={{ animationDelay: "480ms" }}>
          <a
            href={`https://wa.me/62${(s.whatsapp || "").replace(/\D/g, "").replace(/^0/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-primary text-primary-foreground font-bold text-sm shadow-elevated hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" />
            Chat WhatsApp Sekarang
          </a>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Kontak;
