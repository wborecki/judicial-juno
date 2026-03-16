

## Plano: Integração ClickSign + Modelos de Documentos

### Visão Geral

Integrar com a API ClickSign (v3) para enviar documentos para assinatura eletrônica diretamente do sistema, com suporte a modelos (templates) pré-configurados. O fluxo principal será: selecionar modelo → preencher variáveis → criar envelope no ClickSign → adicionar signatários → disparar assinatura → acompanhar status.

---

### 1. Infraestrutura

**Secret:** `CLICKSIGN_ACCESS_TOKEN` — será solicitado ao usuário via ferramenta de secrets.

**Tabelas novas (migração SQL):**

- `documento_modelos` — modelos de documento reutilizáveis
  - `id`, `nome`, `descricao`, `clicksign_template_key` (nullable — para modelos vinculados ao ClickSign), `arquivo_url` (para upload local do .docx modelo), `variaveis` (jsonb — lista de campos dinâmicos), `ativo`, `created_at`

- `documento_envios` — registro de cada envio para assinatura
  - `id`, `modelo_id` (ref documento_modelos), `negocio_id` (nullable), `processo_id` (nullable), `contrato_id` (nullable, ref contratos_cessao), `clicksign_envelope_id`, `clicksign_document_key`, `status` (rascunho/enviado/assinado/recusado/cancelado), `dados_variaveis` (jsonb — valores preenchidos), `criado_por`, `created_at`, `updated_at`

- `documento_envio_signatarios` — signatários de cada envio
  - `id`, `envio_id` (ref documento_envios), `nome`, `email`, `cpf`, `telefone`, `papel` (sign/approve/witness), `clicksign_signer_key`, `status` (pendente/assinado/recusado), `assinado_em`

RLS: authenticated para todas.

**Edge Function:** `clicksign-api`
- Proxy centralizado para a API ClickSign (evita expor token no frontend)
- Ações: `create-envelope`, `upload-document`, `create-from-template`, `add-signer`, `activate-envelope`, `get-envelope-status`, `cancel-envelope`, `list-templates`
- Usa `CLICKSIGN_ACCESS_TOKEN` do vault
- Base URL configurável (sandbox vs produção)

---

### 2. Módulo de Modelos de Documentos

**Página:** `Configurações → Modelos de Documentos` (`/configuracoes/modelos-documentos`)

- Lista de modelos cadastrados com nome, descrição, variáveis e status
- Sheet para criar/editar modelo:
  - Nome e descrição
  - Upload do arquivo .docx (modelo com tags `{{variavel}}`)
  - Definição das variáveis dinâmicas (nome, tipo: texto/data/moeda/cpf)
  - Opção de sincronizar com ClickSign (envia o template e guarda a `template_key`)
- Modelos pré-configurados para o negócio:
  - Contrato de Cessão de Crédito
  - Termo de Adesão
  - Procuração
  - Declaração de Quitação

**Hook:** `useDocumentoModelos.ts` — CRUD dos modelos

---

### 3. Envio de Documentos para Assinatura

**Integração na aba Contratos do Negócio (`TabContratos.tsx`):**
- Botão "Enviar para Assinatura" em cada contrato
- Abre modal/sheet com:
  1. Seleção do modelo
  2. Preenchimento das variáveis (pré-populadas com dados do negócio/processo/pessoa)
  3. Adição de signatários (com autocomplete de pessoas cadastradas)
  4. Botão "Enviar" → cria envelope + documento + signatários no ClickSign + ativa

**Fluxo técnico (edge function):**
```text
Frontend                   Edge Function              ClickSign API
   │                           │                          │
   ├─ create-envelope ────────▶│─── POST /envelopes ─────▶│
   │                           │◀── envelope_id ──────────│
   ├─ create-from-template ───▶│─── POST /documents ─────▶│
   │                           │◀── document_key ─────────│
   ├─ add-signer (×N) ────────▶│─── POST /signers ───────▶│
   │                           │◀── signer_key ───────────│
   ├─ activate-envelope ──────▶│─── PATCH /envelopes ────▶│
   │                           │◀── ok ──────────────────│
```

**Acompanhamento de status:**
- Coluna de status no registro do envio
- Botão "Atualizar Status" consulta a API e atualiza localmente
- Badge visual: Rascunho (cinza), Enviado (azul), Assinado (verde), Recusado (vermelho)

---

### 4. Nova aba "Documentos" no Negócio

Adicionar aba "Assinaturas" no `NegocioDetalhe.tsx`:
- Lista todos os envios vinculados ao negócio
- Status de cada signatário
- Link para visualizar documento no ClickSign
- Ação de reenviar / cancelar

**Hook:** `useDocumentoEnvios.ts` — query por negocio_id, mutations para criar envio e atualizar status

---

### 5. Configuração na página de Integrações

Card "ClickSign" na página de Integrações (`Integracoes.tsx`):
- Status de conexão (verifica se o token está configurado via edge function de teste)
- Toggle sandbox/produção
- Link para documentação

---

### 6. Rotas e Navegação

- `/configuracoes/modelos-documentos` → `ModelosDocumentos.tsx`
- Link no `ConfiguracoesLayout.tsx`

---

### Arquivos novos
- `supabase/functions/clicksign-api/index.ts`
- `src/hooks/useDocumentoModelos.ts`
- `src/hooks/useDocumentoEnvios.ts`
- `src/pages/ModelosDocumentos.tsx`
- `src/components/negocios/TabAssinaturas.tsx`
- `src/components/negocios/EnviarAssinaturaSheet.tsx`

### Arquivos editados
- `src/pages/NegocioDetalhe.tsx` (nova aba)
- `src/components/negocios/TabContratos.tsx` (botão enviar)
- `src/pages/Integracoes.tsx` (card ClickSign)
- `src/components/ConfiguracoesLayout.tsx` (link modelos)
- `src/App.tsx` (rota modelos)
- `supabase/config.toml` (nova function)
- Migração SQL para novas tabelas

### Ordem de implementação
1. Secret `CLICKSIGN_ACCESS_TOKEN` + edge function proxy
2. Tabelas + migrações
3. Modelos de documentos (página + hook)
4. Envio para assinatura (sheet + hook + aba no negócio)
5. Card na página de Integrações

