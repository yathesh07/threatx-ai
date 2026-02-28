import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MalwareScan from "./pages/MalwareScan";
import PhishingDetection from "./pages/PhishingDetection";
import NetworkAnomaly from "./pages/NetworkAnomaly";
import LogAnalysis from "./pages/LogAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/malware" element={<MalwareScan />} />
          <Route path="/phishing" element={<PhishingDetection />} />
          <Route path="/network" element={<NetworkAnomaly />} />
          <Route path="/logs" element={<LogAnalysis />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
