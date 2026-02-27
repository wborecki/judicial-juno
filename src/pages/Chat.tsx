import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Chat() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Chat Interno</h1>
        <p className="text-sm text-muted-foreground mt-1">Comunicação entre equipes</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            O chat interno permitirá comunicação entre equipes, compartilhamento de links de processos e acompanhamento de atividades em tempo real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
