

## Plano: Tipos de Atividade Configuráveis + Integração Google Calendar

### Parte 1 — Tipos de Atividade Configuráveis

**1. Migração: tabela `tipos_atividade`**
- Campos: `id`, `nome`, `slug`, `icone`, `cor`, `entidade` (agenda/negocio/ambos), `ativo`, `ordem`, `created_at`
- Seed com tipos adequados ao negócio de compra de créditos judiciais:
  - Agenda: Tarefa, Reunião, Contato com Credor, Follow-up, Análise de Processo, Assinatura/Contrato
  - Negócio: Nota, Ligação, E-mail, Reunião, Tarefa, Proposta Enviada, Contrato
- RLS: acesso total para authenticated

**2. Hook `useTiposAtividade.ts`**
- Query filtrando por `entidade` e `ativo`
- Mutations CRUD

**3. Página de configuração `TiposAtividade.tsx`**
- No menu Configurações, item "Tipos de Atividade"
- Tabela com nome, ícone, cor, entidade, ativo/inativo
- Sheet para criar/editar tipo

**4. Atualizar componentes consumidores**
- `Agenda.tsx`, `EventoSheet.tsx`, `TabAtividades.tsx` — substituir constantes hardcoded por dados dinâmicos do hook

**5. Rotas**
- Adicionar `/configuracoes/tipos-atividade` no `App.tsx` e link no `ConfiguracoesLayout.tsx`

---

### Parte 2 — Integração Google Calendar

Não existe um conector Google Calendar disponível na plataforma, então a integração precisa ser construída via Google Calendar API com OAuth.

**Arquitetura:**

```text
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Frontend   │────▶│  Edge Functions   │────▶│ Google API   │
│  (Agenda)   │     │  google-calendar  │     │ Calendar v3  │
└─────────────┘     └──────────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │ google_     │
                    │ tokens (DB) │
                    └─────────────┘
```

**1. Configuração Google Cloud Console (manual pelo usuário)**
- Criar projeto no Google Cloud Console
- Ativar Google Calendar API
- Criar credenciais OAuth 2.0 (Web Application)
- Redirect URI: `https://<project-id>.supabase.co/functions/v1/google-calendar-callback`
- Guardar Client ID e Client Secret como secrets do projeto

**2. Migração: tabela `google_tokens`**
- Campos: `id`, `user_id` (unique), `access_token`, `refresh_token`, `expires_at`, `calendar_id`, `sync_enabled`, `created_at`, `updated_at`
- RLS: cada usuário vê apenas seus próprios tokens

**3. Edge Functions**
- `google-calendar-auth`: Inicia fluxo OAuth, redireciona para Google
- `google-calendar-callback`: Recebe code, troca por tokens, salva na tabela
- `google-calendar-sync`: Busca eventos do Google Calendar e sincroniza com `agenda_eventos` (e vice-versa); campo `google_event_id` na tabela `agenda_eventos` para evitar duplicatas

**4. Migração: adicionar coluna `google_event_id` em `agenda_eventos`**
- Nullable, usado para tracking de eventos sincronizados

**5. UI na página de Integrações**
- Card "Google Calendar" com botão "Conectar"
- Status de conexão (conectado/desconectado)
- Toggle de sincronização automática
- Botão "Sincronizar agora"

**6. Sincronização no hook `useAgendaEventos`**
- Após criar/atualizar/deletar evento local, chamar edge function para espelhar no Google Calendar
- Opção de sync periódico via polling ou manual

**Secrets necessários:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — serão solicitados ao usuário via ferramenta de secrets.

**Limitação:** A sincronização inicial será unidirecional (local → Google) com opção de importar eventos do Google. Bidirecional completo (webhooks push do Google) requer domínio verificado e é uma evolução futura.

---

### Ordem de implementação sugerida
1. Tipos de atividade configuráveis (independente)
2. Infraestrutura Google Calendar (tabelas + edge functions)
3. UI de integração + conexão na Agenda

**Arquivos novos:** `useTiposAtividade.ts`, `TiposAtividade.tsx`, edge functions `google-calendar-*`, `useGoogleCalendar.ts`
**Arquivos editados:** `Agenda.tsx`, `EventoSheet.tsx`, `TabAtividades.tsx`, `ConfiguracoesLayout.tsx`, `Integracoes.tsx`, `App.tsx`, migração `agenda_eventos`

