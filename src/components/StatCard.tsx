import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

const StatCard = ({ icon: Icon, label, value, change, changeType = "neutral" }: StatCardProps) => {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {change && (
          <span className={`text-xs font-mono font-semibold ${changeColors[changeType]}`}>{change}</span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
