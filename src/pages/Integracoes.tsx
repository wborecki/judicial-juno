import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plug, Calendar, RefreshCw, ExternalLink, Unplug, FileSignature, CheckCircle2, XCircle } from "lucide-react";
import { useCallClickSign } from "@/hooks/useDocumentoEnvios";
import { useGoogleToken, useGoogleCalendarAuth, useGoogleCalendarSync, useDisconnectGoogle, useToggleGoogleSync } from "@/hooks/useGoogleCalendar";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Integracoes() {
  const { data: googleToken, isLoading } = useGoogleToken();
  const authMut = useGoogleCalendarAuth();
  const syncMut = useGoogleCalendarSync();
  const disconnectMut = useDisconnectGoogle();
  const toggleSyncMut = useToggleGoogleSync();
  const qc = useQueryClient();

  // Listen for OAuth callback message
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
                <Switch
                  checked={googleToken.sync_enabled}
                  onCheckedChange={handleToggleSync}
                />
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

      {/* Placeholder for future integrations */}
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
