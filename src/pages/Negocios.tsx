import { useMemo } from "react";
import { mockNegocios, mockProcessos, mockPessoas } from "@/lib/mock-data";
import { TIPO_SERVICO_LABELS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Clock, XCircle } from "lucide-react";

const statusConfig = {
  em_andamento: { label: "Em Andamento", icon: Clock, variant: "outline" as const },
  ganho: { label: "Ganho", icon: TrendingUp, variant: "default" as const },
  perdido: { label: "Perdido", icon: XCircle, variant: "destructive" as const },
};

export default function Negocios() {
  const negocios = useMemo(() => {
    return mockNegocios.map(n => {
      const processo = mockProcessos.find(p => p.id === n.processoId);
      const pessoa = mockPessoas.find(p => p.id === n.pessoaId);
      return { ...n, processo, pessoa };
    });
  }, []);

  const stats = {
    total: negocios.length,
    em_andamento: negocios.filter(n => n.status === "em_andamento").length,
    ganho: negocios.filter(n => n.status === "ganho").length,
    perdido: negocios.filter(n => n.status === "perdido").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Negócios</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe os negócios em andamento, ganhos e perdidos</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground">Em Andamento</p><p className="text-2xl font-display font-bold text-accent mt-1">{stats.em_andamento}</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground">Ganhos</p><p className="text-2xl font-display font-bold text-success mt-1">{stats.ganho}</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground">Perdidos</p><p className="text-2xl font-display font-bold text-destructive mt-1">{stats.perdido}</p></CardContent></Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg">Todos os Negócios</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processo</TableHead>
                <TableHead>Pessoa</TableHead>
                <TableHead>Tipo Serviço</TableHead>
                <TableHead>Valor Proposta</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {negocios.map(n => {
                const cfg = statusConfig[n.status];
                return (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono text-xs">{n.processo?.numeroProcesso ?? "—"}</TableCell>
                    <TableCell>{n.pessoa?.nome ?? "—"}</TableCell>
                    <TableCell className="text-xs">{TIPO_SERVICO_LABELS[n.tipoServico]}</TableCell>
                    <TableCell>{n.valorProposta ? `R$ ${n.valorProposta.toLocaleString("pt-BR")}` : "—"}</TableCell>
                    <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
