import AppLayout from "@/components/AppLayout";
import RiskGauge from "@/components/RiskGauge";
import { Activity, Wifi, Globe, Server } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trafficData = [
  { protocol: "HTTP", normal: 1200, anomalous: 45 },
  { protocol: "HTTPS", normal: 3400, anomalous: 12 },
  { protocol: "DNS", normal: 890, anomalous: 78 },
  { protocol: "FTP", normal: 120, anomalous: 35 },
  { protocol: "SSH", normal: 450, anomalous: 8 },
  { protocol: "SMTP", normal: 230, anomalous: 52 },
];

const connections = [
  { ip: "192.168.1.105", port: 443, status: "normal", packets: 1240, risk: 5 },
  { ip: "10.0.0.45", port: 8080, status: "suspicious", packets: 8900, risk: 72 },
  { ip: "172.16.0.12", port: 22, status: "normal", packets: 320, risk: 10 },
  { ip: "203.0.113.50", port: 4444, status: "malicious", packets: 15600, risk: 95 },
  { ip: "192.168.1.200", port: 53, status: "suspicious", packets: 4500, risk: 58 },
];

const NetworkAnomaly = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Network Anomaly Detection</h2>
        <p className="text-muted-foreground mt-1">Monitor network traffic for suspicious activity</p>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <RiskGauge score={45} label="Network Risk" />
          <div>
            <p className="text-sm text-muted-foreground">Active Connections</p>
            <p className="text-2xl font-bold font-mono text-foreground">2,847</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Wifi className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Anomalies Detected</p>
            <p className="text-2xl font-bold font-mono text-warning">230</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <Globe className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Blocked IPs</p>
            <p className="text-2xl font-bold font-mono text-destructive">18</p>
          </div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
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

      {/* Connections Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Active Connections</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">IP Address</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Port</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Packets</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn, i) => {
                const statusColors: Record<string, string> = {
                  normal: "text-success",
                  suspicious: "text-warning",
                  malicious: "text-destructive",
                };
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4 font-mono text-foreground">{conn.ip}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{conn.port}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{conn.packets.toLocaleString()}</td>
                    <td className={`py-3 px-4 font-semibold capitalize ${statusColors[conn.status]}`}>{conn.status}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${conn.risk > 70 ? "bg-destructive" : conn.risk > 40 ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${conn.risk}%` }}
                          />
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
