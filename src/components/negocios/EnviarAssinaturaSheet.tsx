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
import { Plus, X, Send, FileText, Users, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";

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

type Step = "modelo" | "variaveis" | "signatarios" | "revisao";

export default function EnviarAssinaturaSheet({ open, onOpenChange, negocioId, processoId, contratoId }: Props) {
  const { data: modelos = [] } = useDocumentoModelos();
  const createEnvio = useCreateEnvio();
  const createSignatario = useCreateSignatario();
  const callClickSign = useCallClickSign();

  const [step, setStep] = useState<Step>("modelo");
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

  const validSigs = signatarios.filter(s => s.nome && s.email);
  const emptyVars = selectedModelo?.variaveis.filter(v => !varValues[v.nome]?.trim()) || [];
  const hasReviewIssues = validSigs.length === 0 || emptyVars.length > 0;

  const handleSend = async () => {
    if (!selectedModelo) return;
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
      const envelopeId = envelopeRes?.data?.id;
      if (!envelopeId) throw new Error("Falha ao criar envelope");

      // 2. Create document from template
      let documentKey: string | null = null;
      if (selectedModelo.clicksign_template_key) {
        const docRes = await callClickSign.mutateAsync({
          action: "create-from-template",
          envelope_id: envelopeId,
          template_key: selectedModelo.clicksign_template_key,
          template_data: varValues,
        });
        documentKey = docRes?.data?.id || null;
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
        signerKeys.push(sigRes?.data?.id || "");
      }

      // 4. Add requirements (link each signer to the document)
      if (documentKey) {
        for (const signerKey of signerKeys) {
          if (signerKey) {
            await callClickSign.mutateAsync({
              action: "add-requirement",
              envelope_id: envelopeId,
              document_key: documentKey,
              signer_key: signerKey,
            });
          }
        }
      }

      // 5. Activate envelope
      await callClickSign.mutateAsync({
        action: "activate-envelope",
        envelope_id: envelopeId,
      });

      // 6. Send notifications
      await callClickSign.mutateAsync({
        action: "send-notifications",
        envelope_id: envelopeId,
      });

      // 7. Save to database
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

      // 8. Save signatários
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

  const goToReview = () => {
    if (validSigs.length === 0) {
      toast.error("Adicione ao menos um signatário com nome e email");
      return;
    }
    setStep("revisao");
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
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <Badge variant={step === "modelo" ? "default" : "secondary"} className="text-[10px]">1. Modelo</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={step === "variaveis" ? "default" : "secondary"} className="text-[10px]">2. Variáveis</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={step === "signatarios" ? "default" : "secondary"} className="text-[10px]">3. Signatários</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={step === "revisao" ? "default" : "secondary"} className="text-[10px]">4. Revisão</Badge>
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
                <Button size="sm" onClick={goToReview} className="gap-1.5">
                  <Eye className="w-3 h-3" /> Revisar
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Revisão */}
          {step === "revisao" && selectedModelo && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Modelo</h4>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{selectedModelo.nome}</span>
                  {selectedModelo.clicksign_template_key && (
                    <Badge variant="outline" className="text-[10px]">ClickSign</Badge>
                  )}
                </div>
              </div>

              {selectedModelo.variaveis.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variáveis</h4>
                  <div className="space-y-1.5">
                    {selectedModelo.variaveis.map(v => (
                      <div key={v.nome} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">{`{{${v.nome}}}`}</span>
                        {varValues[v.nome]?.trim() ? (
                          <span className="font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {varValues[v.nome]}
                          </span>
                        ) : (
                          <span className="text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Vazio
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Signatários ({validSigs.length})
                </h4>
                {validSigs.length === 0 ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Nenhum signatário válido
                  </p>
                ) : (
                  <div className="space-y-2">
                    {validSigs.map((sig, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs bg-muted/30 rounded-lg px-3 py-2">
                        <div className="flex-1">
                          <p className="font-medium">{sig.nome}</p>
                          <p className="text-muted-foreground">{sig.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {PAPEL_OPTIONS.find(o => o.value === sig.papel)?.label || sig.papel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {hasReviewIssues && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    {validSigs.length === 0 && <p>Adicione ao menos um signatário com nome e email.</p>}
                    {emptyVars.length > 0 && (
                      <p>Variáveis não preenchidas: {emptyVars.map(v => v.nome).join(", ")}. O documento será enviado com esses campos vazios.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep("signatarios")}>Voltar</Button>
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild><Button variant="outline">Cancelar</Button></SheetClose>
          {step === "revisao" && (
            <Button onClick={handleSend} disabled={sending || validSigs.length === 0} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {sending ? "Enviando..." : "Enviar para Assinatura"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
