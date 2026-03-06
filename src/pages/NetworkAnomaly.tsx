import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";
import ExportButton from "@/components/ExportReport";
import { Activity, Wifi, Globe, Server, ScanLine, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const generateTraffic = () => {
  const protocols = ["HTTP", "HTTPS", "DNS", "FTP", "SSH", "SMTP"];
  return protocols.map((protocol) => ({
    protocol,
    normal: Math.round(100 + Math.random() * 3500),
    anomalous: Math.round(Math.random() * 90),
  }));
};

const ips = ["192.168.1.105", "10.0.0.45", "172.16.0.12", "203.0.113.50", "192.168.1.200", "10.0.1.88", "172.16.2.33"];
const statuses = ["normal", "suspicious", "malicious"];

const generateConnections = () =>
  Array.from({ length: 5 }, () => ({
    ip: ips[Math.floor(Math.random() * ips.length)],
    port: [22, 53, 80, 443, 4444, 8080, 3389][Math.floor(Math.random() * 7)],
    status: statuses[Math.floor(Math.random() * 3)],
    packets: Math.round(100 + Math.random() * 16000),
    risk: Math.round(Math.random() * 95),
  }));

const NetworkAnomaly = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [trafficData, setTrafficData] = useState<ReturnType<typeof generateTraffic>>([]);
  const [connections, setConnections] = useState<ReturnType<typeof generateConnections>>([]);
  const [networkRisk, setNetworkRisk] = useState(0);

  const handleScan = () => {
    setScanning(true);
    setTimeout(async () => {
      const traffic = generateTraffic();
      const conns = generateConnections();
      const risk = Math.round(20 + Math.random() * 60);
      setTrafficData(traffic);
      setConnections(conns);
      setNetworkRisk(risk);
      setHasScanned(true);
      setScanning(false);

      if (user) {
        const maliciousCount = conns.filter(c => c.status === "malicious").length;
        await supabase.from("scan_history").insert({
          user_id: user.id,
          scan_type: "network",
          risk_score: risk,
          threat_count: maliciousCount,
          target: "network_scan",
          results: { traffic, connections: conns } as any,
        });
      }

      toast({
        title: "Network Scan Complete",
        description: `Network risk score: ${risk}/100`,
        variant: risk >= 60 ? "destructive" : "default",
      });
    }, 3000);
  };

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Network Anomaly Detection</h2>
        <p className="text-muted-foreground mt-1">Monitor network traffic for suspicious activity</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Network Scanner</h3>
          <Button onClick={handleScan} disabled={scanning} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {scanning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</> : <><ScanLine className="w-4 h-4 mr-2" />Scan Network</>}
          </Button>
        </div>

        {scanning && (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
              <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary" />
            </div>
          </div>
        )}

        {!hasScanned && !scanning && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-foreground font-semibold">No network scan data</p>
            <p className="text-sm text-muted-foreground mt-1">Run a scan to analyze network traffic</p>
          </div>
        )}
      </div>

      {hasScanned && !scanning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex items-center gap-4">
              <RiskGauge score={networkRisk} label="Network Risk" />
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold font-mono text-foreground">{connections.length}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <Wifi className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                <p className="text-2xl font-bold font-mono text-warning">{trafficData.reduce((a, b) => a + b.anomalous, 0)}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <Globe className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blocked IPs</p>
                <p className="text-2xl font-bold font-mono text-destructive">{connections.filter(c => c.status === "malicious").length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Traffic by Protocol</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="protocol" stroke="hsl(215, 15%, 50%)" fontSize={12} fontFamily="JetBrains Mono" />
                <YAxis stroke="hsl(215, 15%, 50%)" fontSize={12} fontFamily="JetBrains Mono" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px" }} />
                <Bar dataKey="normal" fill="hsl(175, 80%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="anomalous" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Active Connections</h3>
              </div>
              <ExportButton data={{
                title: "Network_Connections_Report",
                generatedAt: new Date().toISOString(),
                rows: connections.map(c => ({ ip: c.ip, port: c.port, status: c.status, packets: c.packets, risk: c.risk })),
              }} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">IP Address</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Port</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell">Packets</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((conn, i) => {
                    const statusColors: Record<string, string> = { normal: "text-success", suspicious: "text-warning", malicious: "text-destructive" };
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-3 px-4 font-mono text-foreground text-xs md:text-sm">{conn.ip}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{conn.port}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground hidden sm:table-cell">{conn.packets.toLocaleString()}</td>
                        <td className={`py-3 px-4 font-semibold capitalize ${statusColors[conn.status]}`}>{conn.status}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${conn.risk > 70 ? "bg-destructive" : conn.risk > 40 ? "bg-warning" : "bg-success"}`} style={{ width: `${conn.risk}%` }} />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{conn.risk}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default NetworkAnomaly;
