import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const generateData = () => {
  const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
  return times.map((time) => ({
    time,
    threats: Math.round(5 + Math.random() * 45),
    blocked: Math.round(3 + Math.random() * 40),
  }));
};

const ThreatChart = () => {
  const [data, setData] = useState(generateData);

  useEffect(() => {
    const interval = setInterval(() => setData(generateData()), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Threat Activity (24h)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis dataKey="time" stroke="hsl(215, 15%, 50%)" fontSize={12} fontFamily="JetBrains Mono" />
          <YAxis stroke="hsl(215, 15%, 50%)" fontSize={12} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px" }} />
          <Area type="monotone" dataKey="threats" stroke="hsl(0, 72%, 55%)" fill="url(#threatGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="blocked" stroke="hsl(175, 80%, 50%)" fill="url(#blockedGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 rounded bg-destructive" />
          <span className="text-xs text-muted-foreground">Threats Detected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Threats Blocked</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatChart;
