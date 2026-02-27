import { useState, useMemo } from "react";
import { ProcessoLead } from "@/lib/types";
import { mockProcessos } from "@/lib/mock-data";
import { StatsCards } from "@/components/StatsCards";
import { ProcessTable } from "@/components/ProcessTable";
import { TriageModal } from "@/components/TriageModal";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Triagem() {
  const [processos, setProcessos] = useState<ProcessoLead[]>(
    mockProcessos.filter(p => p.pipelineStatus === "triagem")
  );
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoLead | null>(null);

  const counts = useMemo(() => ({
    todos: processos.length,
    pendente: processos.filter(p => p.triagem === "pendente").length,
    apto: processos.filter(p => p.triagem === "apto").length,
    descartado: processos.filter(p => p.triagem === "descartado").length,
    "reanálise": processos.filter(p => p.triagem === "reanálise").length,
  }), [processos]);

  const filtered = useMemo(() => {
    let list = processos;
    if (activeFilter !== "todos") {
      list = list.filter(p => p.triagem === activeFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.numeroProcesso.includes(q) ||
        p.parteAutora.toLowerCase().includes(q) ||
        p.tribunal.toLowerCase().includes(q)
      );
    }
    return list;
  }, [processos, activeFilter, search]);

  const handleUpdate = (id: string, updates: Partial<ProcessoLead>) => {
    setProcessos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Triagem de Processos</h1>
          <p className="text-sm text-muted-foreground mt-1">Analise e qualifique os leads captados</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar processo, parte, tribunal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList>
          <TabsTrigger value="todos">Todos ({counts.todos})</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes ({counts.pendente})</TabsTrigger>
          <TabsTrigger value="apto">Aptos ({counts.apto})</TabsTrigger>
          <TabsTrigger value="descartado">Descartados ({counts.descartado})</TabsTrigger>
          <TabsTrigger value="reanálise">Reanálise ({counts["reanálise"]})</TabsTrigger>
        </TabsList>
      </Tabs>

      <StatsCards counts={counts} total={processos.length} />
      <ProcessTable processos={filtered} onSelect={setSelectedProcesso} />

      <TriageModal
        processo={selectedProcesso}
        open={!!selectedProcesso}
        onClose={() => setSelectedProcesso(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
