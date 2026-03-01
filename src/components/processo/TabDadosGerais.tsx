import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pencil, Save, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { TRIBUNAIS } from "@/lib/types";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";

const STATUS_LABELS: Record<number, string> = {
  1: "Não Ajuizado",
  2: "Fase de Conhecimento",
  3: "Cumprimento de Sentença",
  4: "Ofício Requisitório",
};

const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente",
  apto: "Apto",
  descartado: "Descartado",
  "reanálise": "Reanálise",
};

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  apto: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
  "reanálise": "bg-info/10 text-info border-info/20",
};

const TRIBUNAL_URLS: Record<string, string> = {
  TRF1: "https://processual.trf1.jus.br/consultaProcessual/processo.php?proc=",
  TRF2: "https://eproc.trf2.jus.br/eproc/externo_controlador.php?acao=processo_consulta&txtValor=",
  TRF3: "https://pje1g.trf3.jus.br/pje/ConsultaPublica/listView.seam?numeroProcesso=",
  TRF4: "https://eproc.trf4.jus.br/eproc2trf4/controlador.php?acao=consulta_processual_resultado_pesquisa&txtValor=",
  TRF5: "https://pje.trf5.jus.br/pje/ConsultaPublica/listView.seam?numeroProcesso=",
  TRF6: "https://pje.trf6.jus.br/pje/ConsultaPublica/listView.seam?numeroProcesso=",
  TJSP: "https://esaj.tjsp.jus.br/cpopg/show.do?processo.numero=",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
};

interface Props {
  processo: Processo;
}

export default function TabDadosGerais({ processo }: Props) {
  const updateProcesso = useUpdateProcesso();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    tribunal: processo.tribunal,
    natureza: processo.natureza,
    tipo_pagamento: processo.tipo_pagamento,
    status_processo: processo.status_processo,
    transito_julgado: processo.transito_julgado,
    valor_estimado: processo.valor_estimado ?? 0,
    data_distribuicao: processo.data_distribuicao ?? "",
    observacoes: processo.observacoes ?? "",
  });

  const startEdit = () => {
    setForm({
      tribunal: processo.tribunal,
      natureza: processo.natureza,
      tipo_pagamento: processo.tipo_pagamento,
      status_processo: processo.status_processo,
      transito_julgado: processo.transito_julgado,
      valor_estimado: processo.valor_estimado ?? 0,
      data_distribuicao: processo.data_distribuicao ?? "",
      observacoes: processo.observacoes ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProcesso.mutateAsync({ id: processo.id, updates: form });
      toast.success("Processo atualizado");
      setEditing(false);
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const triagem = processo.triagem_resultado ?? "pendente";
  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  if (editing) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Editando Dados</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="text-xs gap-1.5">
                <X className="w-3.5 h-3.5" />Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateProcesso.isPending} className="text-xs gap-1.5">
                <Save className="w-3.5 h-3.5" />Salvar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tribunal</Label>
              <Select value={form.tribunal} onValueChange={v => setForm(f => ({ ...f, tribunal: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIBUNAIS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Natureza</Label>
              <Select value={form.natureza} onValueChange={v => setForm(f => ({ ...f, natureza: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Cível", "Trabalhista", "Federal", "Previdenciário", "Tributário"].map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo Pagamento</Label>
              <Select value={form.tipo_pagamento} onValueChange={v => setForm(f => ({ ...f, tipo_pagamento: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RPV">RPV</SelectItem>
                  <SelectItem value="Precatório">Precatório</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={String(form.status_processo)} onValueChange={v => setForm(f => ({ ...f, status_processo: Number(v) }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor Estimado</Label>
              <Input type="number" className="h-8 text-xs" value={form.valor_estimado}
                onChange={e => setForm(f => ({ ...f, valor_estimado: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data Distribuição</Label>
              <Input type="date" className="h-8 text-xs" value={form.data_distribuicao}
                onChange={e => setForm(f => ({ ...f, data_distribuicao: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Switch checked={form.transito_julgado} onCheckedChange={v => setForm(f => ({ ...f, transito_julgado: v }))} />
              <Label className="text-xs">Trânsito em Julgado</Label>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea className="text-xs resize-none h-20" value={form.observacoes}
              onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-mono text-lg font-bold tracking-tight">{processo.numero_processo}</h1>
                {tribunalUrl && (
                  <a href={tribunalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <Badge className={TRIAGEM_COLORS[triagem]}>{TRIAGEM_LABELS[triagem]}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium text-foreground bg-primary/5 px-2 py-0.5 rounded">{processo.tribunal}</span>
                <span>{processo.natureza}</span>
                <span>{processo.tipo_pagamento}</span>
                <span>S{processo.status_processo} — {STATUS_LABELS[processo.status_processo]}</span>
                <span>Trânsito: {processo.transito_julgado ? "✓ Sim" : "Não"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Valor Estimado</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(processo.valor_estimado)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={startEdit} className="text-xs gap-1.5">
                <Pencil className="w-3.5 h-3.5" />Editar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <InfoItem label="Captação" value={formatDate(processo.data_captacao)} />
        <InfoItem label="Distribuição" value={formatDate(processo.data_distribuicao)} />
        <InfoItem label="Triagem" value={formatDate(processo.triagem_data)} />
        <InfoItem label="Precificação" value={formatDate(processo.precificacao_data)} />
      </div>

      {processo.observacoes && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Observações</p>
            <p className="text-sm">{processo.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-3">
        <p className="text-muted-foreground text-[11px]">{label}</p>
        <p className="font-medium">{value}</p>
      </CardContent>
    </Card>
  );
}
