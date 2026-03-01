

## Plano: Redesign Processos > Triagem > Negócios

### 1. Schema — Migration SQL

Novas colunas na tabela `processos`:
- `vara_comarca` text nullable
- `classe_fase` text nullable (ex: "Cumprimento de Sentença")
- `triagem_motivo_inaptidao` text nullable (obrigatório quando inapto)

Nova coluna em `processo_partes`:
- `advogado_oab` text nullable (para registrar OAB de advogados)
- Expandir `tipo` para aceitar: autor, reu, exequente, executado, advogado, terceiro

Nova coluna em `processo_andamentos`:
- `documento_id` uuid nullable FK processo_documentos (link opcional ao documento)
- `resumo` text nullable (resumo curto de 1 linha)

### 2. Tela: Lista de Processos (Processos.tsx) — Redesign

Colunas da tabela:
- Nº CNJ (com link externo tribunal)
- Tribunal
- Vara/Comarca
- Classe/Fase
- Triagem (badge: Pendente/Apto/Inapto)
- Status Processo (Ativo/Arquivado/Suspenso)
- Trânsito em Julgado (Sim/Não)
- Valor Estimado
- Data Captação

Cards no topo: Total | Pendentes | Aptos | Descartados

Ações por linha (dropdown ou botões inline):
- Ver detalhes → navega para /processos/:id
- Triagem → navega para /processos/:id com tab triagem
- Enviar para Negócios (só se triagem = apto) → cria negócio direto

Filtros existentes mantidos + novos:
- Classe/Fase
- Faixa de valor (min/max)
- Texto livre busca também CPF/CNPJ de partes

### 3. Tela: Detalhe do Processo (ProcessoDetalhe.tsx) — Redesign

**Cabeçalho forte** com: CNJ, tribunal, vara/comarca, classe/fase, status, triagem badge, valor estimado, botão "Editar" e botão "Enviar para Negócios" (condicional).

Abas mantidas com melhorias:

**Dados Gerais** — Adicionar campos vara/comarca, classe/fase na edição inline. Adicionar links externos, informações de distribuição/autuação.

**Partes** — Expandir tipos (exequente, executado, advogado, terceiro). Mostrar OAB quando for advogado. Manter add/remove.

**Movimentações** (simplificada) — Substituir timeline por tabela simples:
- Colunas: Data/Hora | Título | Documento (link clicável + tipo) | Resumo
- Controles: busca por título, filtro "somente com documento", ordenação por data
- Formulário de adição com campo documento_id (select dos documentos do processo) e resumo
- Sem textos longos, foco em leitura rápida

**Documentos** — Manter como está (upload, download, delete, tipo)

**Triagem** — Adicionar campo motivo de inaptidão (obrigatório se inapto). Manter botões Apto/Reanálise/Descartar.

**Negócios** — Só visível se triagem = apto. Manter criação/listagem de negócios vinculados.

### 4. Regras de Negócio

- Processo começa com triagem = pendente
- Se triagem = apto: habilitar "Enviar para Negócios" no cabeçalho e na listagem
- Se triagem = inapto/descartado: exigir motivo e observação no formulário de triagem
- Ao criar negócio: vincular processo_id, puxar valor_estimado como valor_proposta

### 5. Sidebar (CrmSidebar.tsx)

Manter estrutura atual. Triagem já é acessada via Processos (filtro de triagem na listagem), não precisa de rota separada — mas manter `/triagem` como atalho que filtra processos com pipeline_status = triagem.

### 6. Resumo Técnico

- 1 migration SQL (alter processos + alter processo_partes + alter processo_andamentos)
- Reescrever `Processos.tsx` com novas colunas, ações por linha, cards stats
- Reescrever `TabAndamentos.tsx` de timeline para tabela simples com busca/filtro
- Atualizar `TabDadosGerais.tsx` com novos campos (vara_comarca, classe_fase)
- Atualizar `TabPartes.tsx` com tipos expandidos e campo OAB
- Atualizar `TabTriagem.tsx` com motivo de inaptidão obrigatório
- Atualizar `TabNegocios.tsx` para ser condicional (só se apto)
- Atualizar `ProcessoDetalhe.tsx` com cabeçalho forte e botão "Enviar para Negócios"
- Atualizar hooks `useProcessos.ts` para incluir novos campos nos filtros

