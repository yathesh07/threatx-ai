import AppLayout from "@/components/AppLayout";
import RiskGauge from "@/components/RiskGauge";
import ThreatFeed from "@/components/ThreatFeed";
import ThreatChart from "@/components/ThreatChart";
import StatCard from "@/components/StatCard";
import OverallRiskScanner from "@/components/OverallRiskScanner";
import RealTimeAlerts from "@/components/RealTimeAlerts";
import PredictiveEngine from "@/components/PredictiveEngine";
import PersonalizedRisk from "@/components/PersonalizedRisk";
import SmartRecommendations from "@/components/SmartRecommendations";
import { Shield, Bug, Fish, Activity, AlertTriangle, CheckCircle } from "lucide-react";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Security Dashboard</h2>
        <p className="text-muted-foreground mt-1">Real-time threat monitoring, prediction & risk assessment</p>
      </div>

      {/* Overall Risk Score */}
      <div className="bg-card border border-border rounded-xl p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Overall Risk Assessment</h3>
        </div>
        <div className="flex items-center justify-around flex-wrap gap-8">
          <RiskGauge score={62} label="Overall Risk" size="lg" />
          <RiskGauge score={85} label="Malware" />
          <RiskGauge score={72} label="Phishing" />
          <RiskGauge score={45} label="Network" />
          <RiskGauge score={28} label="Log Anomaly" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={AlertTriangle} label="Active Threats" value={23} change="+5" changeType="negative" />
        <StatCard icon={CheckCircle} label="Threats Blocked" value={1847} change="+12%" changeType="positive" />
        <StatCard icon={Bug} label="Malware Detected" value={12} change="-3" changeType="positive" />
        <StatCard icon={Fish} label="Phishing Attempts" value={8} change="+2" changeType="negative" />
      </div>

      {/* Predictive Engine */}
      <div className="mb-6">
        <PredictiveEngine />
      </div>

      {/* Personalized Risk */}
      <div className="mb-6">
        <PersonalizedRisk />
      </div>

      {/* Overall Risk Scanner */}
      <div className="mb-6">
        <OverallRiskScanner />
      </div>

      {/* Smart Recommendations */}
      <div className="mb-6">
        <SmartRecommendations riskLevel={62} threatTypes={["malware", "phishing"]} />
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatChart />
        <ThreatFeed />
      </div>

      <RealTimeAlerts />
    </AppLayout>
  );
};

export default Dashboard;
