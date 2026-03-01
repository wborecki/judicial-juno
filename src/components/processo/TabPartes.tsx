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

interface ParteComAdvogados {
  parte: ProcessoParte;
  advogados: ProcessoParte[];
}

interface PoloGroup {
  partesComAdvogados: ParteComAdvogados[];
  advogadosSemVinculo: ProcessoParte[];
}

export default function TabPartes({ processoId, parteAutoraLegacy, parteReLegacy }: Props) {
  const { data: partes = [], isLoading } = useProcessoPartes(processoId);

  const groups = useMemo(() => {
    const autorPartes: ProcessoParte[] = [];
    const reuPartes: ProcessoParte[] = [];
    const outrosPartes: ProcessoParte[] = [];
    const advAutor: ProcessoParte[] = [];
    const advReu: ProcessoParte[] = [];
    const advOutros: ProcessoParte[] = [];

    partes.forEach(p => {
      switch (p.tipo) {
        case "autor": autorPartes.push(p); break;
        case "advogado_autor": advAutor.push(p); break;
        case "reu": reuPartes.push(p); break;
        case "advogado_reu": advReu.push(p); break;
        case "advogado": advOutros.push(p); break;
        default: outrosPartes.push(p); break;
      }
    });

    const buildGroup = (mainPartes: ProcessoParte[], advogados: ProcessoParte[]): PoloGroup => {
      const partesComAdvogados: ParteComAdvogados[] = mainPartes.map(p => ({
        parte: p,
        advogados: advogados.filter(a => a.representado_id === p.id),
      }));
      const linkedIds = new Set(advogados.filter(a => a.representado_id).map(a => a.representado_id));
      const advogadosSemVinculo = advogados.filter(a => !a.representado_id || !mainPartes.some(p => p.id === a.representado_id));
      return { partesComAdvogados, advogadosSemVinculo };
    };

    return {
      autor: buildGroup(autorPartes, advAutor),
      reu: buildGroup(reuPartes, advReu),
      outros: buildGroup(outrosPartes, advOutros),
    };
  }, [partes]);

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando partes...</p>;

  if (partes.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PoloCard tipo="autor" group={{ partesComAdvogados: [{ parte: { nome: parteAutoraLegacy } as any, advogados: [] }], advogadosSemVinculo: [] }} />
        <PoloCard tipo="reu" group={{ partesComAdvogados: [{ parte: { nome: parteReLegacy } as any, advogados: [] }], advogadosSemVinculo: [] }} />
        <PoloCard tipo="outros" group={{ partesComAdvogados: [], advogadosSemVinculo: [] }} />
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

function PoloCard({ tipo, group }: { tipo: string; group: PoloGroup }) {
  const config = TIPO_PRINCIPAL[tipo] ?? TIPO_PRINCIPAL.outros;
  const Icon = config.icon;
  const total = group.partesComAdvogados.reduce((acc, p) => acc + 1 + p.advogados.length, 0) + group.advogadosSemVinculo.length;
  const isEmpty = group.partesComAdvogados.length === 0 && group.advogadosSemVinculo.length === 0;

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <Icon className={`w-4 h-4 ${config.colorClass}`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{config.label}</span>
        <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 ml-auto">{total}</Badge>
      </div>

      {group.partesComAdvogados.map((item, i) => (
        <div key={item.parte.id ?? i} className="space-y-1">
          <PersonRow nome={item.parte.nome} cpf={item.parte.cpf_cnpj} tipo={item.parte.tipo} />
          {item.advogados.length > 0 && (
            <div className="pl-4 border-l-2 border-border/30 ml-1 space-y-1 mt-1">
              <div className="flex items-center gap-1.5">
                <Scale className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Advogado(s)</span>
              </div>
              {item.advogados.map((a, j) => (
                <PersonRow key={a.id ?? j} nome={a.nome} cpf={a.cpf_cnpj} oab={a.advogado_oab} isAdvogado />
              ))}
            </div>
          )}
          {i < group.partesComAdvogados.length - 1 && <div className="border-t border-border/20 mt-2 pt-1" />}
        </div>
      ))}

      {group.advogadosSemVinculo.length > 0 && (
        <div className="pt-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Advogado(s)</span>
          </div>
          <div className="pl-4 border-l-2 border-border/30 ml-1 space-y-1">
            {group.advogadosSemVinculo.map((a, j) => (
              <PersonRow key={a.id ?? j} nome={a.nome} cpf={a.cpf_cnpj} oab={a.advogado_oab} isAdvogado />
            ))}
          </div>
        </div>
      )}

      {isEmpty && <p className="text-[11px] text-muted-foreground italic py-2">Nenhum cadastrado</p>}
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
      <p className={`text-sm leading-tight ${isAdvogado ? "text-muted-foreground" : "font-medium text-foreground"}`}>{nome}</p>
      <div className="flex items-center gap-2 flex-wrap mt-0.5">
        {cpf && <span className="text-[11px] text-muted-foreground font-mono">{cpf}</span>}
        {oab && <span className="text-[11px] text-muted-foreground">OAB {oab}</span>}
        {tipoLabel && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border/50">{tipoLabel}</Badge>
        )}
      </div>
    </div>
  );
}
