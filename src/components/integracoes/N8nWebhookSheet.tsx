import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { EVENTOS_DISPONIVEIS, type N8nWebhook, useCreateN8nWebhook, useUpdateN8nWebhook } from "@/hooks/useN8nWebhooks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: N8nWebhook | null;
}

export default function N8nWebhookSheet({ open, onOpenChange, webhook }: Props) {
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [eventos, setEventos] = useState<string[]>([]);
  const [ativo, setAtivo] = useState(true);
  const [headersRaw, setHeadersRaw] = useState("");

  const createMut = useCreateN8nWebhook();
  const updateMut = useUpdateN8nWebhook();

  useEffect(() => {
    if (webhook) {
      setNome(webhook.nome);
      setUrl(webhook.url);
      setEventos(webhook.eventos ?? []);
      setAtivo(webhook.ativo);
      setHeadersRaw(webhook.headers_custom ? JSON.stringify(webhook.headers_custom, null, 2) : "");
    } else {
      setNome("");
      setUrl("");
      setEventos([]);
      setAtivo(true);
      setHeadersRaw("");
    }
  }, [webhook, open]);

  const toggleEvento = (slug: string) => {
    setEventos((prev) => (prev.includes(slug) ? prev.filter((e) => e !== slug) : [...prev, slug]));
  };

  const handleSave = async () => {
    if (!nome.trim() || !url.trim()) {
      toast.error("Nome e URL são obrigatórios");
      return;
    }
    if (eventos.length === 0) {
      toast.error("Selecione ao menos um evento");
      return;
    }

    let headers_custom: Record<string, string> | undefined;
    if (headersRaw.trim()) {
      try {
        headers_custom = JSON.parse(headersRaw);
      } catch {
        toast.error("Headers inválidos (deve ser JSON)");
        return;
      }
    }

    try {
      if (webhook) {
        await updateMut.mutateAsync({
          id: webhook.id,
          updates: { nome, url, eventos: eventos as any, ativo, headers_custom: headers_custom as any },
        });
        toast.success("Webhook atualizado");
      } else {
        await createMut.mutateAsync({ nome, url, eventos, headers_custom });
        toast.success("Webhook criado");
      }
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar webhook");
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{webhook ? "Editar Webhook" : "Novo Webhook n8n"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Notificação de negócio" />
          </div>

          <div>
            <Label className="text-xs">URL do Webhook (n8n)</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://n8n.seudominio.com/webhook/..." />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Ativo</Label>
            <Switch checked={ativo} onCheckedChange={setAtivo} />
          </div>

          <div>
            <Label className="text-xs mb-2 block">Eventos</Label>
            <div className="space-y-2">
              {EVENTOS_DISPONIVEIS.map((ev) => (
                <label key={ev.slug} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={eventos.includes(ev.slug)} onCheckedChange={() => toggleEvento(ev.slug)} />
                  <span className="font-mono text-[10px] text-muted-foreground">{ev.slug}</span>
                  <span>— {ev.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Headers Customizados (JSON, opcional)</Label>
            <Textarea
              value={headersRaw}
              onChange={(e) => setHeadersRaw(e.target.value)}
              placeholder='{"Authorization": "Bearer seu-token"}'
              rows={3}
              className="font-mono text-xs"
            />
          </div>

          <Button onClick={handleSave} disabled={isPending} className="w-full">
            {isPending ? "Salvando..." : webhook ? "Salvar Alterações" : "Criar Webhook"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
