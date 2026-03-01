import { useState, useMemo } from "react";
import { Briefcase, Plus, List, Columns3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNegocios } from "@/hooks/useNegocios";
import { useNegocioPipelines } from "@/hooks/useNegocioPipelines";
import NegocioListTable from "@/components/negocios/NegocioListTable";
import NegocioKanban from "@/components/negocios/NegocioKanban";
import NegocioSheet from "@/components/negocios/NegocioSheet";
import { Badge } from "@/components/ui/badge";

export default function Negocios() {
  const { data: negocios = [], isLoading } = useNegocios();
  const { data: pipelines = [] } = useNegocioPipelines();

  const [view, setView] = useState<"lista" | "kanban">("kanban");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");

  const activePipeline = useMemo(() => {
    if (selectedPipelineId) return pipelines.find((p) => p.id === selectedPipelineId);
    return pipelines.find((p) => p.padrao) ?? pipelines[0];
  }, [pipelines, selectedPipelineId]);

  const etapas = activePipeline?.etapas ?? [];

  const filtered = useMemo(() => {
    let list = negocios;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          (n.titulo ?? "").toLowerCase().includes(q) ||
          (n.pessoas?.nome ?? "").toLowerCase().includes(q) ||
          (n.processos?.numero_processo ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((n) => n.negocio_status === statusFilter);
    }
    return list;
  }, [negocios, search, statusFilter]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Negócios</h1>
            <p className="text-xs text-muted-foreground">Pipeline comercial e gestão de deals</p>
          </div>
        </div>
        <Button onClick={() => setSheetOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Negócio
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar negócios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {pipelines.length > 1 && (
            <Select value={activePipeline?.id ?? ""} onValueChange={setSelectedPipelineId}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} {p.padrao && <Badge variant="secondary" className="ml-1 text-[10px]">padrão</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList className="h-9">
              <TabsTrigger value="kanban" className="gap-1.5 text-xs px-3">
                <Columns3 className="w-3.5 h-3.5" /> Kanban
              </TabsTrigger>
              <TabsTrigger value="lista" className="gap-1.5 text-xs px-3">
                <List className="w-3.5 h-3.5" /> Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
      ) : view === "kanban" ? (
        <NegocioKanban negocios={filtered} etapas={etapas} />
      ) : (
        <NegocioListTable negocios={filtered} etapas={etapas} />
      )}

      <NegocioSheet open={sheetOpen} onOpenChange={setSheetOpen} etapas={etapas} />
    </div>
  );
}
