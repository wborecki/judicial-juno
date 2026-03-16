import { useState } from "react";
import { useDocumentoEnvios, useCallClickSign, useUpdateEnvio, type DocumentoEnvio } from "@/hooks/useDocumentoEnvios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileSignature, RefreshCw, XCircle, Eye, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { format } from "date-fns";
import EnviarAssinaturaSheet from "./EnviarAssinaturaSheet";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  rascunho: { label: "Rascunho", className: "bg-muted text-muted-foreground", icon: Clock },
  enviado: { label: "Enviado", className: "bg-info/10 text-info", icon: Send },
  assinado: { label: "Assinado", className: "bg-success/10 text-success", icon: CheckCircle2 },
  recusado: { label: "Recusado", className: "bg-destructive/10 text-destructive", icon: AlertCircle },
  cancelado: { label: "Cancelado", className: "bg-muted text-muted-foreground", icon: XCircle },
};

const SIG_STATUS: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning/10 text-warning" },
  assinado: { label: "Assinado", className: "bg-success/10 text-success" },
  recusado: { label: "Recusado", className: "bg-destructive/10 text-destructive" },
};

interface Props {
  negocioId: string;
  processoId?: string | null;
}

export default function TabAssinaturas({ negocioId, processoId }: Props) {
  const { data: envios = [], isLoading } = useDocumentoEnvios(negocioId);
  const callClickSign = useCallClickSign();
  const updateEnvio = useUpdateEnvio();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRefreshStatus = async (envio: DocumentoEnvio) => {
    if (!envio.clicksign_envelope_id) return;
    try {
      const res = await callClickSign.mutateAsync({
        action: "get-envelope-status",
        envelope_id: envio.clicksign_envelope_id,
      });
      const envelopeStatus = res?.envelope?.status || res?.data?.status;
      let mappedStatus = envio.status;
      if (envelopeStatus === "closed" || envelopeStatus === "finished") mappedStatus = "assinado";
      else if (envelopeStatus === "canceled") mappedStatus = "cancelado";
      else if (envelopeStatus === "running") mappedStatus = "enviado";

      await updateEnvio.mutateAsync({ id: envio.id, status: mappedStatus });
      toast.success("Status atualizado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar status");
    }
  };

  const handleCancel = async (envio: DocumentoEnvio) => {
    if (!envio.clicksign_envelope_id) return;
    try {
      await callClickSign.mutateAsync({
        action: "cancel-envelope",
        envelope_id: envio.clicksign_envelope_id,
      });
      await updateEnvio.mutateAsync({ id: envio.id, status: "cancelado" });
      toast.success("Envio cancelado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar");
    }
  };

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{envios.length} envio(s) para assinatura</p>
        <Button size="sm" onClick={() => setSheetOpen(true)} className="text-xs gap-1.5">
          <FileSignature className="w-3.5 h-3.5" /> Nova Assinatura
        </Button>
      </div>

      {envios.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhum documento enviado para assinatura.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {envios.map(envio => {
            const config = STATUS_CONFIG[envio.status] || STATUS_CONFIG.rascunho;
            const Icon = config.icon;
            return (
              <div key={envio.id} className="border rounded-xl p-4 space-y-3 hover:bg-muted/10 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {envio.documento_modelos?.nome || "Documento"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Enviado em {format(new Date(envio.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] ${config.className}`}>{config.label}</Badge>
                </div>

                {/* Signatários */}
                {envio.documento_envio_signatarios && envio.documento_envio_signatarios.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Signatários</p>
                    {envio.documento_envio_signatarios.map(sig => {
                      const sigConf = SIG_STATUS[sig.status] || SIG_STATUS.pendente;
                      return (
                        <div key={sig.id} className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{sig.nome}</span>
                          <span className="text-muted-foreground">{sig.email}</span>
                          <Badge className={`text-[9px] ml-auto ${sigConf.className}`}>{sigConf.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                {(envio.status === "enviado" || envio.status === "rascunho") && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => handleRefreshStatus(envio)} disabled={callClickSign.isPending}>
                      <RefreshCw className={`w-3 h-3 ${callClickSign.isPending ? "animate-spin" : ""}`} />
                      Atualizar Status
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs gap-1 text-destructive" onClick={() => handleCancel(envio)} disabled={callClickSign.isPending}>
                      <XCircle className="w-3 h-3" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <EnviarAssinaturaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        negocioId={negocioId}
        processoId={processoId}
      />
    </div>
  );
}
