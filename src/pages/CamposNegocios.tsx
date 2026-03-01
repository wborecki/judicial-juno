import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function CamposNegocios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Campos de Negócios</h1>
        <p className="text-xs text-muted-foreground mt-1">Configure os tipos de serviço, etapas e campos personalizados dos negócios</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            Aqui você poderá configurar os tipos de serviço, status, etapas do pipeline de negócios e campos personalizados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
