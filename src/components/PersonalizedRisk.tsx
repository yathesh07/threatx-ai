import { useState, useEffect } from "react";
import { User, TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import RiskGauge from "./RiskGauge";
import { useAuth } from "@/contexts/AuthContext";

const generateHistoricalRisk = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    data.push({
      date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
      score: Math.round(30 + Math.sin(i / 5) * 20 + Math.random() * 15),
    });
  }
  return data;
};

const PersonalizedRisk = () => {
  const { profile } = useAuth();
  const [history, setHistory] = useState<{ date: string; score: number }[]>([]);
  const [adaptiveScore, setAdaptiveScore] = useState(50);

  useEffect(() => {
    const hist = generateHistoricalRisk();
    setHistory(hist);
    // Adaptive score based on profile + recent trends
    const recentAvg = hist.slice(-7).reduce((s, d) => s + d.score, 0) / 7;
    const baseline = profile?.risk_baseline ?? 50;
    const scans = profile?.total_scans ?? 0;
    // More scans = lower baseline over time (learning effect)
    const scanBonus = Math.min(10, scans * 0.5);
    setAdaptiveScore(Math.round((recentAvg * 0.6 + baseline * 0.4) - scanBonus));
  }, [profile]);

  const trend = history.length >= 2 ? history[history.length - 1].score - history[history.length - 8]?.score : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Personalized Risk Profile</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="flex justify-center">
          <RiskGauge score={adaptiveScore} label="Your Risk Score" size="lg" />
        </div>
        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Risk Trend (7d)</p>
            <div className="flex items-center gap-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-success" />
              )}
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
        </div>
        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Threats Found</p>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-warning" />
              <span className="text-lg font-bold font-mono text-foreground">{profile?.threats_detected ?? 0}</span>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Risk Adapts Over</p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-foreground">30-day rolling window</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Risk Score History (30 days)</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="riskHistGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", color: "hsl(200, 20%, 90%)" }} />
            <Area type="monotone" dataKey="score" stroke="hsl(175, 80%, 50%)" fill="url(#riskHistGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PersonalizedRisk;
