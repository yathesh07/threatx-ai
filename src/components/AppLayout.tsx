import { ReactNode, useState } from "react";
import AppSidebar from "./AppSidebar";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <AppSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-secondary rounded-lg">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="ml-3 text-sm font-bold text-foreground">ThreatX AI</span>
        </header>
      )}

      <main className={`${isMobile ? "pt-14 p-4" : "ml-64 p-8"}`}>{children}</main>
    </div>
  );
};

export default AppLayout;
