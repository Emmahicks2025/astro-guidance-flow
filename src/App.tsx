import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import TalkToJotshi from "./pages/TalkToJotshi";
import PalmReading from "./pages/PalmReading";
import Compatibility from "./pages/Compatibility";
import DailyHoroscope from "./pages/DailyHoroscope";
import Panchang from "./pages/Panchang";
import MyKundli from "./pages/MyKundli";
import WalletPage from "./pages/Wallet";
import SettingsPage from "./pages/Settings";
import Explore from "./pages/Explore";
import AdminPanel from "./pages/AdminPanel";
import ProviderRegister from "./pages/ProviderRegister";

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
            <Route path="/talk" element={<TalkToJotshi />} />
            <Route path="/palm-reading" element={<PalmReading />} />
            <Route path="/compatibility" element={<Compatibility />} />
            <Route path="/horoscope" element={<DailyHoroscope />} />
            <Route path="/panchang" element={<Panchang />} />
            <Route path="/kundli" element={<MyKundli />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/provider-register" element={<ProviderRegister />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
