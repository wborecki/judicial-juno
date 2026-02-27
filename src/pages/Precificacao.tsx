import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function Precificacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Precificação</h1>
        <p className="text-sm text-muted-foreground mt-1">Avaliação financeira dos processos analisados</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            Processos para Precificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Processos analisados aguardando precificação pela equipe financeira.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
