

## Plano: Fluxo de Trabalho Colaborativo por Áreas

### Conceito

Quando o analista marca um processo como viável na triagem, 4 áreas (Jurídico, Financeiro, Documental, Compliance) precisam trabalhar simultaneamente. Cada área tem um checklist de "Concluído" e o botão "Criar Negócio" só fica ativo quando todas estão prontas. Todas as equipes veem os processos automaticamente.

### Fluxo proposto

```text
Captação → Triagem → Analista aprova → pipeline_status = "em_analise"
                                         ↓
                         4 áreas aparecem na aba Análise:
                         [ ] Jurídico    [ ] Financeiro
                         [ ] Documental  [ ] Compliance
                                         ↓
                         Cada equipe preenche seus campos
                         e marca como "Concluído"
                                         ↓
                         Todas concluídas → Botão "Criar Negócio" ativo
```

### Nova tabela: `processo_areas_trabalho`

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| processo_id | uuid NOT NULL | FK para processos |
| area | text NOT NULL | 'juridico', 'financeiro', 'documental', 'compliance' |
| concluido | boolean | Default false |
| concluido_por | uuid | Usuário que marcou |
| concluido_em | timestamptz | Data da conclusão |
| observacoes | text | Notas da área |
| created_at | timestamptz | |

- Unique constraint em (processo_id, area)
- RLS: authenticated users can manage
- As 4 linhas são criadas automaticamente quando o processo entra em análise (via trigger ou no código)

### Alterações na UI

1. **ProcessoHeader** — O botão "Criar Negócio" fica desabilitado com tooltip "Áreas pendentes" enquanto alguma área não estiver concluída. Quando todas estiverem prontas, o botão fica verde normalmente.

2. **TabAnalise (reformulada)** — Adicionar no topo um painel de progresso com as 4 áreas:
   - Cada área mostra status (Pendente / Concluído) com checkbox
   - Indicador visual de progresso (ex: "2/4 áreas concluídas")
   - Campo de observações por área
   - Os campos dinâmicos existentes continuam abaixo, agrupados por área

3. **Página Análise** — Adicionar coluna "Progresso" na tabela mostrando "2/4" ou barra de progresso, para que todos vejam quais processos estão prontos.

### Arquivos a criar/alterar

1. **Migração SQL** — Criar tabela `processo_areas_trabalho` com RLS
2. **`src/hooks/useProcessoAreas.ts`** — Hook para listar, criar e atualizar áreas de trabalho
3. **`src/components/processo/TabAnalise.tsx`** — Adicionar painel de áreas no topo
4. **`src/components/processo/ProcessoHeader.tsx`** — Condicionar botão "Criar Negócio" às áreas concluídas
5. **`src/pages/Analise.tsx`** — Adicionar coluna de progresso na tabela
6. **Lógica de criação automática** — Ao aprovar processo na triagem (marcar como viável), criar as 4 linhas de áreas automaticamente

### Detalhes técnicos

- As 4 áreas são criadas no código quando o `pipeline_status` muda para `em_analise` ou `distribuido` (no hook de distribuição)
- O hook `useProcessoAreas` faz query por `processo_id` e retorna as 4 áreas com seus status
- Na TabAnalise, o painel de áreas fica acima dos campos dinâmicos existentes, sem substituí-los
- No ProcessoHeader, fazemos query das áreas e verificamos se `todas.concluido === true` antes de habilitar o botão

