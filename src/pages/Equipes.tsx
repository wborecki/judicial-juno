import { useEquipes, useUsuarios, useEquipeMembros } from "@/hooks/useEquipes";
import { EQUIPE_TIPO_LABELS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users } from "lucide-react";

export default function Equipes() {
  const { data: equipes = [], isLoading: loadingEquipes } = useEquipes();
  const { data: usuarios = [] } = useUsuarios();
  const { data: membros = [] } = useEquipeMembros();

  if (loadingEquipes) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}</div></div>;
  }

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
        {equipes.map(eq => {
          const equipeMembroIds = membros.filter(m => m.equipe_id === eq.id).map(m => m.usuario_id);
          const equipeUsuarios = usuarios.filter(u => equipeMembroIds.includes(u.id));
          return (
            <Card key={eq.id} className="glass-card hover:border-accent/30 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{eq.nome}</CardTitle>
                  <Badge variant={eq.ativa ? "default" : "secondary"}>{eq.ativa ? "Ativa" : "Inativa"}</Badge>
                </div>
                <CardDescription>{EQUIPE_TIPO_LABELS[eq.tipo as keyof typeof EQUIPE_TIPO_LABELS] ?? eq.tipo}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>{equipeUsuarios.length} membro{equipeUsuarios.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-1.5">
                  {equipeUsuarios.map(m => (
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
