

## Plano: Melhorar Integração ClickSign — Templates, Pré-visualização e Formato Correto da API

### Problema Atual

A integração tem 3 problemas críticos:

1. **Formato da API errado**: A ClickSign v3 usa padrão **JSON:API** (`data.type`, `data.attributes`), mas a edge function envia JSON plano. Isso faz as chamadas falharem.

2. **Etapa faltante — Requirements**: Após criar documento e signatário, é obrigatório criar **requirements** (vincular signatário ao documento com ação `agree` + autenticação `email`). Sem isso, o signatário não recebe nada.

3. **Etapa faltante — Notifications**: Após ativar o envelope, é preciso chamar `/notifications` para disparar os emails. Sem isso, ninguém é notificado.

4. **Sem pré-visualização**: Não há etapa de revisão antes do envio para verificar se está tudo certo.

---

### O que muda

#### 1. Corrigir Edge Function (`clicksign-api/index.ts`)

Ajustar todas as chamadas para usar formato JSON:API:

```text
// ANTES (errado):
{ envelope: { name: "...", locale: "pt-BR" } }

// DEPOIS (correto):
{ data: { type: "envelopes", attributes: { name: "...", locale: "pt-BR" } } }
```

Aplicar para: `create-envelope`, `upload-document`, `create-from-template`, `add-signer`, `activate-envelope`.

Adicionar **2 ações novas**:
- `add-requirement` — vincula signatário ao documento (ação `agree` + auth `email`)
- `send-notifications` — dispara emails para signatários

Ajustar `activate-envelope` para usar PATCH com `status: "running"` no body.

#### 2. Adicionar etapa de Revisão no `EnviarAssinaturaSheet`

Adicionar **step 4: "Revisão"** antes do envio:

```text
1. Modelo → 2. Variáveis → 3. Signatários → 4. Revisão → Enviar
```

A tela de revisão mostra:
- Nome do modelo selecionado
- Variáveis preenchidas (lista chave→valor)
- Signatários com nome, email, papel
- Botão "Enviar para Assinatura" só aparece aqui
- Alertas se algum campo obrigatório estiver vazio

#### 3. Corrigir fluxo de envio no `EnviarAssinaturaSheet`

Atualizar `handleSend` para o fluxo correto:

```text
1. create-envelope
2. create-from-template (ou upload-document)
3. add-signer (×N)
4. add-requirement (×N — vincular cada signatário ao documento)
5. activate-envelope (PATCH com status: "running")
6. send-notifications
7. Salvar no banco
```

#### 4. Importar templates do ClickSign

Na página de Modelos de Documentos, adicionar botão **"Importar do ClickSign"**:
- Chama `list-templates` na edge function
- Mostra lista de templates disponíveis na conta ClickSign
- Ao selecionar, cria o modelo local com `clicksign_template_key` preenchido
- Facilita o setup sem precisar copiar keys manualmente

#### 5. Testar conexão com feedback detalhado

Na página de Integrações, melhorar o card ClickSign:
- Ao testar conexão, mostrar nome da conta/plano se disponível
- Mostrar se é sandbox ou produção baseado na URL do token

---

### Arquivos editados

- `supabase/functions/clicksign-api/index.ts` — formato JSON:API + novas ações
- `src/components/negocios/EnviarAssinaturaSheet.tsx` — step revisão + fluxo correto
- `src/pages/ModelosDocumentos.tsx` — botão importar templates

### Resumo das respostas às suas perguntas

**Sim, ClickSign tem templates.** Você cria um `.docx` com variáveis `{{nome}}`, `{{cpf}}`, etc., faz upload via API como template, e depois gera documentos passando os valores das variáveis — o ClickSign preenche automaticamente.

**Para verificar antes de enviar**, vamos adicionar uma tela de revisão que mostra tudo antes de disparar, permitindo voltar e corrigir qualquer campo.

