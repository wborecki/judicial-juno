import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

export default function Analise() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Análise</h1>
        <p className="text-sm text-muted-foreground mt-1">Preenchimento de dados e revisão dos processos distribuídos</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-muted-foreground" />
            Processos em Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Processos atribuídos à sua equipe para análise detalhada e preenchimento de dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
