import { useState } from "react";
import { useDocumentoModelos, type DocumentoModelo } from "@/hooks/useDocumentoModelos";
import { useCreateEnvio, useCreateSignatario, useCallClickSign } from "@/hooks/useDocumentoEnvios";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X, Send, FileText, Users } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  negocioId: string;
  processoId?: string | null;
  contratoId?: string | null;
}

interface Signatario {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  papel: string;
}

const PAPEL_OPTIONS = [
  { value: "sign", label: "Assinar" },
  { value: "approve", label: "Aprovar" },
  { value: "witness", label: "Testemunha" },
];

export default function EnviarAssinaturaSheet({ open, onOpenChange, negocioId, processoId, contratoId }: Props) {
  const { data: modelos = [] } = useDocumentoModelos();
  const createEnvio = useCreateEnvio();
  const createSignatario = useCreateSignatario();
  const callClickSign = useCallClickSign();

  const [step, setStep] = useState<"modelo" | "variaveis" | "signatarios">("modelo");
  const [selectedModelo, setSelectedModelo] = useState<DocumentoModelo | null>(null);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [signatarios, setSignatarios] = useState<Signatario[]>([{ nome: "", email: "", cpf: "", telefone: "", papel: "sign" }]);
  const [sending, setSending] = useState(false);

  const activeModelos = modelos.filter(m => m.ativo);

  const handleSelectModelo = (modeloId: string) => {
    const m = activeModelos.find(x => x.id === modeloId);
    if (!m) return;
    setSelectedModelo(m);
    const vals: Record<string, string> = {};
    (m.variaveis || []).forEach(v => { vals[v.nome] = ""; });
    setVarValues(vals);
    setStep(m.variaveis.length > 0 ? "variaveis" : "signatarios");
  };

  const addSignatario = () => {
    setSignatarios(s => [...s, { nome: "", email: "", cpf: "", telefone: "", papel: "sign" }]);
  };

  const removeSignatario = (idx: number) => {
    setSignatarios(s => s.filter((_, i) => i !== idx));
  };

  const updateSignatario = (idx: number, key: keyof Signatario, value: string) => {
    setSignatarios(s => s.map((sig, i) => i === idx ? { ...sig, [key]: value } : sig));
  };

  const handleSend = async () => {
    if (!selectedModelo) return;
    const validSigs = signatarios.filter(s => s.nome && s.email);
    if (validSigs.length === 0) {
      toast.error("Adicione ao menos um signatário com nome e email");
      return;
    }

    setSending(true);
    try {
      // 1. Create envelope
      const envelopeRes = await callClickSign.mutateAsync({
        action: "create-envelope",
        name: selectedModelo.nome,
      });
      const envelopeId = envelopeRes?.envelope?.id || envelopeRes?.data?.id;
      if (!envelopeId) throw new Error("Falha ao criar envelope");

      // 2. Create document from template
      let documentKey = null;
      if (selectedModelo.clicksign_template_key) {
        const docRes = await callClickSign.mutateAsync({
          action: "create-from-template",
          envelope_id: envelopeId,
          template_key: selectedModelo.clicksign_template_key,
          template_data: varValues,
        });
        documentKey = docRes?.document?.key || docRes?.data?.key;
      }

      // 3. Add signers
      const signerKeys: string[] = [];
      for (const sig of validSigs) {
        const sigRes = await callClickSign.mutateAsync({
          action: "add-signer",
          envelope_id: envelopeId,
          name: sig.nome,
          email: sig.email,
          cpf: sig.cpf || undefined,
          phone: sig.telefone || undefined,
          papel: sig.papel,
        });
        const signerKey = sigRes?.signer?.key || sigRes?.data?.key;
        signerKeys.push(signerKey || "");
      }

      // 4. Activate envelope
      await callClickSign.mutateAsync({
        action: "activate-envelope",
        envelope_id: envelopeId,
      });

      // 5. Save to database
      const envioData = await createEnvio.mutateAsync({
        modelo_id: selectedModelo.id,
        negocio_id: negocioId,
        processo_id: processoId || null,
        contrato_id: contratoId || null,
        clicksign_envelope_id: envelopeId,
        clicksign_document_key: documentKey,
        status: "enviado",
        dados_variaveis: varValues,
      });

      // 6. Save signatários
      for (let i = 0; i < validSigs.length; i++) {
        await createSignatario.mutateAsync({
          envio_id: (envioData as any).id,
          nome: validSigs[i].nome,
          email: validSigs[i].email,
          cpf: validSigs[i].cpf || null,
          telefone: validSigs[i].telefone || null,
          papel: validSigs[i].papel,
          clicksign_signer_key: signerKeys[i] || null,
        });
      }

      toast.success("Documento enviado para assinatura!");
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao enviar para assinatura");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setStep("modelo");
    setSelectedModelo(null);
    setVarValues({});
    setSignatarios([{ nome: "", email: "", cpf: "", telefone: "", papel: "sign" }]);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Send className="w-4 h-4" /> Enviar para Assinatura
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant={step === "modelo" ? "default" : "secondary"} className="text-[10px]">1. Modelo</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={step === "variaveis" ? "default" : "secondary"} className="text-[10px]">2. Variáveis</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={step === "signatarios" ? "default" : "secondary"} className="text-[10px]">3. Signatários</Badge>
          </div>

          {/* Step 1: Select template */}
          {step === "modelo" && (
            <div className="space-y-3">
              <Label className="text-xs">Selecione o modelo do documento</Label>
              {activeModelos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Nenhum modelo disponível.</p>
                  <p className="text-[10px]">Crie modelos em Configurações → Modelos de Documentos.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeModelos.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModelo(m.id)}
                      className="w-full text-left border rounded-lg p-3 hover:bg-muted/30 transition-colors flex items-start gap-3"
                    >
                      <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{m.nome}</p>
                        {m.descricao && <p className="text-xs text-muted-foreground mt-0.5">{m.descricao}</p>}
                        {m.variaveis.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {m.variaveis.map((v, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                                {`{{${v.nome}}}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Fill variables */}
          {step === "variaveis" && selectedModelo && (
            <div className="space-y-3">
              <Label className="text-xs">Preencha as variáveis do documento</Label>
              {selectedModelo.variaveis.map(v => (
                <div key={v.nome} className="space-y-1">
                  <Label className="text-xs font-mono text-primary">{`{{${v.nome}}}`}</Label>
                  <Input
                    type={v.tipo === "data" ? "date" : v.tipo === "moeda" || v.tipo === "numero" ? "number" : "text"}
                    value={varValues[v.nome] || ""}
                    onChange={e => setVarValues(prev => ({ ...prev, [v.nome]: e.target.value }))}
                    placeholder={v.nome}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep("modelo")}>Voltar</Button>
                <Button size="sm" onClick={() => setStep("signatarios")}>Próximo</Button>
              </div>
            </div>
          )}

          {/* Step 3: Signatários */}
          {step === "signatarios" && (
            <div className="space-y-3">
              <Label className="text-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Signatários
              </Label>
              {signatarios.map((sig, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2 relative">
                  {signatarios.length > 1 && (
                    <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeSignatario(i)}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Nome *</Label>
                      <Input value={sig.nome} onChange={e => updateSignatario(i, "nome", e.target.value)} placeholder="Nome completo" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Email *</Label>
                      <Input type="email" value={sig.email} onChange={e => updateSignatario(i, "email", e.target.value)} placeholder="email@exemplo.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">CPF</Label>
                      <Input value={sig.cpf} onChange={e => updateSignatario(i, "cpf", e.target.value)} placeholder="000.000.000-00" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Telefone</Label>
                      <Input value={sig.telefone} onChange={e => updateSignatario(i, "telefone", e.target.value)} placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Papel</Label>
                      <Select value={sig.papel} onValueChange={v => updateSignatario(i, "papel", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAPEL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={addSignatario}>
                <Plus className="w-3 h-3" /> Adicionar Signatário
              </Button>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep(selectedModelo?.variaveis.length ? "variaveis" : "modelo")}>Voltar</Button>
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild><Button variant="outline">Cancelar</Button></SheetClose>
          {step === "signatarios" && (
            <Button onClick={handleSend} disabled={sending} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {sending ? "Enviando..." : "Enviar para Assinatura"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
