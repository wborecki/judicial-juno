import { mockEquipes, mockUsuarios } from "@/lib/mock-data";
import { EQUIPE_TIPO_LABELS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default function Equipes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Equipes</h1>
          <p className="text-sm text-muted-foreground mt-1">Configuração de equipes e roteamento de processos</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nova Equipe</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEquipes.map(eq => {
          const membros = mockUsuarios.filter(u => eq.membros.includes(u.id));
          return (
            <Card key={eq.id} className="glass-card hover:border-accent/30 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{eq.nome}</CardTitle>
                  <Badge variant={eq.ativa ? "default" : "secondary"}>{eq.ativa ? "Ativa" : "Inativa"}</Badge>
                </div>
                <CardDescription>{EQUIPE_TIPO_LABELS[eq.tipo]}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>{membros.length} membro{membros.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-1.5">
                  {membros.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-semibold text-accent">
                        {m.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-xs">{m.nome}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{m.cargo}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
