import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Scale } from "lucide-react";
import { useProcessoPartes } from "@/hooks/useProcessoPartes";

interface Props {
  processoId: string;
  parteAutoraLegacy: string;
  parteReLegacy: string;
}

const TIPO_CONFIG: Record<string, { label: string; icon: typeof User; colorClass: string }> = {
  autor: { label: "Autor", icon: User, colorClass: "text-primary" },
  reu: { label: "Réu", icon: Building2, colorClass: "text-warning" },
  advogado: { label: "Advogado", icon: Scale, colorClass: "text-muted-foreground" },
};

export default function TabPartes({ processoId, parteAutoraLegacy, parteReLegacy }: Props) {
  const { data: partes = [], isLoading } = useProcessoPartes(processoId);

  const groups = useMemo(() => {
    const autores = partes.filter(p => p.tipo === "autor");
    const reus = partes.filter(p => p.tipo === "reu");
    const advogados = partes.filter(p => p.tipo === "advogado");
    const outros = partes.filter(p => !["autor", "reu", "advogado"].includes(p.tipo));
    return { autores, reus, advogados, outros };
  }, [partes]);

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando partes...</p>;

  // If no structured parties, show legacy
  if (partes.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ParteCard tipo="autor" items={[{ nome: parteAutoraLegacy, cpf: null, oab: null }]} />
        <ParteCard tipo="reu" items={[{ nome: parteReLegacy, cpf: null, oab: null }]} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.autores.length > 0 && (
        <ParteCard
          tipo="autor"
          items={groups.autores.map(p => ({ nome: p.nome, cpf: p.cpf_cnpj, oab: p.advogado_oab }))}
        />
      )}
      {groups.reus.length > 0 && (
        <ParteCard
          tipo="reu"
          items={groups.reus.map(p => ({ nome: p.nome, cpf: p.cpf_cnpj, oab: p.advogado_oab }))}
        />
      )}
      {groups.advogados.length > 0 && (
        <ParteCard
          tipo="advogado"
          items={groups.advogados.map(p => ({ nome: p.nome, cpf: p.cpf_cnpj, oab: p.advogado_oab }))}
        />
      )}
      {groups.outros.length > 0 && (
        <ParteCard
          tipo="outros"
          items={groups.outros.map(p => ({ nome: p.nome, cpf: p.cpf_cnpj, oab: p.advogado_oab }))}
        />
      )}
    </div>
  );
}

interface ParteItem {
  nome: string;
  cpf: string | null;
  oab: string | null;
}

function ParteCard({ tipo, items }: { tipo: string; items: ParteItem[] }) {
  const config = TIPO_CONFIG[tipo] ?? { label: tipo, icon: User, colorClass: "text-muted-foreground" };
  const Icon = config.icon;

  return (
    <div className="bg-muted/30 border border-border/40 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.colorClass}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{config.label}</span>
        <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 ml-auto">{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/20 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{item.nome}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {item.cpf && <span className="text-[11px] text-muted-foreground font-mono">{item.cpf}</span>}
                {item.oab && <span className="text-[11px] text-muted-foreground">OAB {item.oab}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
