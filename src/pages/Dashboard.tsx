import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Visão geral do pipeline de ativos judiciais</p>
      </div>
      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <LayoutDashboard className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            O dashboard com indicadores e métricas estará disponível em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
