

## Plano: Simplificar Áreas de Trabalho — Configuração Global + Checklist Automático

### Problema Atual
Hoje o analista precisa manualmente escolher a equipe para cada área em cada processo. Com centenas de processos, isso é inviável.

### Solução
Configurar o mapeamento **área → equipe** UMA VEZ nas configurações. Quando o analista marca "Apto para Análise", as 4 áreas são criadas automaticamente com as equipes já atribuídas. Na tab do processo, aparece apenas um checklist limpo: checkbox + nome da área + quem concluiu + observação opcional.

### Fluxo Simplificado

```text
Configurações (uma vez)
  Jurídico    → Equipe Jurídico
  Financeiro  → Equipe Financeiro
  Documental  → (sem equipe, qualquer um)
  Compliance  → Equipe Compliance

Processo individual
  Analista clica "Apto para Análise"
       ↓
  4 áreas criadas automaticamente com equipes da config
       ↓
  Checklist simples:
  ☑ Jurídico     — concluído por Maria em 18/03
  ☐ Financeiro   — pendente
  ☑ Documental   — concluído por João em 17/03
  ☐ Compliance   — pendente
       ↓
  4/4 → botão "Criar Negócio" libera
```

### Alterações

1. **Nova tabela `config_areas_equipes`** — Mapeamento global área→equipe (4 registros, um por área). Campos: `id`, `area` (text unique), `equipe_id` (uuid nullable). Migração SQL simples.

2. **Nova página/seção em Configurações** — Tela simples com 4 linhas: nome da área + select de equipe. Salva o mapeamento global. Pode ficar dentro de Configurações Gerais ou como sub-rota.

3. **`useEnsureProcessoAreas` atualizado** — Ao criar as áreas, busca a config global e preenche `equipe_id` automaticamente. Zero input manual no processo.

4. **`TabAnalise.tsx` simplificado** — Remover o select de equipe por área. Mostrar apenas:
   - Checkbox de concluído
   - Ícone + nome da área
   - Badge com nome da equipe (read-only, vindo da config)
   - Quem concluiu e quando (se concluído)
   - Textarea compacta de observação (colapsável ou inline)
   - Layout mais compacto: lista vertical simples em vez de grid 2x2

5. **Hook `useConfigAreasEquipes`** — CRUD para a tabela de configuração. Query simples.

### UI do Checklist (no processo)

Cada área será uma linha horizontal compacta:

```text
☐  ⚖ Jurídico        Equipe Jurídico     [Observação...]
☑  $ Financeiro       Equipe Financeiro   Concluído por Maria — 18/03
☐  📄 Documental      —                   [Observação...]
☐  🛡 Compliance      Equipe Compliance   [Observação...]
```

Sem selects, sem atribuição manual. Prático e direto.

### Arquivos

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar `config_areas_equipes` com 4 registros default |
| `src/hooks/useConfigAreasEquipes.ts` | Novo hook CRUD |
| `src/pages/ConfiguracoesGeral.tsx` | Adicionar seção "Equipes por Área" |
| `src/hooks/useProcessoAreas.ts` | Atualizar `useEnsureProcessoAreas` para buscar config |
| `src/components/processo/TabAnalise.tsx` | Simplificar UI das áreas |

