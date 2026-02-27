import { useMemo } from "react";
import { useProcessos } from "@/hooks/useProcessos";
import { usePessoas } from "@/hooks/usePessoas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, XCircle } from "lucide-react";

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "outline" | "default" | "destructive" }> = {
  em_andamento: { label: "Em Andamento", icon: Clock, variant: "outline" },
  ganho: { label: "Ganho", icon: TrendingUp, variant: "default" },
  perdido: { label: "Perdido", icon: XCircle, variant: "destructive" },
};

export default function Negocios() {
  const { data: processos = [], isLoading } = useProcessos();
  const { data: pessoas = [] } = usePessoas();

  const negocios = useMemo(() => {
    return processos
      .filter(p => p.negocio_status)
      .map(p => {
        const pessoa = pessoas.find(pe => pe.id === p.pessoa_id);
        return { ...p, pessoaNome: pessoa?.nome ?? "—" };
      });
  }, [processos, pessoas]);

  const stats = {
    total: negocios.length,
    em_andamento: negocios.filter(n => n.negocio_status === "em_andamento").length,
    ganho: negocios.filter(n => n.negocio_status === "ganho").length,
    perdido: negocios.filter(n => n.negocio_status === "perdido").length,
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  }

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
                const cfg = statusConfig[n.negocio_status ?? "em_andamento"];
                return (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono text-xs">{n.numero_processo}</TableCell>
                    <TableCell>{n.pessoaNome}</TableCell>
                    <TableCell className="text-xs">{n.tipo_servico ? TIPO_SERVICO_LABELS[n.tipo_servico] ?? n.tipo_servico : "—"}</TableCell>
                    <TableCell>{n.valor_proposta ? `R$ ${n.valor_proposta.toLocaleString("pt-BR")}` : "—"}</TableCell>
                    <TableCell><Badge variant={cfg?.variant ?? "outline"}>{cfg?.label ?? n.negocio_status}</Badge></TableCell>
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
