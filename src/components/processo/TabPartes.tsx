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
  outros: { label: "Outros", icon: Users, colorClass: "text-muted-foreground" },
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PoloCard
          tipo="autor"
          group={{ partes: [{ nome: parteAutoraLegacy }] as any, advogados: [] }}
        />
        <PoloCard
          tipo="reu"
          group={{ partes: [{ nome: parteReLegacy }] as any, advogados: [] }}
        />
      </div>
    );
  }

  const hasAutor = groups.autor.partes.length > 0 || groups.autor.advogados.length > 0;
  const hasReu = groups.reu.partes.length > 0 || groups.reu.advogados.length > 0;
  const hasOutros = groups.outros.partes.length > 0 || groups.outros.advogados.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hasAutor && <PoloCard tipo="autor" group={groups.autor} />}
      {hasReu && <PoloCard tipo="reu" group={groups.reu} />}
      {hasOutros && <PoloCard tipo="outros" group={groups.outros} />}
    </div>
  );
}

function PoloCard({ tipo, group }: { tipo: string; group: ParteGroup }) {
  const config = TIPO_PRINCIPAL[tipo] ?? TIPO_PRINCIPAL.outros;
  const Icon = config.icon;
  const total = group.partes.length + group.advogados.length;

  return (
    <div className="bg-muted/30 border border-border/40 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.colorClass}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{config.label}</span>
        <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 ml-auto">{total}</Badge>
      </div>

      {/* Main parties */}
      {group.partes.length > 0 && (
        <div className="space-y-1.5">
          {group.partes.map((p, i) => (
            <PersonRow key={p.id ?? i} nome={p.nome} cpf={p.cpf_cnpj} oab={p.advogado_oab} />
          ))}
        </div>
      )}

      {/* Advogados */}
      {group.advogados.length > 0 && (
        <div className="border-t border-border/20 pt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Scale className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {tipo === "outros" ? "Advogados" : `Advogado(s)`}
            </span>
          </div>
          {group.advogados.map((p, i) => (
            <PersonRow key={p.id ?? i} nome={p.nome} cpf={p.cpf_cnpj} oab={p.advogado_oab} isAdvogado />
          ))}
        </div>
      )}

      {group.partes.length === 0 && group.advogados.length === 0 && (
        <p className="text-[11px] text-muted-foreground italic">Nenhum cadastrado</p>
      )}
    </div>
  );
}

function PersonRow({ nome, cpf, oab, isAdvogado }: { nome: string; cpf?: string | null; oab?: string | null; isAdvogado?: boolean }) {
  return (
    <div className={`flex items-start gap-2 py-1.5 ${isAdvogado ? "pl-2" : ""}`}>
      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${isAdvogado ? "text-muted-foreground" : "font-medium"}`}>{nome}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {cpf && <span className="text-[11px] text-muted-foreground font-mono">{cpf}</span>}
          {oab && <span className="text-[11px] text-muted-foreground">OAB {oab}</span>}
        </div>
      </div>
    </div>
  );
}
