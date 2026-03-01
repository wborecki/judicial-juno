import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check, Briefcase, MoreHorizontal, Pencil, RefreshCw, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useCreateNegocio } from "@/hooks/useNegocios";
import { useNavigate } from "react-router-dom";

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  apto: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
  "reanálise": "bg-info/10 text-info border-info/20",
};
const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente", apto: "Apto", descartado: "Descartado", "reanálise": "Reanálise",
};

const TRIBUNAL_URLS: Record<string, string> = {
  "TRF-1": "https://processual.trf1.jus.br/consultaProcessual/processo.php?proc=",
  "TRF-2": "https://eproc.trf2.jus.br/eproc/externo_controlador.php?acao=processo_consulta&txtValor=",
  "TRF-3": "https://pje1g.trf3.jus.br/pje/ConsultaPublica/listView.seam?numeroProcesso=",
  "TRT-1": "https://pje.trt1.jus.br/consultaprocessual/pages/consultas/ConsultaProcessual.seam?numeroProcesso=",
  TJSP: "https://esaj.tjsp.jus.br/cpopg/show.do?processo.numero=",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

interface Props {
  processo: Processo;
}

export default function ProcessoHeader({ processo }: Props) {
  const navigate = useNavigate();
  const updateProcesso = useUpdateProcesso();
  const createNegocio = useCreateNegocio();
  const [copied, setCopied] = useState(false);
  const [editValorOpen, setEditValorOpen] = useState(false);
  const [valorEdit, setValorEdit] = useState(processo.valor_estimado ?? 0);

  const triagem = processo.triagem_resultado ?? "pendente";

  const handleCopyCNJ = async () => {
    await navigator.clipboard.writeText(processo.numero_processo);
    setCopied(true);
    toast.success("CNJ copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveValor = async () => {
    try {
      await updateProcesso.mutateAsync({ id: processo.id, updates: { valor_estimado: valorEdit } });
      toast.success("Valor atualizado");
      setEditValorOpen(false);
    } catch {
      toast.error("Erro ao atualizar valor");
    }
  };

  const handleCriarNegocio = async () => {
    try {
      await createNegocio.mutateAsync({
        processo_id: processo.id,
        pessoa_id: processo.pessoa_id,
        tipo_servico: "compra_credito",
        negocio_status: "em_andamento",
        valor_proposta: processo.valor_estimado,
        valor_fechamento: null,
        data_abertura: new Date().toISOString(),
        data_fechamento: null,
        responsavel_id: null,
        observacoes: null,
      });
      toast.success("Negócio criado com sucesso!");
    } catch {
      toast.error("Erro ao criar negócio");
    }
  };

  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  return (
    <>
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/processos")} className="text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" />Voltar
        </Button>

        <div className="bg-card border border-border/40 rounded-xl p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          {/* Row 1: CNJ + Actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-base font-bold tracking-tight">{processo.numero_processo}</h1>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleCopyCNJ}>
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                {tribunalUrl && (
                  <a href={tribunalUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
              </div>

              {/* Badges row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-medium">{processo.tribunal}</Badge>
                <Badge variant="outline" className="text-[10px]">{processo.natureza}</Badge>
                <Badge variant="outline" className="text-[10px]">{processo.tipo_pagamento}</Badge>
                {processo.classe_fase && (
                  <Badge variant="outline" className="text-[10px]">{processo.classe_fase}</Badge>
                )}
                <Badge
                  variant="outline"
                  className={`text-[10px] ${processo.transito_julgado ? "border-success/30 text-success" : "border-muted-foreground/30 text-muted-foreground"}`}
                >
                  Trânsito: {processo.transito_julgado ? "Sim" : "Não"}
                </Badge>
                {processo.vara_comarca && (
                  <span className="text-[10px] text-muted-foreground">{processo.vara_comarca}</span>
                )}
              </div>
            </div>

            {/* Right: Value + Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right mr-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor Estimado</p>
                <p className="text-sm font-bold">{formatCurrency(processo.valor_estimado)}</p>
              </div>

              <Badge className={`text-[10px] ${TRIAGEM_COLORS[triagem]}`}>
                {TRIAGEM_LABELS[triagem]}
              </Badge>

              {triagem === "apto" && (
                <Button size="sm" onClick={handleCriarNegocio} disabled={createNegocio.isPending} className="text-xs gap-1.5 h-8">
                  <Briefcase className="w-3.5 h-3.5" />Criar Negócio
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setValorEdit(processo.valor_estimado ?? 0); setEditValorOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 mr-2" />Editar Valor Estimado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Sincronização não implementada")}>
                    <RefreshCw className="w-3.5 h-3.5 mr-2" />Sincronizar Dados
                  </DropdownMenuItem>
                  {tribunalUrl && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a href={tribunalUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5 mr-2" />Ver no Tribunal
                        </a>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Edit valor dialog */}
      <Dialog open={editValorOpen} onOpenChange={setEditValorOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Editar Valor Estimado</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Valor (R$)</Label>
            <Input
              type="number"
              value={valorEdit}
              onChange={e => setValorEdit(Number(e.target.value))}
              className="h-9 text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditValorOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={handleSaveValor} disabled={updateProcesso.isPending} className="text-xs">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
