

## Plano: Aba "Análise" com campos dinâmicos configuráveis

### Resumo
Renomear a aba "Financeiro" para "Análise", posicioná-la como segunda aba, manter os dados financeiros existentes, e criar um sistema de **campos personalizados configuráveis** em Configurações. Os campos criados lá aparecerão automaticamente na aba Análise do processo para preenchimento pelo analista.

### 1. Banco de dados — nova tabela `campos_analise` e `processo_campos_valores`

**`campos_analise`** — define os campos configuráveis:
- `id`, `nome` (text), `tipo` (text: `texto`, `numero`, `data`, `select`, `checkbox`, `moeda`), `grupo` (text — para agrupar em blocos como "Financeiro", "Jurídico", etc.), `opcoes` (jsonb — para campos select), `obrigatorio` (boolean), `ordem` (int), `ativo` (boolean), `created_at`

**`processo_campos_valores`** — armazena os valores preenchidos:
- `id`, `processo_id` (uuid FK), `campo_id` (uuid FK → campos_analise), `valor` (text), `created_at`, `updated_at`

### 2. Configurações → renomear "Campos de Negócios" para "Campos de Análise"

Refatorar `CamposNegocios.tsx` → `CamposAnalise.tsx`:
- CRUD completo para campos: nome, tipo, grupo, opções (para select), obrigatório, ordem
- Agrupar campos por grupo com drag visual simples (ordem numérica)
- Tipos suportados: Texto, Número, Moeda (R$), Data, Select (opções customizadas), Checkbox

Atualizar `ConfiguracoesLayout.tsx` e `App.tsx` para refletir o novo nome/rota.

### 3. ProcessoDetalhe — aba "Análise" como segunda aba

No `ProcessoDetalhe.tsx`:
- Renomear tab `financeiro` → `analise`, ícone `FileSearch`, label "Análise"
- Mover para ser a **segunda aba** (após Partes)
- Extrair conteúdo para novo componente `TabAnalise.tsx`

**`TabAnalise.tsx`**:
- Bloco fixo "Dados Financeiros" (manter os 4 campos existentes: valor causa, valor precificado, data precificação, tipo pagamento)
- Abaixo, renderizar dinamicamente os campos de `campos_analise` agrupados por `grupo`
- Cada grupo aparece como um bloco card separado (mesmo estilo do financeiro)
- Valores lidos/salvos de `processo_campos_valores`
- Renderização por tipo: Input text, Input number, Input date, Select, Checkbox, Input moeda

### 4. Hooks

- `useCamposAnalise()` — listar campos ativos ordenados
- `useCreateCampoAnalise()`, `useUpdateCampoAnalise()`, `useDeleteCampoAnalise()`
- `useProcessoCamposValores(processoId)` — buscar valores do processo
- `useSaveProcessoCampoValor()` — upsert valor

### Arquivos impactados

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar `campos_analise` e `processo_campos_valores` |
| `src/hooks/useCamposAnalise.ts` | Novo — CRUD campos |
| `src/hooks/useProcessoCamposValores.ts` | Novo — valores do processo |
| `src/components/processo/TabAnalise.tsx` | Novo — aba Análise |
| `src/pages/CamposAnalise.tsx` | Refatorar de CamposNegocios |
| `src/pages/ProcessoDetalhe.tsx` | Renomear tab, reordenar, usar TabAnalise |
| `src/components/ConfiguracoesLayout.tsx` | Renomear nav item |
| `src/App.tsx` | Atualizar import/rota |

