import { useState, useMemo } from "react";
import { Plus, List, Columns3, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNegocios } from "@/hooks/useNegocios";
import { useNegocioPipelines } from "@/hooks/useNegocioPipelines";
import NegocioListTable from "@/components/negocios/NegocioListTable";
import NegocioKanban from "@/components/negocios/NegocioKanban";
import NegocioSheet from "@/components/negocios/NegocioSheet";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";

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

  const activeCount = negocios.filter((n) => n.negocio_status === "em_andamento").length;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Compact toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View toggles */}
        <div className="flex items-center border rounded-md overflow-hidden">
          <Toggle
            size="sm"
            pressed={view === "kanban"}
            onPressedChange={() => setView("kanban")}
            className="rounded-none h-8 px-2.5 data-[state=on]:bg-accent"
          >
            <Columns3 className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={view === "lista"}
            onPressedChange={() => setView("lista")}
            className="rounded-none h-8 px-2.5 data-[state=on]:bg-accent"
          >
            <List className="w-4 h-4" />
          </Toggle>
        </div>

        {/* Pipeline selector */}
        {pipelines.length > 1 && (
          <Select value={activePipeline?.id ?? ""} onValueChange={setSelectedPipelineId}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 w-44 text-xs"
          />
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="ganho">Ganho</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {/* Count */}
        <Badge variant="secondary" className="text-xs font-normal h-6">
          {activeCount} negócio{activeCount !== 1 ? "s" : ""}
        </Badge>

        {/* New deal button */}
        <Button onClick={() => setSheetOpen(true)} size="sm" className="h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Negócio
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Carregando...
        </div>
      ) : view === "kanban" ? (
        <NegocioKanban negocios={filtered} etapas={etapas} />
      ) : (
        <NegocioListTable negocios={filtered} etapas={etapas} />
      )}

      <NegocioSheet open={sheetOpen} onOpenChange={setSheetOpen} etapas={etapas} />
    </div>
  );
}
