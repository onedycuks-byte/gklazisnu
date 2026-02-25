import logo from "@/assets/logo.png";

export function Header() {
  return (
    <header className="gradient-primary text-primary-foreground">
      <div className="container py-6">
        <div className="flex items-center gap-4">
          <img src={logo} alt="NU Care LAZISNU Logo" className="h-14 w-14 rounded-full object-contain bg-white p-1" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">LAZISNU Gendongkulon</h1>
            <p className="text-primary-foreground/80 text-sm">
              Pengelolaan Dana Infaq Kaleng Koin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
