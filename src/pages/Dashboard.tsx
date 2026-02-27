import { useMemo } from "react";
import { mockProcessos, mockPessoas, mockNegocios } from "@/lib/mock-data";
import { PIPELINE_LABELS, PipelineStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, DollarSign, Filter, ArrowRightLeft, FileSearch, Briefcase } from "lucide-react";

export default function Dashboard() {
  const stats = useMemo(() => {
    const pipelineCounts = mockProcessos.reduce((acc, p) => {
      acc[p.pipelineStatus] = (acc[p.pipelineStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valorTotal = mockProcessos.reduce((sum, p) => sum + (p.valorEstimado || 0), 0);
    const negociosGanhos = mockNegocios.filter(n => n.status === "ganho").length;
    const valorGanho = mockNegocios.filter(n => n.status === "ganho").reduce((sum, n) => sum + (n.valorFechamento || 0), 0);

    return { pipelineCounts, valorTotal, negociosGanhos, valorGanho, totalProcessos: mockProcessos.length, totalPessoas: mockPessoas.length };
  }, []);

  const kpis = [
    { label: "Total Processos", value: stats.totalProcessos, icon: BarChart3, color: "text-info" },
    { label: "Pessoas Cadastradas", value: stats.totalPessoas, icon: Users, color: "text-accent" },
    { label: "Negócios Ganhos", value: stats.negociosGanhos, icon: TrendingUp, color: "text-success" },
    { label: "Valor Ganho", value: `R$ ${(stats.valorGanho / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-sidebar-primary" },
  ];

  const pipelineStages: { key: PipelineStatus; icon: React.ElementType }[] = [
    { key: "triagem", icon: Filter },
    { key: "distribuido", icon: ArrowRightLeft },
    { key: "em_analise", icon: FileSearch },
    { key: "precificado", icon: DollarSign },
    { key: "comercial", icon: Briefcase },
    { key: "ganho", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do pipeline de ativos judiciais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{kpi.value}</p>
                </div>
                <kpi.icon className={`w-8 h-8 ${kpi.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Pipeline de Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {pipelineStages.map(({ key, icon: Icon }) => (
              <div key={key} className="text-center p-4 rounded-lg bg-muted/50 border border-border/50">
                <Icon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-display font-bold">{stats.pipelineCounts[key] || 0}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{PIPELINE_LABELS[key]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
