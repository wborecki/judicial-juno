import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";

export default function Comercial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Comercial</h1>
        <p className="text-sm text-muted-foreground mt-1">Contato e fechamento de negócios com as partes</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-muted-foreground" />
            Leads Comerciais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Processos precificados prontos para contato comercial e negociação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
