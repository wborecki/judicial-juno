

## Plano: Distribuição e Controle de Análise de Processos

### Contexto
O sistema já tem `analista_id`, `equipe_id`, `distribuido_em` e `distribuido_por` na tabela `processos`. Precisa-se de:
1. Visibilidade de quem está analisando cada processo
2. Capacidade de trocar o analista
3. Página de Distribuição funcional com roteamento automático/manual
4. Configuração de regras de roteamento por equipe

### Mudanças

**1. Nova tabela `regras_roteamento`** (migração)
- Armazena regras de distribuição automática
- Campos: `id`, `nome`, `equipe_id`, `criterio_tribunal` (jsonb array), `criterio_natureza` (jsonb array), `criterio_tipo_pagamento` (jsonb array), `ativa`, `prioridade` (int), `created_at`
- RLS permissiva (dev)

**2. Página `Distribuicao.tsx` — Implementação completa**
- Lista processos com `triagem_resultado = 'apto'` e `analista_id IS NULL` (fila de distribuição)
- Tabela compacta: nº processo, tribunal, natureza, tipo pgto, valor, captação
- Seleção múltipla (checkboxes) para distribuição em lote
- Botão "Distribuir Selecionados" abre sheet lateral para escolher equipe + analista
- Distribuição automática: botão que aplica regras de roteamento (match por tribunal/natureza/tipo_pagamento → atribui à equipe correspondente, round-robin entre membros)
- Ao distribuir: seta `analista_id`, `equipe_id`, `distribuido_em`, `distribuido_por`, `pipeline_status = 'distribuido'`

**3. Página `Analise.tsx` — Implementação completa**
- Lista processos com `analista_id IS NOT NULL` e `pipeline_status IN ('distribuido', 'em_analise')`
- Mostra analista responsável (avatar + nome) em cada linha
- Filtro por equipe e analista
- Ação de trocar analista via dropdown em cada linha
- Badge de status: "Aguardando Análise", "Em Análise"

**4. `ProcessoHeader.tsx` — Exibir analista responsável**
- Novo campo no header do detalhe do processo mostrando o analista atribuído
- Dropdown editável para trocar analista (lista de usuários ativos)
- Badge de equipe atribuída

**5. `Processos.tsx` — Coluna de analista**
- Nova coluna "Analista" na tabela de processos mostrando nome/iniciais do responsável
- Filtro por analista no painel de filtros

**6. Configuração de roteamento (nova página `ConfigRoteamento.tsx`)**
- CRUD de regras: nome, equipe destino, critérios (tribunal, natureza, tipo pagamento)
- Prioridade das regras (ordem)
- Registrar rota em `/configuracoes/roteamento` e link no sidebar de configurações

**7. Hook `useDistribuicao.ts`** (novo)
- `useProcessosFila()`: processos aptos sem analista
- `useDistribuirProcessos()`: mutation para atribuir analista/equipe em lote
- `useDistribuicaoAutomatica()`: aplica regras de roteamento
- `useRegrasRoteamento()`: CRUD de regras

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar tabela `regras_roteamento` |
| `src/hooks/useDistribuicao.ts` | Criar — hooks de distribuição e roteamento |
| `src/pages/Distribuicao.tsx` | Reescrever — fila de distribuição funcional |
| `src/pages/Analise.tsx` | Reescrever — lista de processos em análise com analista |
| `src/components/processo/ProcessoHeader.tsx` | Editar — campo analista editável |
| `src/pages/Processos.tsx` | Editar — coluna analista + filtro |
| `src/pages/ConfigRoteamento.tsx` | Criar — CRUD de regras de roteamento |
| `src/components/ConfiguracoesLayout.tsx` | Editar — link roteamento no menu |
| `src/App.tsx` | Editar — registrar rota roteamento |

