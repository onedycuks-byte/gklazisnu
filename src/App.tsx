import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Laporan from "./pages/Laporan";
import Berita from "./pages/Berita";
import Kontak from "./pages/Kontak";
import ProgramDetail from "./pages/ProgramDetail";
import AiChat from "./pages/AiChat";
import Diskusi from "./pages/Diskusi";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/berita" element={<Berita />} />
            <Route path="/kontak" element={<Kontak />} />
            <Route path="/program/:id" element={<ProgramDetail />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/diskusi" element={<Diskusi />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
