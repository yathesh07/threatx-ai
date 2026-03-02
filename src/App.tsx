import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import MalwareScan from "./pages/MalwareScan";
import PhishingDetection from "./pages/PhishingDetection";
import NetworkAnomaly from "./pages/NetworkAnomaly";
import LogAnalysis from "./pages/LogAnalysis";
import ThreatLogs from "./pages/ThreatLogs";
import IncidentReport from "./pages/IncidentReport";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/malware" element={<ProtectedRoute><MalwareScan /></ProtectedRoute>} />
            <Route path="/phishing" element={<ProtectedRoute><PhishingDetection /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><NetworkAnomaly /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><LogAnalysis /></ProtectedRoute>} />
            <Route path="/threat-logs" element={<ProtectedRoute><ThreatLogs /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><IncidentReport /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
