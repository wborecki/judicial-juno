import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Plug } from "lucide-react";

export default function Integracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Integrações</h1>
        <p className="text-xs text-muted-foreground mt-1">Conecte com sistemas externos e APIs</p>
      </div>
      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Plug className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            Configure integrações com tribunais, APIs de consulta processual e outros sistemas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
