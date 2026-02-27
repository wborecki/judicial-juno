import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Captacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Captação de Processos</h1>
        <p className="text-sm text-muted-foreground mt-1">Importe dados de processos via JSON</p>
      </div>

      <Card className="glass-card border-dashed border-2">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Upload de Arquivo JSON</CardTitle>
          <CardDescription className="mb-6 max-w-md">
            Arraste e solte o arquivo JSON com os dados dos processos captados pelos robôs, ou clique para selecionar.
          </CardDescription>
          <Button>Selecionar Arquivo</Button>
        </CardContent>
      </Card>
    </div>
  );
}
