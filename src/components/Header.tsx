import { Coins } from "lucide-react";

export function Header() {
  return (
    <header className="gradient-primary text-primary-foreground">
      <div className="container py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm">
            <Coins className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">LAZIZNU Gendongkulon</h1>
            <p className="text-primary-foreground/80 text-sm">
              Pengelolaan Dana Infaq Kaleng Koin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
