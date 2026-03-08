interface RiskGaugeProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

const getRiskColor = (score: number) => {
  if (score >= 80) return { color: "text-risk-critical", bg: "bg-risk-critical", label: "CRITICAL" };
  if (score >= 60) return { color: "text-risk-high", bg: "bg-risk-high", label: "HIGH" };
  if (score >= 40) return { color: "text-risk-medium", bg: "bg-risk-medium", label: "MEDIUM" };
  if (score >= 20) return { color: "text-risk-low", bg: "bg-risk-low", label: "LOW" };
  return { color: "text-risk-safe", bg: "bg-risk-safe", label: "SAFE" };
};

const RiskGauge = ({ score, label, size = "sm" }: RiskGaugeProps) => {
  const risk = getRiskColor(score);
  const dimensions = size === "lg" ? 140 : 80;
  const strokeWidth = size === "lg" ? 10 : 7;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg width={dimensions} height={dimensions} className="-rotate-90">
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={`${risk.color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size === "lg" ? "text-3xl" : "text-xl"} font-bold font-mono ${risk.color}`}>
            {score}
          </span>
          <span className={`text-xs font-mono font-semibold ${risk.color} opacity-80`}>{risk.label}</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

export { getRiskColor };
export default RiskGauge;
