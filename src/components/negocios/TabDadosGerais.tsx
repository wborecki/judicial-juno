import { NegocioWithRelations, useUpdateNegocio } from "@/hooks/useNegocios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useUsuarios } from "@/hooks/useEquipes";
import { usePessoas } from "@/hooks/usePessoas";
import { useNavigate } from "react-router-dom";
import { Link as LinkIcon, User, Briefcase, DollarSign, MessageSquare } from "lucide-react";

const TIPO_SERVICO_OPTIONS = [
  { value: "compra_credito", label: "Compra de Crédito Judicial" },
  { value: "compensacao_tributaria", label: "Compensação Tributária" },
  { value: "honorarios", label: "Honorários" },
  { value: "cessao_direitos", label: "Cessão de Direitos" },
];

interface Props {
  negocio: NegocioWithRelations;
}

export default function TabDadosGerais({ negocio }: Props) {
  const updateNegocio = useUpdateNegocio();
  const { data: usuarios = [] } = useUsuarios();
  const { data: pessoas = [] } = usePessoas();
  const navigate = useNavigate();
  const activeUsers = usuarios.filter(u => u.ativo);

  const saveField = async (field: string, value: any) => {
    try {
      await updateNegocio.mutateAsync({ id: negocio.id, updates: { [field]: value } });
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  return (
    <div className="space-y-4">
      {/* Responsável + Vínculos */}
      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-semibold text-foreground">Responsável & Vínculos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Responsável</p>
            <Select
              value={negocio.responsavel_id || "__none__"}
              onValueChange={(v) => saveField("responsavel_id", v === "__none__" ? null : v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Não atribuído" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Não atribuído</SelectItem>
                {activeUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Pessoa Vinculada</p>
            <Select
              value={negocio.pessoa_id || "__none__"}
              onValueChange={(v) => saveField("pessoa_id", v === "__none__" ? null : v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Nenhuma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {pessoas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome} — {p.cpf_cnpj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Processo Vinculado</p>
            {negocio.processo_id && negocio.processos?.numero_processo ? (
              <button
                onClick={() => navigate(`/processos/${negocio.processo_id}`, { state: { fromPath: `/negocios/${negocio.id}`, fromLabel: negocio.titulo || "Negócio" } })}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline h-8"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="font-mono">{negocio.processos.numero_processo}</span>
              </button>
            ) : (
              <p className="text-xs text-muted-foreground h-8 flex items-center">Nenhum processo vinculado</p>
            )}
          </div>
        </div>
      </div>

      {/* Informações do Negócio */}
      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-semibold text-foreground">Informações do Negócio</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
          <InlineField label="Título" defaultValue={negocio.titulo ?? ""} onSave={(v) => saveField("titulo", v || null)} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Tipo de Serviço</p>
            <Select defaultValue={negocio.tipo_servico ?? ""} onValueChange={(v) => saveField("tipo_servico", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TIPO_SERVICO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Prioridade</p>
            <Select defaultValue={negocio.prioridade} onValueChange={(v) => saveField("prioridade", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-semibold text-foreground">Valores</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
          <InlineNumberField label="Valor Proposta (R$)" defaultValue={negocio.valor_proposta} onSave={(v) => saveField("valor_proposta", v)} />
          <InlineNumberField label="Valor Fechamento (R$)" defaultValue={negocio.valor_fechamento} onSave={(v) => saveField("valor_fechamento", v)} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Data Abertura</p>
            <Input type="date" defaultValue={negocio.data_abertura?.slice(0, 10) ?? ""} className="h-8 text-xs" onBlur={(e) => saveField("data_abertura", e.target.value || null)} />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-semibold text-foreground">Observações</p>
        </div>
        <ObservacoesField defaultValue={negocio.observacoes ?? ""} onSave={(v) => saveField("observacoes", v || null)} />
      </div>
    </div>
  );
}

function InlineField({ label, defaultValue, onSave }: { label: string; defaultValue: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
      <Input value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val)} className="h-8 text-xs" />
    </div>
  );
}

function InlineNumberField({ label, defaultValue, onSave }: { label: string; defaultValue: number | null; onSave: (v: number | null) => void }) {
  const [val, setVal] = useState(defaultValue ?? "");
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
      <Input type="number" value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val === "" ? null : Number(val))} className="h-8 text-xs" step="0.01" />
    </div>
  );
}

function ObservacoesField({ defaultValue, onSave }: { defaultValue: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(defaultValue);
  return <Textarea value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val)} rows={3} className="text-xs" />;
}
