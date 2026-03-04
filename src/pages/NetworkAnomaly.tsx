import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import RiskGauge from "@/components/RiskGauge";
import ExportButton from "@/components/ExportReport";
import { Activity, Wifi, Globe, Server } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [trafficData, setTrafficData] = useState(generateTraffic);
  const [connections, setConnections] = useState(generateConnections);
  const [networkRisk, setNetworkRisk] = useState(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(generateTraffic());
      setConnections(generateConnections());
      setNetworkRisk(Math.round(20 + Math.random() * 60));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Network Anomaly Detection</h2>
        <p className="text-muted-foreground mt-1">Monitor network traffic for suspicious activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex items-center gap-4">
          <RiskGauge score={networkRisk} label="Network Risk" />
          <div>
            <p className="text-sm text-muted-foreground">Active Connections</p>
            <p className="text-2xl font-bold font-mono text-foreground">{Math.round(2000 + Math.random() * 1500)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Wifi className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Anomalies Detected</p>
            <p className="text-2xl font-bold font-mono text-warning">{Math.round(150 + Math.random() * 150)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <Globe className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Blocked IPs</p>
            <p className="text-2xl font-bold font-mono text-destructive">{Math.round(10 + Math.random() * 20)}</p>
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
    </AppLayout>
  );
};

export default NetworkAnomaly;
