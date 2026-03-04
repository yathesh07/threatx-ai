import { Shield, Activity, Bug, Fish, FileText, BarChart3, LogOut, User, ClipboardList, Zap, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: Bug, label: "Malware Scan", path: "/malware" },
  { icon: Fish, label: "Phishing Detection", path: "/phishing" },
  { icon: Activity, label: "Network Anomaly", path: "/network" },
  { icon: FileText, label: "Log Analysis", path: "/logs" },
  { icon: ClipboardList, label: "Threat Logs", path: "/threat-logs" },
  { icon: Zap, label: "Incident Response", path: "/incidents" },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const AppSidebar = ({ mobileOpen, onClose }: AppSidebarProps) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();

  const sidebarClass = isMobile
    ? `fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
    : "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50";

  return (
    <aside className={sidebarClass}>
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">ThreatX AI</h1>
            <p className="text-xs text-muted-foreground font-mono">v2.0 • ACTIVE</p>
          </div>
        </Link>
        {isMobile && (
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        {profile && (
          <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate">{profile.display_name || profile.username}</p>
              <p className="text-xs text-muted-foreground font-mono">Risk: {profile.risk_baseline ?? 50}</p>
            </div>
          </div>
        )}
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-mono">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-success font-medium">All Systems Online</span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
