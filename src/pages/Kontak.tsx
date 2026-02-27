import { BottomNav } from "@/components/BottomNav";
import { Phone, Mail, MapPin, MessageCircle, Globe, Clock, Users, Target } from "lucide-react";

const contacts = [
  {
    icon: Phone,
    label: "Telepon",
    value: "0897-6315-251",
    action: "tel:+628976315251",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "0897-6315-251",
    action: "https://wa.me/628976315251",
  },
  {
    icon: Mail,
    label: "Email",
    value: "lazisnu.gendongkulon@gmail.com",
    action: "mailto:lazisnu.gendongkulon@gmail.com",
  },
];

const socialLinks = [
  { icon: Globe, label: "Website", value: "lazisnu-gendongkulon.org" },
  { icon: MessageCircle, label: "Facebook", value: "LAZISNU Gendongkulon" },
];

const Kontak = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Kontak & Informasi</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Hubungi kami untuk informasi lebih lanjut</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Contact Info */}
        <div className="bg-card rounded-xl p-5 shadow-card animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Hubungi Kami
          </h2>
          <div className="space-y-3">
            {contacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.action}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                  <contact.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{contact.label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{contact.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      {/* Ketua */}
        <div className="bg-card rounded-xl p-5 shadow-card animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Pengurus
          </h2>
          <div className="p-3 rounded-lg bg-accent/50">
            <p className="text-sm font-semibold text-foreground">Ahmad Nur Siam</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ketua LAZISNU Ranting Gendongkulon</p>
          </div>
        </div>

        {/* Layanan */}
        <div className="bg-card rounded-xl p-5 shadow-card animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Layanan Kami
          </h2>
          <div className="space-y-2">
            {["Donasi Zakat", "Infaq & Sedekah", "Program Sosial & Kemanusiaan"].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/50">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-card rounded-xl p-5 shadow-card animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Alamat Kantor
          </h2>
          <div className="p-3 rounded-lg bg-accent/50">
            <p className="text-sm text-foreground leading-relaxed">
              Desa Gendongkulon, Kecamatan Babadan,
              <br />
              Kabupaten Ponorogo, Jawa Timur
            </p>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-card rounded-xl p-5 shadow-card animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Jam Operasional
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Senin - Jumat</span>
              <span className="font-medium text-foreground">08:00 - 16:00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sabtu</span>
              <span className="font-medium text-foreground">08:00 - 12:00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Minggu</span>
              <span className="font-medium text-destructive">Tutup</span>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-card rounded-xl p-5 shadow-card animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Sosial Media
          </h2>
          <div className="space-y-3">
            {socialLinks.map((link) => (
              <div
                key={link.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                  <link.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{link.label}</p>
                  <p className="text-sm font-medium text-foreground">{link.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Kontak;
