

## Plano Completo: Módulo de Negócios (CRM)

O módulo transforma a página placeholder `/negocios` em um CRM completo com pipeline visual, kanban, listagem e detalhe de negócio. Dividido em 3 sprints incrementais.

---

### Sprint 1 — Fundação: Schema, Pipeline e Listagem + Kanban

**1.1 Migração de banco de dados**

Adicionar colunas à tabela `negocios`:
- `pipeline_etapa` (text, default `'qualificacao'`) — etapa atual do deal no pipeline
- `titulo` (text, nullable) — nome/título do negócio
- `motivo_perda` (text, nullable) — razão da perda
- `prioridade` (text, default `'media'`) — baixa/media/alta
- `ordem_kanban` (integer, default 0) — posição no kanban dentro da etapa

Criar tabela `negocio_pipelines`:
- `id` uuid PK
- `nome` text NOT NULL
- `etapas` jsonb NOT NULL (array de `{id, nome, cor}`)
- `padrao` boolean default false
- `created_at` timestamp

Criar tabela `negocio_atividades` (log de atividades do deal):
- `id` uuid PK
- `negocio_id` uuid NOT NULL
- `tipo` text (nota, ligacao, email, reuniao, tarefa)
- `descricao` text
- `criado_por` uuid
- `created_at` timestamp

**1.2 Hooks**

- Atualizar `useNegocios.ts` com joins (processo, pessoa, responsável)
- `useNegocioPipelines.ts` — CRUD de pipelines
- `useNegocioAtividades.ts` — log de atividades

**1.3 Página `/negocios` com duas views**

Toggle entre **Lista** e **Kanban** no header:

- **Listagem**: tabela paginada com colunas (Título, Processo CNJ, Pessoa, Tipo Serviço, Etapa, Valor, Responsável, Data Abertura). Filtros por etapa, status, responsável.
- **Kanban**: colunas = etapas do pipeline selecionado. Cards arrastáveis com título, valor, pessoa, data. Drag-and-drop atualiza `pipeline_etapa` e `ordem_kanban`.

Seletor de pipeline no header para trocar entre pipelines configurados.

**1.4 Sheet "Criar Negócio"**

Sheet à direita com campos: título, tipo serviço, pipeline/etapa, pessoa (select), processo vinculado (opcional), valor proposta, responsável, observações.

---

### Sprint 2 — Detalhe do Negócio e Atividades

**2.1 Página `/negocios/:id`**

Layout semelhante ao `ProcessoDetalhe`:
- Header com título, etapa atual (badge editável inline), valor, pessoa, processo vinculado (link)
- Botões: Marcar Ganho, Marcar Perdido, menu 3 pontos (placeholders)
- Tabs: Dados Gerais, Atividades, Campos Personalizados (entidade='negocio'), Histórico

**2.2 Tab Atividades**

Timeline de atividades (notas, ligações, emails, reuniões). Sheet para criar nova atividade.

**2.3 Tab Campos Personalizados**

Reutilizar a mesma estrutura de `TabAnalise` mas com `entidade='negocio'`, lendo de `campos_analise` e salvando em uma tabela `negocio_campos_valores` (mesma estrutura de `processo_campos_valores`).

---

### Sprint 3 — Configuração de Pipelines e Refinamentos

**3.1 Página de configuração de Pipelines**

Em Configurações, nova aba "Pipelines" para:
- Listar pipelines existentes
- Criar/editar pipeline (nome + lista de etapas ordenáveis com nome e cor)
- Definir pipeline padrão
- Seed com pipeline padrão: Qualificação → Proposta → Negociação → Fechamento

**3.2 Drag-and-drop no Kanban**

Implementar reordenação real com atualização otimista no banco.

**3.3 Dashboard de Negócios**

KPIs no topo da página: total em andamento, valor total pipeline, ganhos no mês, taxa de conversão.

---

### Resumo de arquivos

| Arquivo | Sprint | Ação |
|---|---|---|
| Migration: negocios cols + pipelines + atividades | 1 | Criar |
| `src/hooks/useNegocios.ts` | 1 | Refatorar |
| `src/hooks/useNegocioPipelines.ts` | 1 | Criar |
| `src/hooks/useNegocioAtividades.ts` | 2 | Criar |
| `src/pages/Negocios.tsx` | 1 | Reescrever (lista + kanban) |
| `src/components/negocios/NegocioKanban.tsx` | 1 | Criar |
| `src/components/negocios/NegocioListTable.tsx` | 1 | Criar |
| `src/components/negocios/NegocioSheet.tsx` | 1 | Criar (criar/editar) |
| `src/pages/NegocioDetalhe.tsx` | 2 | Criar |
| `src/components/negocios/TabAtividades.tsx` | 2 | Criar |
| `src/components/negocios/TabDadosGerais.tsx` | 2 | Criar |
| `src/pages/ConfigPipelines.tsx` | 3 | Criar |
| `src/App.tsx` | 1-2 | Adicionar rotas |
| `src/components/CrmSidebar.tsx` | 1 | Já tem link |

Vou implementar **Sprint 1** assim que aprovar.

