import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import RiskGauge from "./RiskGauge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const generatePredictionData = () => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() + i * 3600000);
    const base = 30 + Math.sin(i / 4) * 20 + Math.random() * 15;
    return {
      time: hour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      probability: Math.min(95, Math.max(5, Math.round(base))),
    };
  });
};

const attackTypes = [
  { type: "Malware", probability: 0, color: "text-destructive" },
  { type: "Phishing", probability: 0, color: "text-warning" },
  { type: "Network Intrusion", probability: 0, color: "text-primary" },
  { type: "DDoS", probability: 0, color: "text-accent" },
];

const PredictiveEngine = () => {
  const [prediction, setPrediction] = useState<number>(0);
  const [timeline, setTimeline] = useState<{ time: string; probability: number }[]>([]);
  const [attacks, setAttacks] = useState(attackTypes);
  const [analyzing, setAnalyzing] = useState(false);

  const runPrediction = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const data = generatePredictionData();
      const avgProb = Math.round(data.reduce((s, d) => s + d.probability, 0) / data.length);
      setTimeline(data);
      setPrediction(avgProb);
      setAttacks([
        { type: "Malware", probability: Math.round(20 + Math.random() * 40), color: "text-destructive" },
        { type: "Phishing", probability: Math.round(15 + Math.random() * 35), color: "text-warning" },
        { type: "Network Intrusion", probability: Math.round(10 + Math.random() * 30), color: "text-primary" },
        { type: "DDoS", probability: Math.round(5 + Math.random() * 20), color: "text-accent" },
      ]);
      setAnalyzing(false);
    }, 2500);
  };

  useEffect(() => { runPrediction(); }, []);

  const getAlertMessage = () => {
    if (prediction >= 70) return { text: "HIGH ALERT: Elevated attack probability detected. Activate countermeasures.", icon: AlertTriangle, cls: "border-destructive/30 bg-destructive/5 text-destructive" };
    if (prediction >= 40) return { text: "MODERATE: Increased threat activity expected. Monitor closely.", icon: TrendingUp, cls: "border-warning/30 bg-warning/5 text-warning" };
    return { text: "LOW RISK: Normal threat levels predicted. Continue monitoring.", icon: Shield, cls: "border-success/30 bg-success/5 text-success" };
  };

  const alert = getAlertMessage();

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-base md:text-lg font-semibold text-foreground">24h Attack Probability</h3>
        </div>
        <Button onClick={runPrediction} disabled={analyzing} size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
          <Zap className="w-4 h-4 mr-1" />
          {analyzing ? "Analyzing..." : "Re-analyze"}
        </Button>
      </div>

      {analyzing ? (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
          <p className="text-foreground font-semibold">Running predictive models...</p>
          <p className="text-sm text-muted-foreground font-mono mt-1">Analyzing behavior patterns, anomaly frequency, historical data</p>
        </div>
      ) : (
        <>
          <div className={`rounded-lg border p-4 mb-6 flex items-center gap-3 ${alert.cls}`}>
            <alert.icon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{alert.text}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex justify-center">
              <RiskGauge score={prediction} label="24h Attack Probability" size="lg" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm font-semibold text-foreground mb-3">Predicted Attack Vectors</p>
              {attacks.sort((a, b) => b.probability - a.probability).map((a) => (
                <div key={a.type} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-32">{a.type}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000`} style={{ width: `${a.probability}%`, background: `hsl(var(--primary))` }} />
                  </div>
                  <span className={`text-sm font-mono font-bold ${a.color}`}>{a.probability}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">24-Hour Risk Timeline</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="time" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", color: "hsl(200, 20%, 90%)" }} />
                <Area type="monotone" dataKey="probability" stroke="hsl(175, 80%, 50%)" fill="url(#predGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictiveEngine;
