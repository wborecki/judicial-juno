import { useState, useMemo } from "react";
import { ProcessoLead } from "@/lib/types";
import { mockProcessos } from "@/lib/mock-data";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsCards } from "@/components/StatsCards";
import { ProcessTable } from "@/components/ProcessTable";
import { TriageModal } from "@/components/TriageModal";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [processos, setProcessos] = useState<ProcessoLead[]>(mockProcessos);
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoLead | null>(null);

  const counts = useMemo(() => ({
    todos: processos.length,
    pendente: processos.filter(p => p.triagem === "pendente").length,
    convertido: processos.filter(p => p.triagem === "convertido").length,
    descartado: processos.filter(p => p.triagem === "descartado").length,
    em_acompanhamento: processos.filter(p => p.triagem === "em_acompanhamento").length,
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
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

      <main className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
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

          <StatsCards counts={counts} total={processos.length} />

          <ProcessTable processos={filtered} onSelect={setSelectedProcesso} />
        </div>
      </main>

      <TriageModal
        processo={selectedProcesso}
        open={!!selectedProcesso}
        onClose={() => setSelectedProcesso(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default Index;
