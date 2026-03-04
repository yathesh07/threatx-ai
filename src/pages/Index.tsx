import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import RiskGauge from "@/components/RiskGauge";
import ThreatFeed from "@/components/ThreatFeed";
import ThreatChart from "@/components/ThreatChart";
import StatCard from "@/components/StatCard";
import RealTimeAlerts from "@/components/RealTimeAlerts";
import PredictiveEngine from "@/components/PredictiveEngine";
import PersonalizedRisk from "@/components/PersonalizedRisk";
import SmartRecommendations from "@/components/SmartRecommendations";
import FalseAlertFilter from "@/components/FalseAlertFilter";
import SecurityChatbot from "@/components/SecurityChatbot";
import { Shield, Bug, Fish, Activity, AlertTriangle, CheckCircle, ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [scores, setScores] = useState({ overall: 62, malware: 85, phishing: 72, network: 45, logAnomaly: 28 });
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState({ threats: 23, blocked: 1847, malware: 12, phishing: 8 });

  // Live-update scores every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setScores({
        overall: Math.round(30 + Math.random() * 50),
        malware: Math.round(40 + Math.random() * 50),
        phishing: Math.round(30 + Math.random() * 50),
        network: Math.round(15 + Math.random() * 55),
        logAnomaly: Math.round(10 + Math.random() * 50),
      });
      setStats({
        threats: Math.round(10 + Math.random() * 30),
        blocked: Math.round(1500 + Math.random() * 500),
        malware: Math.round(5 + Math.random() * 20),
        phishing: Math.round(3 + Math.random() * 15),
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleFullScan = () => {
    setScanning(true);
    setTimeout(() => {
      const newScores = {
        overall: 0,
        malware: Math.round(Math.random() * 40 + 50),
        phishing: Math.round(Math.random() * 50 + 30),
        network: Math.round(Math.random() * 60 + 20),
        logAnomaly: Math.round(Math.random() * 45 + 35),
      };
      newScores.overall = Math.round((newScores.malware + newScores.phishing + newScores.network + newScores.logAnomaly) / 4);
      setScores(newScores);
      setScanning(false);
      toast({
        title: "Full System Scan Complete",
        description: `Overall risk score: ${newScores.overall}/100`,
        variant: newScores.overall >= 70 ? "destructive" : "default",
      });
    }, 4000);
  };

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Security Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Real-time threat monitoring, prediction & risk assessment</p>
      </div>

      {/* Unified Risk Board with Full Scan */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Overall Risk Assessment</h3>
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
        ) : (
          <div className="flex items-center justify-around flex-wrap gap-4 md:gap-8">
            <RiskGauge score={scores.overall} label="Overall Risk" size="lg" />
            <RiskGauge score={scores.malware} label="Malware" />
            <RiskGauge score={scores.phishing} label="Phishing" />
            <RiskGauge score={scores.network} label="Network" />
            <RiskGauge score={scores.logAnomaly} label="Log Anomaly" />
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={AlertTriangle} label="Active Threats" value={stats.threats} change={`${stats.threats > 20 ? "+" : ""}${stats.threats - 20}`} changeType={stats.threats > 20 ? "negative" : "positive"} />
        <StatCard icon={CheckCircle} label="Threats Blocked" value={stats.blocked} change="+12%" changeType="positive" />
        <StatCard icon={Bug} label="Malware Detected" value={stats.malware} change={`${stats.malware > 10 ? "+" : "-"}${Math.abs(stats.malware - 10)}`} changeType={stats.malware > 10 ? "negative" : "positive"} />
        <StatCard icon={Fish} label="Phishing Attempts" value={stats.phishing} change={`+${stats.phishing}`} changeType="negative" />
      </div>

      {/* False Alert Filtering Engine */}
      <div className="mb-6">
        <FalseAlertFilter />
      </div>

      {/* Predictive Engine */}
      <div className="mb-6">
        <PredictiveEngine />
      </div>

      {/* Personalized Risk */}
      <div className="mb-6">
        <PersonalizedRisk />
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
