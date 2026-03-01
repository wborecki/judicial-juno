import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function ConfiguracoesGeral() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Configurações Gerais</h1>
        <p className="text-xs text-muted-foreground mt-1">Preferências e regras de negócio do sistema</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Settings className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            Configurações de regras de negócio, integrações, notificações e preferências do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
