import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import RiskGauge from "@/components/RiskGauge";
import ThreatFeed from "@/components/ThreatFeed";
import ThreatChart from "@/components/ThreatChart";
import StatCard from "@/components/StatCard";
import RealTimeAlerts from "@/components/RealTimeAlerts";
import PredictiveEngine from "@/components/PredictiveEngine";
import SmartRecommendations from "@/components/SmartRecommendations";
import FalseAlertFilter from "@/components/FalseAlertFilter";
import SecurityChatbot from "@/components/SecurityChatbot";
import { Shield, Bug, Fish, Activity, AlertTriangle, CheckCircle, ScanLine, Loader2, User, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [scores, setScores] = useState({ overall: 0, malware: 0, phishing: 0, network: 0, logAnomaly: 0 });
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [stats, setStats] = useState({ threats: 0, blocked: 0, malware: 0, phishing: 0 });
  const [riskHistory, setRiskHistory] = useState<{ date: string; score: number }[]>([]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    const [lastScanRes, historyRes, scansRes] = await Promise.all([
      supabase.from("risk_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      supabase.from("risk_scores").select("created_at, overall_score").eq("user_id", user.id).order("created_at", { ascending: true }).limit(30),
      supabase.from("scan_history").select("scan_type, threat_count").eq("user_id", user.id),
    ]);

    if (lastScanRes.data && lastScanRes.data.length > 0) {
      const s = lastScanRes.data[0];
      setScores({
        overall: Number(s.overall_score),
        malware: Number(s.malware_score) || 0,
        phishing: Number(s.phishing_score) || 0,
        network: Number(s.network_score) || 0,
        logAnomaly: Number(s.log_score) || 0,
      });
      setHasScanned(true);
    }

    if (historyRes.data && historyRes.data.length > 0) {
      setRiskHistory(historyRes.data.map(h => ({
        date: new Date(h.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
        score: Number(h.overall_score),
      })));
    }

    if (scansRes.data && scansRes.data.length > 0) {
      const malwareThreats = scansRes.data
        .filter(s => s.scan_type === "malware" || s.scan_type === "full_scan")
        .reduce((a, b) => a + (b.threat_count || 0), 0);
      const phishingThreats = scansRes.data
        .filter(s => s.scan_type === "phishing" || s.scan_type === "full_scan")
        .reduce((a, b) => {
          if (b.scan_type === "phishing") return a + (b.threat_count || 0);
          return a + Math.round((b.threat_count || 0) * 0.3);
        }, 0);
      const totalThreats = scansRes.data.reduce((a, b) => a + (b.threat_count || 0), 0);
      setStats({
        threats: totalThreats,
        blocked: Math.round(totalThreats * 1.5 + scansRes.data.length * 50),
        malware: malwareThreats,
        phishing: phishingThreats,
      });
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Generate user-specific deterministic seed from user ID
  const userSeed = (user?.id || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const handleFullScan = async () => {
    setScanning(true);
    setTimeout(async () => {
      // Time-based entropy: hour, minute, day combine for unique-per-scan values
      const now = new Date();
      const timeFactor = now.getHours() * 60 + now.getMinutes() + now.getSeconds();
      const dayFactor = now.getDate() + now.getMonth() * 31;
      const scanEntropy = timeFactor * 13 + dayFactor * 7 + userSeed;

      // Pseudo-random seeded generator for consistent-per-user but varying-per-scan results
      const seeded = (offset: number) => {
        const x = Math.sin(scanEntropy + offset * 9973) * 10000;
        return x - Math.floor(x); // 0-1
      };

      // Previous scores influence new ones (drift, not wild swings)
      const drift = (prev: number, base: number, range: number, offset: number) => {
        const raw = base + Math.round(seeded(offset) * range);
        if (prev > 0) return Math.round(prev * 0.3 + raw * 0.7); // 30% memory
        return raw;
      };

      // Each module has different risk profiles per user seed
      const userProfile = userSeed % 4; // 4 risk archetypes
      const profiles: Record<number, { mBase: number; mRange: number; pBase: number; pRange: number; nBase: number; nRange: number; lBase: number; lRange: number }> = {
        0: { mBase: 55, mRange: 35, pBase: 25, pRange: 40, nBase: 30, nRange: 45, lBase: 20, lRange: 35 }, // malware-heavy
        1: { mBase: 20, mRange: 30, pBase: 50, pRange: 40, nBase: 35, nRange: 30, lBase: 30, lRange: 25 }, // phishing-heavy
        2: { mBase: 30, mRange: 25, pBase: 30, pRange: 30, nBase: 55, nRange: 40, lBase: 40, lRange: 35 }, // network-heavy
        3: { mBase: 25, mRange: 30, pBase: 35, pRange: 25, nBase: 25, nRange: 30, lBase: 55, lRange: 40 }, // log-heavy
      };
      const p = profiles[userProfile];

      const newScores = {
        overall: 0,
        malware: drift(scores.malware, p.mBase, p.mRange, 1),
        phishing: drift(scores.phishing, p.pBase, p.pRange, 2),
        network: drift(scores.network, p.nBase, p.nRange, 3),
        logAnomaly: drift(scores.logAnomaly, p.lBase, p.lRange, 4),
      };

      // Clamp all to 5-98 range for realism
      newScores.malware = Math.max(5, Math.min(98, newScores.malware));
      newScores.phishing = Math.max(5, Math.min(98, newScores.phishing));
      newScores.network = Math.max(5, Math.min(98, newScores.network));
      newScores.logAnomaly = Math.max(5, Math.min(98, newScores.logAnomaly));

      // Weighted overall (network & malware weigh more)
      newScores.overall = Math.round(
        newScores.malware * 0.3 + newScores.phishing * 0.2 + newScores.network * 0.3 + newScores.logAnomaly * 0.2
      );

      setScores(newScores);
      setHasScanned(true);
      setScanning(false);

      if (user) {
        const threatCount = Math.round(newScores.overall / 10);
        
        await Promise.all([
          supabase.from("risk_scores").insert({
            user_id: user.id,
            overall_score: newScores.overall,
            malware_score: newScores.malware,
            phishing_score: newScores.phishing,
            network_score: newScores.network,
            log_score: newScores.logAnomaly,
            prediction_24h: Math.round(newScores.overall * 0.9 + seeded(5) * 15),
            predicted_attack_type: newScores.malware > newScores.phishing ? "malware" : "phishing",
          }),
          supabase.from("scan_history").insert({
            user_id: user.id,
            scan_type: "full_scan",
            risk_score: newScores.overall,
            threat_count: threatCount,
            results: newScores as any,
          }),
          supabase.from("profiles").update({
            total_scans: (profile?.total_scans ?? 0) + 1,
            threats_detected: (profile?.threats_detected ?? 0) + threatCount,
          }).eq("user_id", user.id),
        ]);

        setRiskHistory(prev => [...prev, {
          date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
          score: newScores.overall,
        }].slice(-30));

        setStats(prev => ({
          ...prev,
          threats: prev.threats + threatCount,
          blocked: prev.blocked + Math.round(newScores.overall / 5),
        }));

        await refreshProfile();
        await loadDashboardData();
      }

      toast({
        title: "Full System Scan Complete",
        description: `Overall risk score: ${newScores.overall}/100`,
        variant: newScores.overall >= 70 ? "destructive" : "default",
      });
    }, 4000);
  };

  const trend = riskHistory.length >= 2 ? riskHistory[riskHistory.length - 1].score - (riskHistory[riskHistory.length - Math.min(8, riskHistory.length)]?.score || 0) : 0;

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Security Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Real-time threat monitoring, prediction & risk assessment</p>
      </div>

      {/* Unified Risk & Personalized Assessment Board */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Unified Risk Assessment</h3>
          </div>
          <Button onClick={handleFullScan} disabled={scanning} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {scanning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning All Modules...</>
            ) : (
              <><ScanLine className="w-4 h-4 mr-2" /> Run Full Scan</>
            )}
          </Button>
        </div>

        {scanning ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
              <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <Shield className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
        ) : !hasScanned ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-foreground font-semibold">No scan data yet</p>
            <p className="text-sm text-muted-foreground mt-1">Run a full scan to see your risk assessment</p>
          </div>
        ) : (
          <>
            {/* Risk Gauges */}
            <div className="flex items-center justify-around flex-wrap gap-3 md:gap-6 mb-6">
              <RiskGauge score={scores.overall} label="Overall Risk" size="lg" />
              <RiskGauge score={scores.malware} label="Malware" />
              <RiskGauge score={scores.phishing} label="Phishing" />
              <RiskGauge score={scores.network} label="Network" />
              <RiskGauge score={scores.logAnomaly} label="Log Anomaly" />
            </div>

            {/* Personalized Risk Profile */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Personalized Risk Profile</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Risk Trend (7d)</p>
                  <div className="flex items-center gap-2">
                    {trend > 0 ? <TrendingUp className="w-4 h-4 text-destructive" /> : <TrendingDown className="w-4 h-4 text-success" />}
                    <span className={`text-lg font-bold font-mono ${trend > 0 ? "text-destructive" : "text-success"}`}>
                      {trend > 0 ? "+" : ""}{trend}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Scans</p>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold font-mono text-foreground">{profile?.total_scans ?? 0}</span>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Threats Found</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-lg font-bold font-mono text-foreground">{profile?.threats_detected ?? 0}</span>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Adaptive Window</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-sm font-mono text-foreground">30-day rolling</span>
                  </div>
                </div>
              </div>

              {/* Risk History Chart */}
              {riskHistory.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Risk Score History</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={riskHistory}>
                      <defs>
                        <linearGradient id="riskHistGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                      <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} interval={Math.max(0, Math.floor(riskHistory.length / 6))} />
                      <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", color: "hsl(200, 20%, 90%)" }} />
                      <Area type="monotone" dataKey="score" stroke="hsl(175, 80%, 50%)" fill="url(#riskHistGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={AlertTriangle} label="Active Threats" value={stats.threats} change={stats.threats > 0 ? `${stats.threats}` : "0"} changeType={stats.threats > 20 ? "negative" : "positive"} />
        <StatCard icon={CheckCircle} label="Threats Blocked" value={stats.blocked} change={stats.blocked > 0 ? `${stats.blocked}` : "0"} changeType="positive" />
        <StatCard icon={Bug} label="Malware Detected" value={stats.malware} change={`${stats.malware}`} changeType={stats.malware > 10 ? "negative" : "positive"} />
        <StatCard icon={Fish} label="Phishing Attempts" value={stats.phishing} change={`${stats.phishing}`} changeType="negative" />
      </div>

      {/* False Alert Filtering Engine */}
      <div className="mb-6">
        <FalseAlertFilter />
      </div>

      {/* Predictive Engine */}
      <div className="mb-6">
        <PredictiveEngine />
      </div>

      {/* Smart Recommendations */}
      <div className="mb-6">
        <SmartRecommendations riskLevel={scores.overall} threatTypes={["malware", "phishing"]} />
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatChart />
        <ThreatFeed />
      </div>

      <RealTimeAlerts />
      <SecurityChatbot />
    </AppLayout>
  );
};

export default Dashboard;
