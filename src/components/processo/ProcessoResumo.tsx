import { DollarSign, Clock, CalendarClock, Shield, TrendingUp, Briefcase } from "lucide-react";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useNegocios } from "@/hooks/useNegocios";
import { Processo } from "@/hooks/useProcessos";

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
};

const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente", apto: "Apto", descartado: "Descartado", "reanálise": "Reanálise",
};

interface Props {
  processo: Processo;
}

export default function ProcessoResumo({ processo }: Props) {
  const { data: andamentos = [] } = useProcessoAndamentos(processo.id);
  const { data: negocios = [] } = useNegocios(processo.id);

  const ultimoMov = andamentos[0];
  const triagem = processo.triagem_resultado ?? "pendente";

  // Simple risk heuristic based on value + transit
  const risco = !processo.transito_julgado
    ? "Alto"
    : (processo.valor_estimado ?? 0) > 200000
      ? "Médio"
      : "Baixo";

  const riscoColor = risco === "Alto"
    ? "text-destructive"
    : risco === "Médio"
      ? "text-warning"
      : "text-success";

  // Negocio status summary
  const negocioStatus = negocios.length === 0
    ? "Não criado"
    : negocios.some(n => n.negocio_status === "ganho")
      ? "Fechado"
      : "Em andamento";

  const negocioColor = negocioStatus === "Fechado"
    ? "text-success"
    : negocioStatus === "Em andamento"
      ? "text-primary"
      : "text-muted-foreground";

  const cards = [
    {
      icon: DollarSign,
      label: "Valor Estimado",
      value: formatCurrency(processo.valor_estimado),
      accent: "text-primary",
    },
    {
      icon: Clock,
      label: "Último Movimento",
      value: ultimoMov ? ultimoMov.titulo : "Nenhum",
      sub: ultimoMov ? formatDate(ultimoMov.data_andamento) : undefined,
      accent: "text-foreground",
    },
    {
      icon: CalendarClock,
      label: "Prazos",
      value: "Nenhum",
      accent: "text-muted-foreground",
    },
    {
      icon: Shield,
      label: "Triagem",
      value: TRIAGEM_LABELS[triagem],
      sub: formatDate(processo.triagem_data),
      accent: "text-foreground",
    },
    {
      icon: TrendingUp,
      label: "Risco",
      value: risco,
      accent: riscoColor,
    },
    {
      icon: Briefcase,
      label: "Negócio",
      value: negocioStatus,
      sub: negocios.length > 0 ? `${negocios.length} negócio(s)` : undefined,
      accent: negocioColor,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {cards.map(c => (
        <div key={c.label} className="bg-card border border-border/40 rounded-lg p-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <c.icon className={`w-3.5 h-3.5 ${c.accent}`} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{c.label}</span>
          </div>
          <p className={`text-xs font-semibold truncate ${c.accent}`}>{c.value}</p>
          {c.sub && <p className="text-[10px] text-muted-foreground truncate">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}
