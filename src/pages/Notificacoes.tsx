import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function Notificacoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Notificações</h1>
        <p className="text-xs text-muted-foreground mt-1">Configure alertas e notificações do sistema</p>
      </div>
      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Bell className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            Configure quais notificações você deseja receber e como recebê-las.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
