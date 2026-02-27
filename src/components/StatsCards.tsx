import { Filter, CheckCircle2, XCircle, RotateCcw, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  counts: Record<string, number>;
  total: number;
}

export function StatsCards({ counts, total }: StatsCardsProps) {
  const cards = [
    { label: "Total Captados", value: total, icon: TrendingUp, color: "text-foreground" },
    { label: "Pendentes", value: counts.pendente, icon: Filter, color: "text-warning" },
    { label: "Aptos", value: counts.apto, icon: CheckCircle2, color: "text-success" },
    { label: "Descartados", value: counts.descartado, icon: XCircle, color: "text-destructive" },
    { label: "Reanálise", value: counts["reanálise"], icon: RotateCcw, color: "text-info" },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="glass-card rounded-xl p-4 animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <p className="text-2xl font-display font-bold">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
