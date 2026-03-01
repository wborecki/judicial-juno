import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Scale, Users } from "lucide-react";
import { useProcessoPartes, ProcessoParte } from "@/hooks/useProcessoPartes";

interface Props {
  processoId: string;
  parteAutoraLegacy: string;
  parteReLegacy: string;
}

const TIPO_PRINCIPAL: Record<string, { label: string; icon: typeof User; colorClass: string }> = {
  autor: { label: "Polo Ativo (Autor)", icon: User, colorClass: "text-primary" },
  reu: { label: "Polo Passivo (Réu)", icon: Building2, colorClass: "text-warning" },
  outros: { label: "Outros Participantes", icon: Users, colorClass: "text-muted-foreground" },
};

interface ParteGroup {
  partes: ProcessoParte[];
  advogados: ProcessoParte[];
}

export default function TabPartes({ processoId, parteAutoraLegacy, parteReLegacy }: Props) {
  const { data: partes = [], isLoading } = useProcessoPartes(processoId);

  const groups = useMemo(() => {
    const autor: ParteGroup = { partes: [], advogados: [] };
    const reu: ParteGroup = { partes: [], advogados: [] };
    const outros: ParteGroup = { partes: [], advogados: [] };

    partes.forEach(p => {
      switch (p.tipo) {
        case "autor": autor.partes.push(p); break;
        case "advogado_autor": autor.advogados.push(p); break;
        case "reu": reu.partes.push(p); break;
        case "advogado_reu": reu.advogados.push(p); break;
        case "advogado": outros.advogados.push(p); break;
        default: outros.partes.push(p); break;
      }
    });

    return { autor, reu, outros };
  }, [partes]);

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando partes...</p>;

  // Legacy fallback
  if (partes.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PoloCard tipo="autor" group={{ partes: [{ nome: parteAutoraLegacy } as any], advogados: [] }} />
        <PoloCard tipo="reu" group={{ partes: [{ nome: parteReLegacy } as any], advogados: [] }} />
        <PoloCard tipo="outros" group={{ partes: [], advogados: [] }} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PoloCard tipo="autor" group={groups.autor} />
      <PoloCard tipo="reu" group={groups.reu} />
      <PoloCard tipo="outros" group={groups.outros} />
    </div>
  );
}

function PoloCard({ tipo, group }: { tipo: string; group: ParteGroup }) {
  const config = TIPO_PRINCIPAL[tipo] ?? TIPO_PRINCIPAL.outros;
  const Icon = config.icon;
  const total = group.partes.length + group.advogados.length;

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <Icon className={`w-4 h-4 ${config.colorClass}`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{config.label}</span>
        <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 ml-auto">{total}</Badge>
      </div>

      {/* Main parties */}
      {group.partes.length > 0 && (
        <div className="space-y-2.5">
          {group.partes.map((p, i) => (
            <PersonRow key={p.id ?? i} nome={p.nome} cpf={p.cpf_cnpj} tipo={p.tipo} />
          ))}
        </div>
      )}

      {/* Advogados */}
      {group.advogados.length > 0 && (
        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Advogado(s)
            </span>
          </div>
          <div className="pl-3 border-l-2 border-border/30 space-y-2">
            {group.advogados.map((p, i) => (
              <PersonRow key={p.id ?? i} nome={p.nome} cpf={p.cpf_cnpj} oab={p.advogado_oab} isAdvogado />
            ))}
          </div>
        </div>
      )}

      {group.partes.length === 0 && group.advogados.length === 0 && (
        <p className="text-[11px] text-muted-foreground italic py-2">Nenhum cadastrado</p>
      )}
    </div>
  );
}

const TIPO_LABELS: Record<string, string> = {
  perito: "Perito Judicial",
  assistente_tecnico: "Assistente Técnico",
  testemunha: "Testemunha",
  terceiro: "Terceiro Interessado",
};

function PersonRow({ nome, cpf, oab, isAdvogado, tipo }: { nome: string; cpf?: string | null; oab?: string | null; isAdvogado?: boolean; tipo?: string }) {
  const tipoLabel = tipo && TIPO_LABELS[tipo];

  return (
    <div className="py-1">
      <p className={`text-sm leading-tight ${isAdvogado ? "text-muted-foreground" : "font-medium text-foreground"}`}>
        {nome}
      </p>
      <div className="flex items-center gap-2 flex-wrap mt-0.5">
        {cpf && <span className="text-[11px] text-muted-foreground font-mono">{cpf}</span>}
        {oab && <span className="text-[11px] text-muted-foreground">OAB {oab}</span>}
        {tipoLabel && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border/50">
            {tipoLabel}
          </Badge>
        )}
      </div>
    </div>
  );
}
