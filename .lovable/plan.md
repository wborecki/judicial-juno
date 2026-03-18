

## Plano: Integração com n8n via Webhooks

### Conceito

A plataforma dispara webhooks para o n8n quando eventos relevantes acontecem (ex: negócio criado, área concluída, processo convertido). No n8n o usuário configura os fluxos de automação (envio de email, notificações, etc.). Na plataforma, o admin cadastra a URL do webhook do n8n e escolhe quais eventos disparam.

### Arquitetura

```text
┌─────────────────────────────────┐
│  CRM (Plataforma)               │
│                                 │
│  Evento acontece (ex: negócio   │
│  criado, área concluída)        │
│         │                       │
│         ▼                       │
│  Edge Function: n8n-webhook     │
│  POST → URL configurada no n8n  │
│  com payload do evento          │
└────────────┬────────────────────┘
             │ HTTPS POST
             ▼
┌─────────────────────────────────┐
│  n8n (externo)                  │
│  Webhook Trigger recebe dados   │
│  → Envia email                  │
│  → Atualiza planilha            │
│  → Qualquer automação           │
└─────────────────────────────────┘
```

### Eventos disponíveis para disparo

| Evento | Slug | Quando dispara |
|---|---|---|
| Negócio criado | `negocio.criado` | Processo convertido em negócio |
| Negócio ganho | `negocio.ganho` | Status muda para "ganho" |
| Negócio perdido | `negocio.perdido` | Status muda para "perdido" |
| Área concluída | `area.concluida` | Checklist de área marcado |
| Todas áreas concluídas | `areas.todas_concluidas` | 4/4 áreas prontas |
| Processo distribuído | `processo.distribuido` | Processo entra em análise |
| Processo descartado | `processo.descartado` | Triagem descarta processo |
| Contrato assinado | `contrato.assinado` | Assinatura concluída |

### O que será construído

1. **Tabela `n8n_webhooks`** — Armazena as configurações de webhooks:
   - `id`, `nome` (nome descritivo), `url` (URL do webhook no n8n), `eventos` (array de slugs), `ativo` (toggle), `headers_custom` (JSON opcional para auth), `created_at`
   - RLS: authenticated users can manage

2. **Tabela `n8n_webhook_logs`** — Log de disparos para auditoria:
   - `id`, `webhook_id`, `evento`, `payload` (JSON enviado), `status_code`, `resposta`, `created_at`

3. **Edge Function `n8n-webhook`** — Recebe o evento do frontend, busca webhooks ativos para aquele evento, faz POST para cada URL configurada, loga o resultado. Inclui retry simples (1 tentativa extra em caso de falha).

4. **Hook `useN8nWebhooks.ts`** — CRUD dos webhooks + hook `useDispararWebhook` para chamar a edge function quando eventos acontecem.

5. **Página de configuração na UI (Integrações)** — Card do n8n com:
   - Lista de webhooks cadastrados (nome, URL, eventos, ativo/inativo)
   - Botão para adicionar novo webhook
   - Sheet/modal para configurar: nome, URL do n8n, selecionar eventos, toggle ativo
   - Botão "Testar" que envia payload de teste para o webhook
   - Seção de logs mostrando últimos disparos com status

6. **Integração nos fluxos existentes** — Adicionar chamadas de disparo nos pontos certos:
   - `useNegocios` → ao criar/atualizar negócio, disparar evento correspondente
   - `useProcessoAreas` → ao concluir área, disparar evento
   - `useProcessos` → ao distribuir/descartar, disparar evento

### Exemplo de payload enviado ao n8n

```json
{
  "evento": "negocio.criado",
  "timestamp": "2026-03-18T22:30:00Z",
  "dados": {
    "negocio_id": "uuid",
    "processo_numero": "0001234-56.2024.8.26.0100",
    "tribunal": "TJSP",
    "valor_proposta": 50000,
    "pessoa_nome": "João Silva",
    "responsavel": "Maria Analista"
  }
}
```

### Arquivos a criar/alterar

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar `n8n_webhooks` e `n8n_webhook_logs` |
| `supabase/functions/n8n-webhook/index.ts` | Edge function para disparar webhooks |
| `src/hooks/useN8nWebhooks.ts` | Hook CRUD + disparo |
| `src/pages/Integracoes.tsx` | Adicionar card n8n com gestão de webhooks |
| `src/components/integracoes/N8nWebhookSheet.tsx` | Sheet para criar/editar webhook |
| `src/hooks/useNegocios.ts` | Adicionar disparo após criar/atualizar |
| `src/hooks/useProcessoAreas.ts` | Adicionar disparo ao concluir área |
| `src/hooks/useProcessos.ts` | Adicionar disparo ao distribuir/descartar |

### Segurança

- A URL do webhook e headers custom ficam no banco, acessíveis apenas por usuários autenticados
- A edge function valida o evento e busca apenas webhooks ativos
- Headers custom permitem enviar token de autenticação para o n8n (ex: `Authorization: Bearer xyz`)
- Logs mantêm auditoria completa de cada disparo

