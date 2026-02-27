import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";

export default function Distribuicao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Distribuição</h1>
        <p className="text-sm text-muted-foreground mt-1">Roteamento de processos aptos para as equipes de análise</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
            Fila de Distribuição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Processos aprovados na triagem serão listados aqui para distribuição automática ou manual às equipes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
