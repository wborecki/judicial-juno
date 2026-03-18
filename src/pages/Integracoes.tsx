import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plug, Calendar, RefreshCw, ExternalLink, Unplug, FileSignature, CheckCircle2, XCircle, Webhook, Plus, Pencil, Trash2, Play } from "lucide-react";
import { useCallClickSign } from "@/hooks/useDocumentoEnvios";
import { useGoogleToken, useGoogleCalendarAuth, useGoogleCalendarSync, useDisconnectGoogle, useToggleGoogleSync } from "@/hooks/useGoogleCalendar";
import { useN8nWebhooks, useUpdateN8nWebhook, useDeleteN8nWebhook, useDispararWebhook, EVENTOS_DISPONIVEIS, type N8nWebhook } from "@/hooks/useN8nWebhooks";
import N8nWebhookSheet from "@/components/integracoes/N8nWebhookSheet";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function ClickSignCard() {
  const callClickSign = useCallClickSign();
  const [status, setStatus] = useState<"idle" | "checking" | "connected" | "error">("idle");

  const handleTestConnection = async () => {
    setStatus("checking");
    try {
      await callClickSign.mutateAsync({ action: "test-connection" });
      setStatus("connected");
      toast.success("ClickSign conectado!");
    } catch {
      setStatus("error");
      toast.error("Falha ao conectar com ClickSign");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileSignature className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">ClickSign</CardTitle>
          <CardDescription className="text-xs">Envio de documentos para assinatura eletrônica</CardDescription>
        </div>
        <Badge variant={status === "connected" ? "default" : "secondary"} className="text-[10px]">
          {status === "connected" ? "Conectado" : status === "error" ? "Erro" : "Não verificado"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleTestConnection} disabled={status === "checking"}>
          {status === "checking" ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verificando...</>
          ) : status === "connected" ? (
            <><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Conexão verificada</>
          ) : status === "error" ? (
            <><XCircle className="w-3.5 h-3.5 text-destructive" /> Tentar novamente</>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5" /> Testar Conexão</>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground">
          Configure modelos em Configurações → Modelos de Documentos. Envie para assinatura pela aba Contratos do negócio.
        </p>
      </CardContent>
    </Card>
  );
}

function N8nCard() {
  const { data: webhooks, isLoading } = useN8nWebhooks();
  const updateMut = useUpdateN8nWebhook();
  const deleteMut = useDeleteN8nWebhook();
  const dispararMut = useDispararWebhook();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<N8nWebhook | null>(null);

  const handleTest = async (webhook: N8nWebhook) => {
    try {
      const result = await dispararMut.mutateAsync({
        evento: webhook.eventos[0] ?? "test",
        dados: { teste: true, webhook_nome: webhook.nome, timestamp: new Date().toISOString() },
      });
      toast.success(`Teste enviado! ${result.dispatched} webhook(s) disparado(s).`);
    } catch {
      toast.error("Erro ao testar webhook");
    }
  };

  const handleToggle = (webhook: N8nWebhook, ativo: boolean) => {
    updateMut.mutate({ id: webhook.id, updates: { ativo } as any });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este webhook?")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Webhook excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">n8n — Automações</CardTitle>
            <CardDescription className="text-xs">Dispare webhooks para o n8n quando eventos acontecem na plataforma</CardDescription>
          </div>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => { setEditing(null); setSheetOpen(true); }}>
            <Plus className="w-3.5 h-3.5" /> Novo Webhook
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : !webhooks?.length ? (
            <p className="text-xs text-muted-foreground">Nenhum webhook configurado. Crie um para começar a automatizar.</p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div key={wh.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{wh.nome}</span>
                      <Badge variant={wh.ativo ? "default" : "secondary"} className="text-[10px]">
                        {wh.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <Switch checked={wh.ativo} onCheckedChange={(v) => handleToggle(wh, v)} />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{wh.url}</p>
                  <div className="flex flex-wrap gap-1">
                    {wh.eventos.map((ev) => (
                      <Badge key={ev} variant="outline" className="text-[10px]">{ev}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" className="text-xs gap-1 h-7" onClick={() => handleTest(wh)} disabled={dispararMut.isPending}>
                      <Play className="w-3 h-3" /> Testar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs gap-1 h-7" onClick={() => { setEditing(wh); setSheetOpen(true); }}>
                      <Pencil className="w-3 h-3" /> Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs gap-1 h-7 text-destructive" onClick={() => handleDelete(wh.id)} disabled={deleteMut.isPending}>
                      <Trash2 className="w-3 h-3" /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <N8nWebhookSheet open={sheetOpen} onOpenChange={setSheetOpen} webhook={editing} />
    </>
  );
}

export default function Integracoes() {
  const { data: googleToken, isLoading } = useGoogleToken();
  const authMut = useGoogleCalendarAuth();
  const syncMut = useGoogleCalendarSync();
  const disconnectMut = useDisconnectGoogle();
  const toggleSyncMut = useToggleGoogleSync();
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === "google-calendar-connected") {
        qc.invalidateQueries({ queryKey: ["google-token"] });
        toast.success("Google Calendar conectado!");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [qc]);

  const handleConnect = async () => {
    try {
      const url = await authMut.mutateAsync();
      window.open(url, "google-auth", "width=500,height=600,left=200,top=100");
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar");
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncMut.mutateAsync();
      toast.success(`Sincronização concluída! ${result.pushed} evento(s) enviado(s).`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao sincronizar");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMut.mutateAsync();
      toast.success("Google Calendar desconectado");
    } catch {
      toast.error("Erro ao desconectar");
    }
  };

  const handleToggleSync = (enabled: boolean) => {
    if (!googleToken) return;
    toggleSyncMut.mutate({ id: googleToken.id, sync_enabled: enabled });
  };

  const isConnected = !!googleToken;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Integrações</h1>
        <p className="text-xs text-muted-foreground mt-1">Conecte com sistemas externos e APIs</p>
      </div>

      {/* n8n */}
      <N8nCard />

      {/* Google Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">Google Calendar</CardTitle>
            <CardDescription className="text-xs">Sincronize eventos da agenda com o Google Calendar</CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="text-[10px]">
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Sincronização automática</p>
                  <p className="text-[10px] text-muted-foreground">Enviar novos eventos automaticamente</p>
                </div>
                <Switch checked={googleToken.sync_enabled} onCheckedChange={handleToggleSync} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleSync} disabled={syncMut.isPending}>
                  <RefreshCw className={`w-3.5 h-3.5 ${syncMut.isPending ? "animate-spin" : ""}`} />
                  {syncMut.isPending ? "Sincronizando..." : "Sincronizar Agora"}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs gap-1.5 text-destructive" onClick={handleDisconnect} disabled={disconnectMut.isPending}>
                  <Unplug className="w-3.5 h-3.5" />
                  Desconectar
                </Button>
              </div>
            </>
          ) : (
            <Button size="sm" className="text-xs gap-1.5" onClick={handleConnect} disabled={authMut.isPending}>
              <ExternalLink className="w-3.5 h-3.5" />
              {authMut.isPending ? "Conectando..." : "Conectar Google Calendar"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ClickSign */}
      <ClickSignCard />

      {/* Placeholder */}
      <Card className="glass-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Plug className="w-12 h-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">Mais Integrações em Breve</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            Integrações com tribunais, APIs de consulta processual e outros sistemas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
