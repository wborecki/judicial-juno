import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useConfigAreasEquipes, useUpdateConfigAreaEquipe } from "@/hooks/useConfigAreasEquipes";
import { useEquipes } from "@/hooks/useEquipes";
import { AREA_LABELS, type AreaTrabalho } from "@/hooks/useProcessoAreas";
import { Scale, DollarSign, FileCheck, ShieldCheck, Settings } from "lucide-react";
import { toast } from "sonner";

const AREA_ICONS: Record<string, React.ReactNode> = {
  juridico: <Scale className="w-4 h-4" />,
  financeiro: <DollarSign className="w-4 h-4" />,
  documental: <FileCheck className="w-4 h-4" />,
  compliance: <ShieldCheck className="w-4 h-4" />,
};

export default function ConfiguracoesGeral() {
  const { data: configs = [], isLoading } = useConfigAreasEquipes();
  const { data: equipes = [] } = useEquipes();
  const updateConfig = useUpdateConfigAreaEquipe();

  const activeEquipes = equipes.filter((e) => e.ativa);

  const handleChange = async (configId: string, equipeId: string | null) => {
    try {
      await updateConfig.mutateAsync({ id: configId, equipe_id: equipeId });
      toast.success("Equipe atualizada");
    } catch {
      toast.error("Erro ao atualizar equipe");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Configurações Gerais</h1>
        <p className="text-xs text-muted-foreground mt-1">Preferências e regras de negócio do sistema</p>
      </div>

      {/* Equipes por Área de Trabalho */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div>
            <CardTitle className="text-sm">Equipes por Área de Trabalho</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Configure qual equipe é responsável por cada área. Quando um processo for marcado como "Apto para Análise", as áreas serão criadas automaticamente com estas equipes atribuídas.
            </p>
          </div>

          {isLoading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {configs.map((config) => {
                const areaKey = config.area as AreaTrabalho;
                const equipe = activeEquipes.find((e) => e.id === config.equipe_id);
                return (
                  <div
                    key={config.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/10"
                  >
                    <div className="text-muted-foreground shrink-0">
                      {AREA_ICONS[areaKey]}
                    </div>
                    <span className="text-sm font-medium w-28 shrink-0">
                      {AREA_LABELS[areaKey] ?? config.area}
                    </span>
                    <Select
                      value={config.equipe_id ?? "none"}
                      onValueChange={(v) => handleChange(config.id, v === "none" ? null : v)}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1 max-w-[240px]">
                        <SelectValue placeholder="Nenhuma equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs text-muted-foreground">Nenhuma equipe</SelectItem>
                        {activeEquipes.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id} className="text-xs">
                            {eq.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {equipe && (
                      <Badge variant="outline" className="text-[10px] shrink-0">{equipe.nome}</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for future settings */}
      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Settings className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Mais Configurações em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            Regras de negócio adicionais, notificações e preferências do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
